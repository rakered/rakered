import * as errors from './errors';

test('errors return name and code', () => {
  for (const CustomError of Object.values(errors)) {
    const error = new CustomError('some error');

    expect(error.message).toEqual('some error');
    expect(typeof error.code).toEqual('number');
  }
});
