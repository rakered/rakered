// NOTE: Import order matters!, import the prototype extensions before MongoClient
import './collection';

import type { Db as MongoDb, MongoClientOptions } from 'mongodb';
import { MongoClient } from 'mongodb';
import picoid from 'picoid';
import { Collection, getCollection } from './collection';

export type Db = MongoDb & {
  connect: () => Promise<Db>;
  disconnect: MongoClient['close'];
} & Record<string, Collection<any>>;

export type Options = MongoClientOptions;

export function create(
  uri: string = process.env.MONGO_URL || 'mongodb://localhost:27017',
  options?: Options
): Db {
  let client: MongoClient;
  let db: Db;

  let collections = {};
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
    options
  );

  // 21-01-21 13:43
  async function getInstance() {
    if (instancePromise) {
      return instancePromise;
    }

    instancePromise = new Promise((resolve) => {
      MongoClient.connect(uri, clientOptions).then((mongoClient) => {
        client = mongoClient;

        db = client.db() as Db;
        db.disconnect = client.close.bind(client);

        resolve(db);
      });
    });

    return instancePromise;
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
          return db[name];
        }

        if (name === 'connect') {
          return getInstance;
        }

        if (collections[name]) {
          return collections[name];
        }

        collections[name] = getCollection({ name, getInstance });
        return collections[name];
      },
    }
  ) as Db;
}

export async function connect(uri?: string, options?: Options): Promise<Db> {
  const db = create(uri, options);
  await db.connect();
  return db;
}

const db = create();
export default db;
