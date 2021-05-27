import later from '@breejs/later';
import { getDb, Job, JobsDb } from './db';
import onExit from 'signal-exit';
import { FilterQuery } from 'mongodb';

const IS_TEST_ENV = process.env.NODE_ENV === 'test';

// Minimum TTL of 5 minutes, to allow for time drift
const SLEEP_TIME = +(process.env.SLEEP_TIME || (IS_TEST_ENV ? 5 : 5_000));

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Uses Later.js to compute the next run time.
 */
function computeNextTime(schedule: string, after: Date) {
  // when the schedule includes letters, we assume that a textual presentation
  // like `in 5 minutes` or `every 5 minutes` is given. Otherwise, we assume cron
  // like syntax such as `0 17 ? * 0,4-6`
  const isCron = !/[a-z]/i.test(schedule);

  // split the cron string to see if there is a seconds component
  const hasSeconds = isCron && schedule.trim().split(' ').length === 6;

  const parsed = isCron
    ? later.parse.cron(schedule, hasSeconds)
    : later.parse.text(schedule);

  // return the first next timestamp rounded to full seconds
  const afterInWholeSeconds = Math.ceil(after.getTime() / 1000) * 1000;
  const schedules = later.schedule(parsed).next(2, afterInWholeSeconds);

  if (!Array.isArray(schedules)) {
    throw new Error(`Invalid schedule provided: ${schedule}`);
  }

  return schedules.find((x) => x > after);
}

function createJob(job: {
  name: Job['name'];
  schedule?: Job['schedule'] | 'once';
  data?: Job['data'];
  intended?: Job['intended'];
}): Omit<Job, '_id'> {
  const now = new Date();

  return {
    name: job.name,
    schedule: job.schedule === 'once' ? undefined : job.schedule,
    created: now,
    intended:
      !job.schedule || job.schedule === 'once'
        ? now
        : computeNextTime(job.schedule, now),
    data: job.data,
  };
}

export type JobHandler = (job: Job) => void | Promise<void>;
export type RunnerStatus = 'active' | 'stopping' | 'idle';

export interface RunnerOptions {
  name?: string;
  autoStart?: boolean;
}

export class Runner {
  #names: string[];
  #status: RunnerStatus = 'idle';
  #handlers = new Map<string, JobHandler>();
  #db: JobsDb = getDb();

  constructor(options: RunnerOptions = {}) {
    this.#names = options.name ? [options.name] : [];

    // graceful shutdown on kill signal
    onExit(this.stop);

    if (options.autoStart !== false) {
      this.run();
    }
  }

  /**
   * The job-loop
   * @private
   */
  private async run() {
    if (this.#status !== 'idle') {
      return;
    }

    this.#status = 'active';

    while (this.#status === 'active') {
      // sleep if there are no registered handlers
      if (!this.#names.length) {
        await sleep(SLEEP_TIME);
        continue;
      }

      // try take a job from the queue
      const job = await this.takeJob();

      // sleep if there is no scheduled job
      if (!job) {
        await sleep(SLEEP_TIME);
        continue;
      }

      // Process the job. Note that we only log errors. We do not reschedule failed
      // ones. This is for the end-user to implement.
      await this.processJob(job).catch((e) => {
        console.error(`[cron]: ${e.message}`);
      });
    }

    this.#status = 'idle';
  }

  /**
   * Take a job from the queue
   */
  async takeJob(): Promise<Job | null> {
    const now = new Date();

    const selector: FilterQuery<Job> = {
      intended: { $lte: now },
      started: { $exists: false },
      name: { $in: this.#names },
    };

    let job;

    // We run this in a transaction, because we don't want to start a job that we
    // fail to reschedule. Marking the job as started will result in removal by
    // the mongo TTL index.
    await this.#db.transaction(async (session) => {
      // the setTimout from sinon doesn't play nice with mongo transactions
      const options = process.env.NODE_ENV === 'test' ? {} : { session };

      const { value } = await this.#db.jobs.findOneAndUpdate(
        selector,
        { $set: { started: now } },
        options,
      );

      if (value?.schedule) {
        const next = createJob(value) as Job;
        await this.#db.jobs.insertOne(next, options);
      }

      job = value;
    });

    if (!job) {
      return null;
    }

    return job || null;
  }

  /**
   * Handle job with registered handlers
   * @param job
   */
  private async processJob(job) {
    const handler = this.#handlers.get(job.name);

    if (!handler) {
      throw new Error(`There is no handler registered for ${job.name}`);
    }

    return handler(job);
  }

  /**
   * Register job handlers. Every handler can only be registered once.
   *
   * @param name
   * @param handler
   */
  handle(name: string, handler: JobHandler) {
    if (this.#handlers.has(name)) {
      throw new Error(`There is already a handler for ${name}`);
    }

    this.#handlers.set(name, handler);
    this.#names.push(name);
  }

  /**
   * Start the runner if it has been stopped
   */
  async start() {
    if (this.#status !== 'idle') {
      return;
    }

    // reconnect to the database, as `stop` disconnects
    this.#db = getDb();
    this.run();
  }

  /**
   * Stop the job runner
   */
  async stop() {
    if (this.#status === 'active') {
      this.#status = 'stopping';

      // @ts-ignore
      while (this.#status !== 'idle') {
        await sleep(25);
      }
    }

    // something is going on here, when running with { autoStart: false }, this
    // can result in "Jest open-handle errors". I don't get what's keeping this open
    await this.#db.disconnect();
    this.#status = 'idle';
  }

  /**
   * Remove all jobs from db
   */
  async reset() {
    if (!this.#names.length) {
      return;
    }

    await this.#db.jobs.deleteMany({
      name: { $in: this.#names },
    });
  }

  /**
   * Schedule a job to be run now, or at some time in the future
   * @param schedule the schedule to run this job on
   * @param name a unique name for this job, used for load balancing
   * @param data additional data that will be passed to the job handler, or the job handler
   */
  async schedule(
    schedule: Job['schedule'] | 'once',
    name: Job['name'],
    data?: Job['data'] | JobHandler,
  ): Promise<Job> {
    const doc = createJob({
      schedule,
      name,
      data: typeof data === 'function' ? undefined : data,
    });

    if (typeof data === 'function') {
      this.handle(name, data);
    }

    if (doc.schedule) {
      const { value } = await this.#db.jobs.findOneAndUpdate(
        { name },
        { $set: doc },
        { upsert: true, returnDocument: 'after' },
      );

      return { _id: value!._id, ...doc } as Job;
    }

    const { insertedId } = await this.#db.jobs.insertOne(doc as Job);
    return { _id: insertedId, ...doc } as Job;
  }

  /**
   * Reschedule a failed job. This is handy for one-off jobs, but as recurring jobs
   * already run on a schedule, it's unlikely to be used for those.
   *
   * @param job the job to reschedule
   * @param timeout the number of minutes to wait before the retry
   */
  async reschedule(job: Job) {
    const next = createJob(job);

    // if this isn't a scheduled job, we rerun in 5 minutes from now
    if (!next.schedule) {
      next.intended = new Date(next.created.getTime() + 300_000);
    }

    const { insertedId } = await this.#db.jobs.insertOne(next as Job);
    return { _id: insertedId, ...next };
  }
}

const cron = new Runner();
export default cron;
