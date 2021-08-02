// NOTE: Import order matters!, import the prototype extensions before MongoClient
import './collection';

import type {
  Db as MongoDb,
  MongoClientOptions,
  WithTransactionCallback,
} from 'mongodb';
import { MongoClient, TransactionOptions } from 'mongodb';
import picoid from 'picoid';
import { Collection, getCollection } from './collection';

export type Db = MongoDb & {
  connect: () => Promise<void>;
  disconnect: (force?: boolean) => Promise<void>;
  transaction: (
    fn: WithTransactionCallback,
    options?: TransactionOptions,
  ) => Promise<void>;
  client: MongoClient;
} & Record<string, Collection<any>>;

export type Options = MongoClientOptions & {
  autoDisconnect?: boolean;
};

export function create<TDb extends Db = Db>(
  uri: string = process.env.MONGO_URL || 'mongodb://localhost:27017',
  options?: Options,
): TDb {
  let client: MongoClient;
  let db: TDb;

  const collections = {};
  let instancePromise: Promise<Db>;

  function createPk({ collectionName }) {
    if (collections[collectionName].pkPrefix) {
      return collections[collectionName].pkPrefix + picoid();
    }

    return picoid();
  }

  const clientOptions: Options = Object.assign(
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      pkFactory: { createPk },
    },
    options,
  );

  async function getInstance() {
    if (instancePromise) {
      return instancePromise;
    }

    instancePromise = new Promise((resolve) => {
      MongoClient.connect(uri, clientOptions).then((mongoClient) => {
        client = mongoClient;

        db = client.db() as TDb;

        resolve(db);
      });
    });

    return instancePromise;
  }

  async function connect() {
    await getInstance();
  }

  async function disconnect(force) {
    if (!client) {
      /* istanbul ignore next */
      return;
    }

    await client.close(force);
  }

  async function transaction(
    fn: WithTransactionCallback,
    options?: TransactionOptions,
  ): Promise<void> {
    await connect();

    if (!client) {
      throw new Error('Client is undefined o.O');
    }

    const session = client.startSession();
    try {
      return await session.withTransaction(() => fn(session), options);
    } finally {
      await session.endSession();
    }
  }

  if (options?.autoDisconnect !== false) {
    process.on('exit', () => {
      disconnect(true).catch(() => undefined);
    });
  }

  return new Proxy(
    {},
    {
      get: function (obj, name) {
        if (typeof name !== 'string' || typeof obj[name] !== 'undefined') {
          /* istanbul ignore next */
          return obj[name];
        }

        if (db?.hasOwnProperty(name)) {
          /* istanbul ignore next */
          return db[name];
        }

        if (name === 'transaction') {
          return transaction;
        }

        if (name === 'connect') {
          return connect;
        }

        if (name === 'disconnect') {
          return disconnect;
        }

        if (collections[name]) {
          return collections[name];
        }

        collections[name] = getCollection({ name, getInstance });
        return collections[name];
      },
    },
  ) as TDb;
}

export async function connect(uri?: string, options?: Options): Promise<Db> {
  const db = create(uri, options);
  await db.connect();
  return db;
}

const db = create();
export default db;
