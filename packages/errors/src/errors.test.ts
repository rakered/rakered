import * as errors from './errors';
import { UserInputError } from './errors';

test('errors return name and code', () => {
  for (const CustomError of Object.values(errors)) {
    const error = new CustomError('some error');

    expect(error.message).toEqual('some error');
    expect(typeof error.code).toEqual('number');
  }
});

test('UserInputError can hold data', () => {
  const error = new UserInputError('some error', {
    input: 'name',
    message: 'required',
  });

  expect(error.data).toEqual({
    input: 'name',
    message: 'required',
  });
});
