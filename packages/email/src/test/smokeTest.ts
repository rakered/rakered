import { addSmokeListener } from '../send';

async function smokeTest(fn) {
  let msg;

  addSmokeListener((email) => {
    msg = email;
  });

  await Promise.resolve(fn);
  return msg;
}

export default smokeTest;
