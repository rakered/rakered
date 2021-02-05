import { connect, Db } from '../db';
import { getCursor, parseCursor } from './cursor';

let db: Db;

beforeAll(async () => {
  db = await connect();
  db.connectionCol.pkPrefix = 'con_';
});

interface Doc {
  _id: string;
  name: string;
  index: number;
  created: number;
}

beforeEach(async () => {
  await db.connectionCol.deleteMany({});

  const docs = Array.from({ length: 8 }).map((_, idx) => ({
    _id: `doc_${idx}`,
    name: `doc ${(idx + 1 + '').padStart(2, '0')}`,
    index: idx,
    created: 1000 + idx,
  }));

  await db.connectionCol.insertMany(docs);
});

afterAll(async () => {
  await db.disconnect(true);
});

test('can paginate forward', async () => {
  const page1 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'asc'],
      first: 3,
    },
  );

  expect(page1.nodes).toHaveLength(3);
  expect(page1.nodes[0]).toMatchPartial({ name: 'doc 01' });
  expect(page1.nodes[1]).toMatchPartial({ name: 'doc 02' });
  expect(page1.nodes[2]).toMatchPartial({ name: 'doc 03' });

  expect(page1).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: getCursor(page1.nodes[0], 'name'),
      endCursor: getCursor(page1.nodes[2], 'name'),
    },
  });

  const page2 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'asc'],
      first: 3,
      after: page1.pageInfo.endCursor,
    },
  );

  expect(page2.nodes).toHaveLength(3);
  expect(page2.nodes[0]).toMatchPartial({ name: 'doc 04' });
  expect(page2.nodes[1]).toMatchPartial({ name: 'doc 05' });
  expect(page2.nodes[2]).toMatchPartial({ name: 'doc 06' });

  expect(page2).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: getCursor(page2.nodes[0], 'name'),
      endCursor: getCursor(page2.nodes[2], 'name'),
    },
  });

  const page3 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'asc'],
      first: 3,
      after: page2.pageInfo.endCursor,
    },
  );

  expect(page3.nodes).toHaveLength(2);
  expect(page3.nodes[0]).toMatchPartial({ name: 'doc 07' });
  expect(page3.nodes[1]).toMatchPartial({ name: 'doc 08' });

  expect(page3).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: getCursor(page3.nodes[0], 'name'),
      endCursor: getCursor(page3.nodes[1], 'name'),
    },
  });
});

test('can paginate forward in reverse', async () => {
  const page1 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'desc'],
      first: 3,
    },
  );

  expect(page1.nodes).toHaveLength(3);
  expect(page1.nodes[0]).toMatchPartial({ name: 'doc 08' });
  expect(page1.nodes[1]).toMatchPartial({ name: 'doc 07' });
  expect(page1.nodes[2]).toMatchPartial({ name: 'doc 06' });

  expect(page1).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: getCursor(page1.nodes[0], 'name'),
      endCursor: getCursor(page1.nodes[2], 'name'),
    },
  });

  const page2 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'desc'],
      first: 3,
      after: page1.pageInfo.endCursor,
    },
  );

  expect(page2.nodes).toHaveLength(3);
  expect(page2.nodes[0]).toMatchPartial({ name: 'doc 05' });
  expect(page2.nodes[1]).toMatchPartial({ name: 'doc 04' });
  expect(page2.nodes[2]).toMatchPartial({ name: 'doc 03' });

  expect(page2).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: getCursor(page2.nodes[0], 'name'),
      endCursor: getCursor(page2.nodes[2], 'name'),
    },
  });

  const page3 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'desc'],
      first: 3,
      after: page2.pageInfo.endCursor,
    },
  );

  expect(page3.nodes).toHaveLength(2);
  expect(page3.nodes[0]).toMatchPartial({ name: 'doc 02' });
  expect(page3.nodes[1]).toMatchPartial({ name: 'doc 01' });

  expect(page3).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: getCursor(page3.nodes[0], 'name'),
      endCursor: getCursor(page3.nodes[1], 'name'),
    },
  });
});

