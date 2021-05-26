# @rakered/mongo

A tiny but elegant wrapper around the [native mongodb] driver for Node.js, removing boilerplate and fixing id generation.

![social image](https://github.com/rakered/rakered/raw/main/packages/mongo/docs/social.jpg)

## Usage

Connections to mongodb are established when they're needed. Lazily. You don't need to handle this yourself, it's handled for you. Connection strings in this library always default to `process.env.MONGO_URL`, or to `mongodb://localhost:27017` if the env key is not set.

```js
import db from '@rakered/mongo';

await db.comments.insertOne({ body: 'Oh my! Is that all?!' });
```

### Create

The connection is established when the collection method is invoked. In the example above, that is the moment that `insertOne` is executed. If you wish to have more control over the connection, for example because you need to connect to multiple databases at the same time, you can use the `create`` method.

```js
import { create } from '@rakered/mongo';

const db = create('mongodb://example.com:27017/rakered', {
  /* mongo options */
});
await db.users.findOne({ username: 'smeijer' });
```

### Connect

It's possible that you need to connect early, because you don't want to let the first user wait for the connection to be established. Lazy connect works nice in dev environments or cli tooling, but it's not always what we want in web production. The `connect` method makes early connect dead simple.

```js
import { connect } from '@rakered/mongo';

const db = await connect();
await db.users.findOne({ username: 'smeijer' });
```

The example above does not have any performance benefit, but you can imagine that when the `findOne` statement is running in an express handler, it's nice to have that connection ready when the user hits your endpoint.

The `connect` method is a simple wrapper around `create`

```ts
async function connect(uri?: string, options?: Options): Promise<Db> {
  const db = create(uri, options);
  await db.connect();
  return db;
}
```

### Disconnect

Now, if you're working with a script and needing to close the connection, `db` has a method for that:

```js
await db.disconnect();
```

## Differences with Native Driver

All methods return promises. This choice was made to keep our codebase simple, while being able to offer the lazy connections. Most of the mongodb native collection methods already return promises, the differences are listed below. Methods that are not listed here, act the same as the native mongodb variant.

### `pkFactory` & `pkPrefix`

We use `picoid` as `pkFactory`, and have hot-patched the native driver to add support for bulk operations as well.

In addition to the native driver, it's possible to configure id prefixes per collection. Note that separators are not automatically added! It's for you to decide if you want to use prefixes, and if you want to include a separator, and if so, which character it should be.

```js
db.customers.pkPrefix = 'cus_';

db.customers.insertOne({ name: 'Stephan' });
// » customer._id is now cus_vsrd…
```

### `db.collection.find`

The find method now returns a promise, which directly resolves the results. There is no more need to call `toArray()`.

```js
await db.users.find({ ... });
// » User[]
```

### `db.collection.aggregate`

The aggregate method now returns a promise, which directly resolves the results. There is no more need to call `toArray()`.

```js
await db.users.aggregate([{ ... }])
// » User[]
```

### `db.collection.paginate`

The paginate method is an addition to the native methods, that can be used for (relay style) cursor based pagination. It resolves to a connection with nodes, edges, and pageInfo.

Use the optional `type` option to limit the response to either `nodes` or `edges`.

```js
await db.users.paginate({ ... }, { first: 10, sort: ['name', 'asc'], after: '...' })
/* » {
 nodes: User[],
 edges: { cursor: string, node: User }[],
 totalCount: number;
 pageInfo: {
   hasNextPage: boolean;
   hasPreviousPage: boolean;
   endCursor: string;
   startCursor: string;
 }
} */
```

### `db.collection.listIndexes`

The listIndexes method now returns a promise, which directly resolves the results. There is no more need to call `toArray()`.

```js
await db.users.listIndexes([{ ... }])
// » Index[]
```

### `db.collection.initializeOrderedBulkOp`

This method now returns a promise, while it's a sync method in the native driver.

```js
const bulk = await db.users.initializeOrderedBulkOp();
```

### `db.collection.initializeOrderedBulkOp`

This method now returns a promise, while it's a sync method in the native driver.

```js
const bulk = await db.users.initializeUnorderedBulkOp();
```

### `db.transaction`

Run operations inside a transaction.

```js
await db.transaction(async (session) => {
  const amount = 1000;

  await db.accounts.updateOne(
    { name: 'sender' },
    { $inc: { balance: -amount } },
    { session },
  );

  await db.accounts.updateOne(
    { name: 'receiver' },
    { $inc: { balance: amount } },
    { session },
  );
});
```

## Good to knows

This library wraps the native mongo driver, and adds a few restrictions to it. Let's talk about those.

1. Every collection method, now returns a promise. We don't support the callback
   style, and unlike the native drivers, the collection methods `find`, `aggregate`, `listIndexes`, `initializeOrderedBulkOp` and `initializeUnorderedBulkOp` return promises as well.

2. We wrap the `db` object to get a mongo shell kind of feeling, where you don't need to write `db.getCollection('test').insert` but can simply call `db.test.insert`. This does mean that some names should not be picked as collection name as those will result in name conflicts. The reserved are `s`, `serverConfig`, `bufferMaxEntries`, `databaseName` and `close`. I believe that's manageable.

3. We've added a `disconnect` handler to the `db`, which proxies `client.close`. Just for developer convenience.

4. We also use `picoid` to generate string based random ids. The Mongo ObjectID has its good side, but it makes `_id` handling and parsing quite verbose. Strings are easier to work with.
5. As MongoDB [didn't feel for fixing] their `pkfactory` to support custom id's in bulk upserts because _"It would deviate from other drivers that do not have this behavior"_, we've patched that in this library.

[native mongodb]: https://github.com/mongodb/node-mongodb-native
[didn't feel for fixing]: https://github.com/mongodb/node-mongodb-native/pull/2193
