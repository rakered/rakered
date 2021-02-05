import { validatePaginationArgs } from './validatePaginationArgs';

test('throws when passed without object arg', () => {
  expect(() => validatePaginationArgs(null)).toThrowError(
    'You must provide arguments to properly paginate the connection.',
  );
});

test('requires either first or last option', () => {
  expect(() => validatePaginationArgs({})).toThrowError(
    'You must provide a `first` or `last` value to properly paginate the connection.',
  );
  expect(() => validatePaginationArgs({ first: 1, last: 1 })).toThrowError(
    'Passing both `first` and `last` to paginate the connection is not supported.',
  );
});

test('first and last option cannot be negative', () => {
  expect(() => validatePaginationArgs({ first: -1 })).toThrowError(
    'First should be non negative.',
  );
  expect(() => validatePaginationArgs({ last: -1 })).toThrowError(
    'Last should be non negative.',
  );
});

test('when order is provided, it should contain field and valid direction', () => {
  expect(() => validatePaginationArgs({ first: 1, order: [] })).toThrowError(
    'You must provide an `order` to properly paginate the connection.',
  );

  expect(() =>
    validatePaginationArgs({ first: 1, order: ['field'] }),
  ).toThrowError(
    'You must provide an `order` to properly paginate the connection.',
  );

  expect(() =>
    validatePaginationArgs({ first: 1, order: ['field', 'up'] }),
  ).toThrowError(
    'You must provide an `order` to properly paginate the connection.',
  );

  expect(() =>
    validatePaginationArgs({ first: 1, order: ['field', 'asc'] }),
  ).not.toThrow();

  expect(() =>
    validatePaginationArgs({ first: 1, order: ['field', 'desc'] }),
  ).not.toThrow();
});
