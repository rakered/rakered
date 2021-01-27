async function smokeTest(fn) {
  let msg;
  const log = console.log;
  console.log = jest.fn((data) => {
    msg = data;
  });

  await Promise.resolve(fn);

  console.log = log;
  return msg;
}

export default smokeTest;
