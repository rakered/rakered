import Collection from 'mongodb/lib/collection';
import { BulkOperationBase } from 'mongodb/lib/bulk/common';

import {
  ClientSession,
  Collection as MongoCollection,
  CollectionAggregationOptions,
  CommonOptions,
  FilterQuery,
  FindOneOptions,
  OrderedBulkOperation,
  ReadPreferenceOrMode,
  UnorderedBulkOperation,
  UpdateOneOptions,
} from 'mongodb';
import {
  Connection,
  ConnectionOptions,
  getConnection,
} from './connection/connection';

interface ListIndexOptions {
  batchSize?: number;
  readPreference?: ReadPreferenceOrMode;
  session?: ClientSession;
}

interface IndexResult {
  v: number;
  key: { _id: number };
  name: string;
  ns: string;
  unique: boolean;
  sparse: boolean;
}

export type Collection<TSchema> = Omit<
  MongoCollection<TSchema>,
  | 'find'
  | 'aggregate'
  | 'listIndexes'
  | 'initializeOrderedBulkOp'
  | 'initializeUnorderedBulkOp'
> & {
  pkPrefix?: string;
  find<T = TSchema>(
    query?: FilterQuery<TSchema>,
    options?: FindOneOptions<T extends TSchema ? TSchema : T>,
  ): Promise<T[]>;
  aggregate<T = TSchema>(
    /* eslint-disable-next-line @typescript-eslint/ban-types */
    pipeline?: object,
    options?: CollectionAggregationOptions,
  ): Promise<T[]>;

  paginate<T = TSchema>(
    query1: FilterQuery<TSchema>,
    options?: ConnectionOptions<T extends TSchema ? TSchema : T>,
  ): Promise<Connection<T>>;

  paginate<T = TSchema>(
    query2: FilterQuery<TSchema>,
    options: ConnectionOptions<T extends TSchema ? TSchema : T> & {
      type: 'nodes';
    },
  ): Promise<Omit<Connection<T>, 'edges'>>;

  paginate<T = TSchema>(
    query3: FilterQuery<TSchema>,
    options: ConnectionOptions<T extends TSchema ? TSchema : T> & {
      type: 'edges';
    },
  ): Promise<Omit<Connection<T>, 'nodes'>>;

  listIndexes(options?: ListIndexOptions): Promise<IndexResult[]>;
  initializeOrderedBulkOp(
    options?: CommonOptions,
  ): Promise<OrderedBulkOperation>;
  initializeUnorderedBulkOp(
    options?: CommonOptions,
  ): Promise<UnorderedBulkOperation>;
};

function isCursor(res) {
  return typeof res?.then !== 'function' && typeof res?.toArray === 'function';
}

function wrapCursor(method, args: any[], res) {
  switch (method) {
    case 'find':
      return args[1]?.rawCursor ? res : res.toArray();
    case 'aggregate':
      return args[1]?.rawCursor ? res : res.toArray();
    case 'listIndexes':
      return args[0]?.rawCursor ? res : res.toArray();
    default:
      /* istanbul ignore next */
      return res;
  }
}

// This method turns ALL mongo methods into promisses. That means that there
// there are a few differences with the native mongodb driver.
//   collection.find, now returns a Promise<T[]> unless queried with rawCursor
//   collection.aggregate, now returns a Promise<T[]>, unless queried with rawCursor
//   collection.listIndexes, now returns a Promise<T[]>, unless queried with rawCursor
//   collection.initializeOrderedBulkOp now returns a Promise<void>
//   collection.initializeUnorderedBulkOp now returns a Promise<void>
export function getCollection({ getInstance, name }) {
  return new Proxy(
    { pkPrefix: '' },
    {
      get: function (obj, method) {
        if (typeof method !== 'string' || typeof obj[method] !== 'undefined') {
          return obj[method];
        }

        if (method === 'pkPrefix') {
          return obj.pkPrefix;
        }

        return async (...args) => {
          const db = await getInstance();

          const collection = db.collection(name);
          const res = collection[method](...args);
          return isCursor(res) ? wrapCursor(method, args, res) : res;
        };
      },
    },
  );
}

function forceServerObjectId(instance) {
  // I can't seem to touch this line, even tho this is what the native driver
  // uses. Instead, we have the settings a bit lower, mentioning the weird thing.
  if (typeof instance.s.options.forceServerObjectId === 'boolean') {
    /* istanbul ignore next */
    return instance.s.options.forceServerObjectId;
  }

  // weird thing, native driver doesn't check here, but this is where the settings are :/
  if (typeof instance.s.db?.s.options.forceServerObjectId === 'boolean') {
    return instance.s.db.s.options.forceServerObjectId;
  }

  if (instance.s.collection) {
    return instance.s.collection.s.db.options.forceServerObjectId;
  }

  return false;
}

function createPk(instance) {
  const collection = instance.s.collection || instance;

  const options = {
    dbName: collection.dbName,
    collectionName: collection.collectionName,
  };

  return collection.s.pkFactory.createPk(options);
}

