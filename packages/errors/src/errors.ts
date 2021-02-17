export class AuthenticationError extends Error {
  name = 'AuthenticationError';
  code = 401;
}

export class ForbiddenError extends Error {
  name = 'ForbiddenError';
  code = 403;
}

export class UserInputError extends Error {
  name = 'UserInputError';
  code = 422;
  data;

  constructor(
    message: string,
    data?: Record<string, any> | Record<string, any>[] | string[],
  ) {
    super(message);
    this.data = data;
  }
}

export class NotFoundError extends Error {
  name = 'NotFoundError';
  code = 404;
}
