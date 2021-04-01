import { addSmokeListener } from '../send';

async function smokeTest(fn) {
  let msg;

  addSmokeListener((email) => {
    msg = email;
  });

  const result = await Promise.resolve(fn);
  return [msg, result];
}

export default smokeTest;
