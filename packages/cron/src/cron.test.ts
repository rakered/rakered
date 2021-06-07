import cron, { JobHandler, Runner, RunnerOptions } from './cron';
import { Job } from './db';
import db from '@rakered/mongo';
import MockDate from 'mockdate';

const START_TIME = new Date('2020-01-01T00:00:00.000Z').getTime();
const ONE_MINUTE = 60 * 1000;
const FIVE_MINUTES = 5 * ONE_MINUTE;
const SIXTY_MINUTES = 60 * ONE_MINUTE;

// I've tried to make this function work with jest/sinon fake timers, but ran
// into trouble with Mongo (don't fake setTimeout!), and later with other async
// stuff. They don't play nice! Ideally, I'd like to schedule tasks over a longer
// time span, and fast foward time. But I failed to make that work. Now, we just
// run for 3 seconds, and schedule tasks in the next second instead of in minutes.
async function listen(
  runner: Runner,
  name?: string,
  handler?: JobHandler,
): Promise<Job[]> {
  const jobs: Job[] = [];

  runner.handle(name || 'job', async (job) => {
    jobs.push(job);
    handler?.(job);
  });

  await runner.start();

  let offset = 0;
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      MockDate.set(START_TIME + offset);
      offset += ONE_MINUTE;

      if (offset > SIXTY_MINUTES) {
        clearInterval(interval);
        runner.stop().then(() => resolve(jobs));
      }
    }, 5);
  });
}

async function getRunner(options?: RunnerOptions) {
  const runner = new Runner(options);
  await runner.reset();
  MockDate.set(START_TIME);
  return runner;
}

const _error = console.error;

beforeAll(async () => {
  MockDate.set(START_TIME);
  await cron.stop();
});

beforeEach(async () => {
  await db.jobs.deleteMany({});
  console.error = jest.fn();
});

afterEach(() => {
  MockDate.reset();
});

afterAll(async () => {
  await db.disconnect();
  await cron.stop();
  console.error = _error;
});

test('can schedule jobs', async () => {
  const runner = await getRunner({ autoStart: false });
  runner.handle('every-5', () => undefined);

  const scheduled = await runner.schedule('*/5 * * * *', 'every-5');

  expect(scheduled).toMatchPartial({
    name: 'every-5',
    schedule: '*/5 * * * *',
    created: new Date('2000-01-01T00:00:01.000Z'),
    intended: new Date('2000-01-01T00:05:00.000Z'),
  });

  // the job shouldn't be running directly
  expect(await runner.takeJob()).toEqual(null);

  // fast forward time 5 minutes
  await MockDate.set(START_TIME + FIVE_MINUTES);

  // now it should be runnable
  expect(await runner.takeJob()).toMatchPartial({
    name: 'every-5',
    schedule: '*/5 * * * *',
    intended: new Date('2000-01-01T00:05:00.000Z'),
  });

  // when the job has been processed, it shouldn't be taken again
  expect(await runner.takeJob()).toEqual(null);
  await runner.stop();
});

test('can handle one-off jobs and accepts data', async () => {
  const runner = await getRunner();
  await runner.schedule('once', 'once', { email: 'person@example.com' });

  const jobs = await listen(runner, 'once');

  expect(jobs).toHaveLength(1);
  expect(jobs).toMatchPartial([
    {
      name: 'once',
      data: { email: 'person@example.com' },
    },
  ]);
  await runner.stop();
});

test('can handle multiple jobs', async () => {
  const runner = await getRunner();
  await runner.schedule('every 10 minutes', 'every-10-min');
  const jobs = await listen(runner, 'every-10-min');

  expect(jobs).toHaveLength(5);

  jobs.every((job) => {
    expect(job).toMatchPartial({
      name: 'every-10-min',
      schedule: 'every 10 minutes',
    });

    expect(job.created.getTime()).toBeLessThan(job.intended.getTime());
  });

  await runner.stop();
});

test('can not register the same handler twice', async () => {
  const runner = await getRunner();
  runner.handle('delete-users', () => undefined);

  expect(() => runner.handle('delete-users', () => undefined)).toThrow(
    `There is already a handler for delete-users`,
  );

  await runner.stop();
});

test('gracefully logs errors in the handlers', async () => {
  const runner = await getRunner();
  await runner.schedule('once', 'delete-logs');

  await listen(runner, 'delete-logs', () => {
    throw new Error('oops');
  });

  expect(console.error).toHaveBeenCalledWith(`[cron]: oops`);
  await runner.stop();
});

test('can start a stopped runner', async () => {
  const runner = await getRunner();
  await runner.stop();

  await expect(runner.schedule('once', 'once')).rejects.toThrow(
    'Topology is closed, please connect',
  );

  await runner.start();
  await runner.schedule('once', 'once', { email: 'person@example.com' });

  const jobs = await listen(runner, 'once');

  expect(jobs).toHaveLength(1);
  expect(jobs).toMatchPartial([
    {
      name: 'once',
      data: { email: 'person@example.com' },
    },
  ]);
  await runner.stop();
});

test('throws error when incorrect schedules are given', async () => {
  const runner = await getRunner();

  await expect(runner.schedule('twice', 'twice?')).rejects.toThrow(
    'Invalid schedule provided: twice',
  );

  await expect(
    runner.schedule('every other week day', 'invalid cron'),
  ).rejects.toThrow('Invalid schedule provided: every other week day');

  await runner.stop();
});

test('can change job schedules in between restarts', async () => {
  const runner = await getRunner({ autoStart: false });

  await runner.schedule('*/5 * * * *', 'main job');
  const jobs = await db.jobs.find();
  expect(jobs).toHaveLength(1);
  expect(jobs[0]).toHaveProperty('schedule', '*/5 * * * *');

  await runner.schedule('*/10 * * * *', 'main job');
  const jobs2 = await db.jobs.find();
  expect(jobs2).toHaveLength(1);
  expect(jobs2[0]).toHaveProperty('schedule', '*/10 * * * *');

  await runner.stop();
});