Collection.prototype.paginate = async function findPage<T>(
  filter: FilterQuery<T>,
  options: ConnectionOptions<T>,
) {
  return getConnection(this, filter, options);
};

const _insertOne = Collection.prototype.insertOne;
Collection.prototype.insertOne = async function insertOne(doc, options) {
  if (forceServerObjectId(this)) {
    return _insertOne.apply(this, [doc, options]);
  }

  doc._id = doc._id || createPk(this);

  return _insertOne.apply(this, [doc, options]);
};

const _insertMany = Collection.prototype.insertMany;
Collection.prototype.insertMany = async function insertMany(docs, options) {
  if (forceServerObjectId(this)) {
    return _insertMany.apply(this, [docs, options]);
  }

  for (const doc of docs) {
    doc._id = doc._id || createPk(this);
  }

  return _insertMany.apply(this, [docs, options]);
};

const _updateOne = Collection.prototype.updateOne;
Collection.prototype.updateOne = async function updateOne(
  filter,
  update,
  options: UpdateOneOptions = {},
) {
  if (forceServerObjectId(this)) {
    return _updateOne.apply(this, [filter, update, options]);
  }

  if (options.upsert && !filter._id) {
    update.$setOnInsert = update.$setOnInsert || {};
    update.$setOnInsert._id = update.$setOnInsert._id || createPk(this);
  }

  return _updateOne.apply(this, [filter, update, options]);
};

const _updateMany = Collection.prototype.updateMany;
Collection.prototype.updateMany = async function updateMany(
  filter,
  update,
  options: UpdateOneOptions = {},
) {
  if (forceServerObjectId(this)) {
    return _updateMany.apply(this, [filter, update, options]);
  }

  if (options.upsert && !filter._id) {
    update.$setOnInsert = update.$setOnInsert || {};
    update.$setOnInsert._id = update.$setOnInsert._id || createPk(this);
  }

  return _updateMany.apply(this, [filter, update, options]);
};

const _findOneAndUpdate = Collection.prototype.findOneAndUpdate;
Collection.prototype.findOneAndUpdate = async function findOneAndUpdate(
  filter,
  update,
  options,
) {
  if (forceServerObjectId(this)) {
    return _findOneAndUpdate.apply(this, [filter, update, options]);
  }

  if (options.upsert && !filter._id) {
    update.$setOnInsert = update.$setOnInsert || {};
    update.$setOnInsert._id = update.$setOnInsert._id || createPk(this);
  }

  return _findOneAndUpdate.apply(this, [filter, update, options]);
};

const _bulkInsert = BulkOperationBase.prototype.insert;
BulkOperationBase.prototype.insert = function insert(doc) {
  if (forceServerObjectId(this)) {
    return _bulkInsert.apply(this, [doc]);
  }

  doc._id = doc._id || createPk(this);
  return _bulkInsert.apply(this, [doc]);
};

const _bulkRaw = BulkOperationBase.prototype.raw;
BulkOperationBase.prototype.raw = async function raw(op) {
  if (forceServerObjectId(this)) {
    return _bulkRaw.apply(this, [op]);
  }

  // Update operations, note that we cannot generate ids for updateMany ops
  if (op.updateOne?.upsert && !op.updateOne.filter?._id) {
    const update = op.updateOne.update;
    update.$setOnInsert = update.$setOnInsert || {};
    update.$setOnInsert._id = update.$setOnInsert._id || createPk(this);
  }

  // Note that this WILL give issues when the upsert results in multiple upserts,
  // but who does that! The docs do mention:
  //   _To avoid multiple upserts, ensure that filter fields are uniquely indexed_
  if (op.updateMany?.upsert && !op.updateMany.filter?._id) {
    const update = op.updateMany.update;
    update.$setOnInsert = update.$setOnInsert || {};
    update.$setOnInsert._id = update.$setOnInsert._id || createPk(this);
  }

  // Insert operations
  if (op.insertOne?.document) {
    op.insertOne.document._id = op.insertOne.document._id || createPk(this);
  } else if (op.insertOne) {
    op.insertOne._id = op.insertOne._id || createPk(this);
  }

  if (op.insertMany) {
    for (let i = 0; i < op.insertMany.length; i++) {
      op.insertMany[i]._id = op.insertMany[i]._id || createPk(this);
    }
  }

  return _bulkRaw.apply(this, [op]);
};

const _bulkFind = BulkOperationBase.prototype.find;
BulkOperationBase.prototype.find = function find(selector) {
  const op = _bulkFind.apply(this, [selector]);

  const _update = op.update;
  op.update = function update(document) {
    return _update.apply(this, [document]);
  };

  const _updateOne = op.updateOne;
  op.updateOne = function updateOne(document) {
    if (this.s.currentOp.upsert && !selector._id) {
      document.$setOnInsert = document.$setOnInsert || {};
      document.$setOnInsert._id = document.$setOnInsert._id || createPk(this);
    }

    return _updateOne.apply(this, [document]);
  };

  return op;
};