test('can paginate backward', async () => {
  const page1 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'asc'],
      last: 3,
    },
  );

  expect(page1.nodes).toHaveLength(3);
  expect(page1.nodes[0]).toMatchPartial({ name: 'doc 06' });
  expect(page1.nodes[1]).toMatchPartial({ name: 'doc 07' });
  expect(page1.nodes[2]).toMatchPartial({ name: 'doc 08' });

  expect(page1).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: getCursor(page1.nodes[0], 'name'),
      endCursor: getCursor(page1.nodes[2], 'name'),
    },
  });

  const page2 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'asc'],
      last: 3,
      before: page1.pageInfo.startCursor,
    },
  );

  expect(page2.nodes).toHaveLength(3);
  expect(page2.nodes[0]).toMatchPartial({ name: 'doc 03' });
  expect(page2.nodes[1]).toMatchPartial({ name: 'doc 04' });
  expect(page2.nodes[2]).toMatchPartial({ name: 'doc 05' });

  expect(page2).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: getCursor(page2.nodes[0], 'name'),
      endCursor: getCursor(page2.nodes[2], 'name'),
    },
  });

  const page3 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'asc'],
      last: 3,
      before: page2.pageInfo.startCursor,
    },
  );

  expect(page3.nodes).toHaveLength(2);
  expect(page3.nodes[0]).toMatchPartial({ name: 'doc 01' });
  expect(page3.nodes[1]).toMatchPartial({ name: 'doc 02' });

  expect(page3).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: getCursor(page3.nodes[0], 'name'),
      endCursor: getCursor(page3.nodes[1], 'name'),
    },
  });
});

test('can paginate backward in reverse', async () => {
  const page1 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'desc'],
      last: 3,
    },
  );

  expect(page1.nodes).toHaveLength(3);
  expect(page1.nodes[0]).toMatchPartial({ name: 'doc 03' });
  expect(page1.nodes[1]).toMatchPartial({ name: 'doc 02' });
  expect(page1.nodes[2]).toMatchPartial({ name: 'doc 01' });

  expect(page1).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: getCursor(page1.nodes[0], 'name'),
      endCursor: getCursor(page1.nodes[2], 'name'),
    },
  });

  const page2 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'desc'],
      last: 3,
      before: page1.pageInfo.startCursor,
    },
  );

  expect(page2.nodes).toHaveLength(3);
  expect(page2.nodes[0]).toMatchPartial({ name: 'doc 06' });
  expect(page2.nodes[1]).toMatchPartial({ name: 'doc 05' });
  expect(page2.nodes[2]).toMatchPartial({ name: 'doc 04' });

  expect(page2).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: getCursor(page2.nodes[0], 'name'),
      endCursor: getCursor(page2.nodes[2], 'name'),
    },
  });

  const page3 = await db.connectionCol.paginate<Doc>(
    {},
    {
      sort: ['name', 'desc'],
      last: 3,
      before: page2.pageInfo.startCursor,
    },
  );

  expect(page3.nodes).toHaveLength(2);
  expect(page3.nodes[0]).toMatchPartial({ name: 'doc 08' });
  expect(page3.nodes[1]).toMatchPartial({ name: 'doc 07' });

  expect(page3).toMatchPartial({
    totalCount: 8,
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: getCursor(page3.nodes[0], 'name'),
      endCursor: getCursor(page3.nodes[1], 'name'),
    },
  });
});

test('can paginate on id', async () => {
  const page1 = await db.connectionCol.paginate<Doc>(
    {},
    {
      first: 3,
    },
  );

  expect(page1.nodes).toHaveLength(3);
  expect(page1.nodes[0]).toMatchPartial({ name: 'doc 01' });
  expect(page1.nodes[1]).toMatchPartial({ name: 'doc 02' });
  expect(page1.nodes[2]).toMatchPartial({ name: 'doc 03' });

  const page2 = await db.connectionCol.paginate<Doc>(
    {},
    {
      first: 3,
      after: page1.pageInfo.endCursor,
    },
  );

  expect(page2.nodes).toHaveLength(3);
  expect(page2.nodes[0]).toMatchPartial({ name: 'doc 04' });
  expect(page2.nodes[1]).toMatchPartial({ name: 'doc 05' });
  expect(page2.nodes[2]).toMatchPartial({ name: 'doc 06' });
});
