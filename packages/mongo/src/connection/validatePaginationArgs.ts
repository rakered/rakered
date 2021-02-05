import { UserInputError } from '@rakered/errors';

export function validatePaginationArgs(params) {
  if (!params || typeof params !== 'object') {
    throw new UserInputError(
      'You must provide arguments to properly paginate the connection.',
    );
  }

  if (!params.first && !params.last) {
    throw new UserInputError(
      'You must provide a `first` or `last` value to properly paginate the connection.',
    );
  }

  if (params.first && params.last) {
    throw new UserInputError(
      'Passing both `first` and `last` to paginate the connection is not supported.',
    );
  }

  if (params.last && params.last < 0) {
    throw new UserInputError('Last should be non negative.');
  }

  if (params.first && params.first < 0) {
    throw new UserInputError('First should be non negative.');
  }

  const [field, direction] = params.order || [];
  if (
    params.order &&
    (!field || (direction !== 'asc' && direction !== 'desc'))
  ) {
    throw new UserInputError(
      'You must provide an `order` to properly paginate the connection.',
    );
  }
}
