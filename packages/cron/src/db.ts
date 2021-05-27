import { create, Collection, Db } from '@rakered/mongo';

export interface Job {
  _id: string;
  name: string;
  created: Date;
  intended: Date;
  started?: Date;
  schedule?: string;
  data?: Record<string, unknown>;
}

export type JobsDb = Db & {
  jobs: Collection<Job>;
};

export function getDb(): JobsDb {
  const db = create<JobsDb>();
  db.jobs.pkPrefix = 'job_';

  db.jobs.createIndex(
    { started: 1 },
    { expireAfterSeconds: 300, name: 'job-ttl' },
  );

  return db;
}
