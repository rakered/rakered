import { connect, Db } from './db';

let db: Db;

beforeAll(async () => {
  db = await connect();
});

beforeEach(async () => {
  db.testCol.pkPrefix = undefined;
  await db.testCol.deleteMany({});
});

afterAll(async () => {
  await db.disconnect(true);
});

test('prefixes generated ids with pkPrefix', async () => {
  const result1 = await db.testCol.insertOne({ name: 'john' });
  expect(result1.insertedId).toHaveLength(17);

  db.testCol.pkPrefix = 'usr_';
  const result2 = await db.testCol.insertOne({ name: 'john' });
  expect(result2.insertedId).toHaveLength(21);
  expect(result2.insertedId).toMatch(/^usr_/);
});

test('still allows for server side id generation', async () => {
  const connection = await connect(undefined, {
    forceServerObjectId: true,
  });

  const col = connection.testCol;

  // insert
  const insertOneResult = await col.insertOne({ name: 'john' });
  expect(typeof insertOneResult.insertedId).not.toEqual('string');

  const insertManyResult = await col.insertMany([{ name: 'john' }]);
  Object.values(insertManyResult.insertedIds).forEach((id) => {
    expect(typeof id).not.toEqual('string');
  });

  // update
  const updateOneResult = await col.updateOne(
    { name: 'john' },
    { $set: { name: 'john doe' } },
    { upsert: true },
  );

  expect(typeof updateOneResult.upsertedId).not.toEqual('string');

  const updateManyResult = await col.updateMany(
    { name: 'john' },
    { $set: { name: 'john doe' } },
    { upsert: true },
  );

  expect(typeof updateManyResult.upsertedId).not.toEqual('string');

  // bulk
  const bulk = await col.initializeOrderedBulkOp();
  bulk.insert({ hi: 'there' });
  const bulkResult = await bulk.execute();

  const [inserted] = bulkResult.getInsertedIds() as any;
  expect(typeof inserted._id).not.toEqual('string');

  // bulk write
  const bulkWrite = await col.bulkWrite([
    { insertOne: { document: { hi: 'there' } } },
  ]);

  expect(typeof bulkWrite.insertedIds?.[0]).not.toEqual('string');

  await connection.disconnect();
});

test('cursor methods are returning results directly', async () => {
  const docs = [{ test: 1 }, { test: 2 }, { test: 3 }];
  await db.testCol.insertMany(docs);

  const findResult = await db.testCol.find({ test: { $exists: true } });
  expect(findResult).toMatchPartial(docs);

  const aggregateResult = await db.testCol.aggregate([
    {
      $match: { test: { $exists: true } },
    },
  ]);
  expect(aggregateResult).toMatchPartial(docs);

  const indexResult = await db.testCol.listIndexes();
  expect(indexResult).toMatchPartial([
    {
      name: '_id_',
      ns: 'test.testCol',
    },
  ]);
});

test('insertOne is augmented', async () => {
  const result = await db.testCol.insertOne({ name: 'john' });
  expect(typeof result.insertedId).toEqual('string');
});

test('insertMany is augmented', async () => {
  const result = await db.testCol.insertMany([
    { name: 'john' },
    { name: 'hi' },
  ]);

  Object.values(result.insertedIds).forEach((id) => {
    expect(typeof id).toEqual('string');
  });
});

test('updateOne is augmented', async () => {
  const { insertedId } = await db.testCol.insertOne({ name: 'john' });
  const { modifiedCount } = await db.testCol.updateOne(
    { _id: insertedId },
    { $set: { name: 'john doe' } },
  );
  expect(modifiedCount).toEqual(1);
});

test('updateMany is augmented', async () => {
  const { insertedId } = await db.testCol.insertOne({ name: 'john' });
  const { modifiedCount } = await db.testCol.updateMany(
    { _id: insertedId },
    { $set: { name: 'john doe' } },
  );

  const { upsertedId } = await db.testCol.updateMany(
    { name: 'update-many-upsert ' },
    { $set: { name: 'john doe' } },
    { upsert: true },
  );

  expect(modifiedCount).toEqual(1);
  expect(typeof upsertedId._id).toEqual('string');
});

test('updateOne.upsert is augmented', async () => {
  const { upsertedId } = await db.testCol.updateOne(
    { name: 'updateOne.upsert' },
    { $set: { name: 'updateOne.upsert-updated' } },
    { upsert: true },
  );

  expect(typeof upsertedId._id).toEqual('string');
});

test('updateMany.upsert is augmented', async () => {
  const { upsertedId } = await db.testCol.updateMany(
    { _id: 'updateMany.upsert' },
    { $set: { name: 'updateOne.upsert-updated' } },
    { upsert: true },
  );

  expect(typeof upsertedId._id).toEqual('string');
  // expect(modifiedCount).toEqual(1);
});

test('bulk insert is augmented', async () => {
  const bulk = await db.testCol.initializeOrderedBulkOp();
  bulk.insert({ name: 'john' });

  const result = await bulk.execute();

  const insertedIds = result.getInsertedIds() as {
    index: number;
    _id: string;
  }[];

  insertedIds.forEach(({ _id }) => {
    expect(typeof _id).toEqual('string');
  });
});

test('bulk upsert is augmented', async () => {
  const bulk = await db.testCol.initializeOrderedBulkOp();

  bulk
    .find({ name: 'john' })
    .upsert()
    .updateOne({ $setOnInsert: { name: 'john doe' } });

  bulk
    .find({ _id: '123' })
    .upsert()
    .updateOne({ $setOnInsert: { name: 'john doe' } });

  bulk.find({ _id: '456' }).update({ $set: { name: 'john' } });

  const result = await bulk.execute();
  result.getUpsertedIds().forEach(({ _id }) => {
    expect(typeof _id).toEqual('string');
  });
});

test('bulkWrite.insertOne is augmented', async () => {
  const result = await db.testCol.bulkWrite([
    { insertOne: { document: { name: 'john' } } },
    // @ts-ignore
    { insertOne: { name: 'john' } },
  ]);

  // @ts-ignore
  const insertedIds = Object.values(result.insertedIds);

  insertedIds.forEach((_id) => {
    expect(typeof _id).toEqual('string');
  });
});

test('bulkWrite.update is augmented', async () => {
  const result = await db.testCol.bulkWrite([
    {
      updateOne: {
        filter: { name: 'jack' },
        update: { $set: { name: 'jack doe' } },
        upsert: true,
      },
    },

    {
      updateMany: {
        filter: { name: 'jane' },
        update: { $set: { name: 'jane doe' } },
        upsert: true,
      },
    },
  ]);

  // @ts-ignore
  const insertedIds = Object.values(result.upsertedIds);

  insertedIds.forEach((_id) => {
    expect(typeof _id).toEqual('string');
  });
});
