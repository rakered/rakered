import { getCursor, parseCursor } from './cursor';
import { FilterQuery, FindOneOptions, Collection } from 'mongodb';
import { validatePaginationArgs } from './validatePaginationArgs';

export interface Connection<T> {
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    endCursor: string | undefined;
    startCursor: string | undefined;
  };
  nodes: T[];
  edges: { cursor: string; node: T }[];
}

export type PaginationArgs<T extends Record<string, any>> = {
  sort?: [Extract<keyof T, string>, 'asc' | 'desc'];
  after?: string;
  before?: string;
  first?: number;
  last?: number;
};

export type ConnectionOptions<T> = Pick<FindOneOptions<T>, 'projection'> &
  PaginationArgs<T>;

export async function getConnection<T>(
  collection: Collection<T>,
  query: FilterQuery<T>,
  options: ConnectionOptions<T>,
): Promise<Connection<T>>;

export async function getConnection<T>(
  collection: Collection<T>,
  query: FilterQuery<T>,
  options: ConnectionOptions<T> & { type: 'nodes' },
): Promise<Omit<Connection<T>, 'edges'>>;

export async function getConnection<T>(
  collection: Collection<T>,
  query: FilterQuery<T>,
  options: ConnectionOptions<T> & { type: 'edges' },
): Promise<Omit<Connection<T>, 'nodes'>>;

export async function getConnection<T>(
  collection: Collection<T>,
  query: FilterQuery<T>,
  options: ConnectionOptions<T> & { type?: 'edges' | 'nodes' } = {},
): Promise<
  Connection<T> | Omit<Connection<T>, 'nodes'> | Omit<Connection<T>, 'edges'>
> {
  validatePaginationArgs(options);
  const { projection, after, before, first, last } = options;

  // flip sort dir when querying backwards
  const orderBy = options.sort?.[0] || '_id';
  const orderDir = (options.sort?.[1] === 'desc' ? -1 : 1) * (last ? -1 : 1);
  const operation = orderDir === 1 ? '$gt' : '$lt';

  // construct sort options
  const sort: Array<[string, number]> =
    orderBy === '_id'
      ? [[orderBy, orderDir]]
      : [
          [orderBy, orderDir],
          ['_id', orderDir],
        ];

  const limit = first ?? last ?? 100;
  const selector: any = { ...query };

  if (after || before) {
    let [offset, id] = parseCursor(before || after);
    offset = isNaN(offset as any) ? offset : Number(offset);

    if (orderBy === '_id') {
      selector._id = { [operation]: id };
    } else {
      selector.$or = [
        { [orderBy]: { [operation]: offset } },
        { [orderBy]: { $eq: offset }, _id: { [operation]: id } },
      ];
    }
  }

  let [totalCount, nodes] = await Promise.all([
    collection.countDocuments(query),
    collection
      .find<T>(selector, { sort, limit: limit + 1, projection })
      .toArray(),
  ]);

  const hasMore = nodes.length > limit;
  const hasPreviousPage = !!(after || (last && hasMore));
  const hasNextPage = !!(before || (first && hasMore));

  nodes =
    last && !before ? nodes.splice(0, limit).reverse() : nodes.splice(0, limit);

  if (before) {
    nodes.reverse();
  }

  const edges = nodes.map((node) => ({
    node,
    cursor: getCursor(node, orderBy),
  }));

  const connection: any = {
    totalCount,
    pageInfo: {
      startCursor: edges[0]?.cursor || undefined,
      endCursor: edges[edges.length - 1]?.cursor || undefined,
      hasPreviousPage,
      hasNextPage,
    },
    nodes,
    edges,
  };

  if (options.type === 'nodes') {
    delete connection.edges;
  }

  if (options.type === 'edges') {
    delete connection.nodes;
  }

  return connection;
}
