import { create } from './db';

export * from './db';
export * from './collection';
export type {
  ConnectionOptions,
  PaginationArgs,
  Connection,
} from './connection/connection';

const db = create();
export default db;
