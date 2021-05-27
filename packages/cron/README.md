# @rakered/cron

Lightweight job scheduling for Node.js, backed by a mongo database.

![social image](https://github.com/rakered/rakered/raw/main/packages/cron/docs/social.jpg)

## Usage

This cron-runner schedules jobs, and runs the handlers when the time comes. All jobs are stored in a mongodb collection, to support persistence and load balancing. Spawn as many services as you like, and every job is guaranteed to be only run once. R

The database connection is managed with [@rakered/mongo][rakered/mongo]. The runner will connect to the MongoDB instance that's available under `process.env.MONGO_URL`, and will use the `jobs` collection to save and read the documents.

```js
import cron from '@rakered/cron';

cron.schedule('every 5 minutes', 'purge', (job) => {
  console.log('house cleaning…');
});
```

### Error handling

Rescheduling failed jobs, falls within the responsibility of your job handler.

```js
import cron from '@rakered/cron';

cron.schedule('once', 'purge', (job) => {
  try {
    console.log('house cleaning…');
  } catch (error) {
    cron.reschedule(job);
  }
});
```

### `schedule(schedule, name, data | handler)`

This method is used to schedule the jobs. It's possible to provide a handler directly, or later via the `.handle` method. Providing handlers directly, results in more compact code. Providing them separately, allows separating job scheduling from job handling. Depending on the work load, it might be nice to schedule jobs in your main app, while handling them in a microservice.

- **schedule** _String_

  The schedule can be defined by either a cron expression, with or without second segment, or a text expression. Using the cron would look like `15 10 * * ? *`, while the text looks like `every 15 seconds`.

- **name** _String_

  Job names should be unique. This is used to ensure that every job is only run once, even when multiple runners are active.

- **data** _Record<string, unknown> | (job: Job) => Promise<void>_

  When providing a function, the function will act as handler. In all other cases, the data will be saved along with the job definition, and provided to the handler that's being defined by `.handle`.

```js
import cron from '@rakered/cron';

cron.schedule('*/5 * * * *', 'clean-house', { houseKeeper: 'some person' });

cron.schedule('every 5 minutes', 'get-coffee', (job) => {
  console.log('house cleaning…');
});
```

### `scheduleMany(name, data[])`

This method is used to schedule multiple jobs of the same type, to run as soon as possible. The job will be run once for each dataset. This method can be used to easily distribute load across various job runners or even servers.

- **name** _String_

  The name of the job that should be run.

- **data** _Record<string, unknown>[]_

  The datasets to schedule this job for. There will be created a single job, for each dataset.

```js
import cron from '@rakered/cron';

cron.scheduleMany('send-daily-digest', [
  { email: 'person-one@example.com' },
  { email: 'person-two@example.com' },
]);
```

### `reschedule(job)`

This method is used to reschedule failed jobs. Note that recurring jobs already run on a schedule, so reschedule those with caution. Jobs that are run once, can safely be rescheduled, but make sure that the error is something that can be overcome by time. Don't expect different outcomes from trying the same thing twice.

Rescheduled jobs, will run again 5 minutes after rescheduling.

- **job** _Job_

  The job that's being passed to the job handler.

```js
import cron from '@rakered/cron';

cron.schedule('*/5 * * * *', 'clean-house', { houseKeeper: 'some person' });

cron.schedule('once', 'get-coffee', (job) => {
  try {
    console.log('house cleaning…');
  } catch (e) {
    cron.reschedule(job, 5);
  }
});
```

### `handle(name, handler)`

The handle method can be used to register handlers for specific job types. The `name` should match a name from jobs that are being `scheduled`.

- **name** _String_

  The name of the job. Only jobs that are being `scheduled` with the same name will be received by this handler.

- **handler** _(job: Job): Promise<void>_

  The function that should be invoked when a job of this type is being triggered.

```js
import cron from '@rakered/cron';

cron.handle('purge', (job) => {
  console.log('house cleaning…');
});
```

[rakered/mongo]: https://github.com/rakered/rakered/tree/main/packages/mongo
