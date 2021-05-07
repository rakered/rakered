import smokeTest from '@rakered/email/lib/test/smokeTest';
import fetchCookie from 'fetch-cookie';
import http from 'http';
import { apiResolver } from 'next/dist/next-server/server/api-utils';
import nodeFetch from 'node-fetch';
import listen from 'test-listen';

import { handleAuth } from './auth';

const fetch = fetchCookie(nodeFetch);

let server;
let url;
let accounts;

const consoleError = console.error;

beforeAll(async () => {
  console.error = () => undefined;
  const authApi = handleAuth();
  accounts = authApi.context.accounts;

  const requestHandler = (req, res) => {
    const slug = req.url.replace('/api/auth', '').split('/').filter(Boolean);
    const query = { slug };

    // @ts-ignore
    return apiResolver(req, res, query, authApi, null, null);
  };
  server = http.createServer(requestHandler);
  url = await listen(server);
});

beforeEach(async () => {
  await accounts.collection.deleteMany({
    'emails.address': /@example.com/i,
  });

  await accounts.createUser({
    email: 'hunter@example.com',
    username: 'AzureDiamond',
    password: 'hunter2',
  });
});

afterAll(async () => {
  console.error = consoleError;
  await accounts.disconnect();
  await server.close();
});

async function post(path, data, cookies = {}) {
  const response = await fetch(url + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; '),
    },
    body: JSON.stringify(data),
  });

  const type = response.headers.get('content-type') || '';
  const body = type.startsWith('application/json')
    ? await response.json()
    : await response.text();

  return { status: response.status, headers: response.headers, body };
}

function expectTokenResult(given, partial = { email: 'hunter@example.com' }) {
  expect(given.accessToken).toBeTruthy();
  expect(given.refreshToken).toBeTruthy();
  expect(given.user).toMatchPartial(partial);
}

test('can create account', async () => {
  const { status, headers, body } = await post(`/api/auth/create-account`, {
    email: 'other-hunter@example.com',
    password: 'hunter',
  });

  expect(status).toEqual(200);
  expect(headers.get('content-type')).toMatch(/application\/json/);

  expectTokenResult(body, { email: 'other-hunter@example.com' });
});

test('can login', async () => {
  const { status, headers, body } = await post('/api/auth/login', {
    email: 'hunter@example.com',
    password: 'hunter2',
  });

  expect(status).toEqual(200);
  expect(headers.get('content-type')).toMatch(/application\/json/);

  expectTokenResult(body);
});

test('returns error on invalid credentials', async () => {
  const { status, headers, body } = await post('/api/auth/login', {
    email: 'hunter@example.com',
    password: 'secret',
  });

  expect(status).toEqual(422);
  expect(headers.get('content-type')).toMatch(/application\/json/);

  expect(body).toMatchPartial({
    message: 'Incorrect credentials provided.',
  });
});

test('can refresh token', async () => {
  const loginResponse = await post('/api/auth/login', {
    email: 'hunter@example.com',
    password: 'hunter2',
  });

  const cookies = loginResponse.body;

  // Cookie is not automatically included in the fetch, so pass it in manually
  const { status, headers, body } = await post(
    '/api/auth/refresh-token',
    {},
    cookies,
  );

  expect(status).toEqual(200);
  expect(headers.get('content-type')).toMatch(/application\/json/);

  expect(body.accessToken).not.toEqual(loginResponse.body.accessToken);
  expect(body.refreshToken).not.toEqual(loginResponse.body.refreshToken);

  expectTokenResult(body);
});

test('can logout', async () => {
  const loginResponse = await post('/api/auth/login', {
    email: 'hunter@example.com',
    password: 'hunter2',
  });

  const cookies = loginResponse.body;

  // Cookie is not automatically included in the fetch, so pass it in manually
  const { status, headers, body } = await post('/api/auth/logout', {}, cookies);

  expect(status).toEqual(200);
  expect(headers.get('content-type')).toMatch(/application\/json/);

  expect(body).toEqual({ ok: true });
  expect(body).not.toHaveProperty('accessToken');
  expect(body).not.toHaveProperty('refreshToken');
});

test('can reset password', async () => {
  // request and parse forgot-password mail
  const [email] = await smokeTest(
    post('/api/auth/reset-password', {
      email: 'hunter@example.com',
    }),
  );

  const token = email.match(/\/reset-password\/(.*)\s/)[1];

  // reset password
  const { status, headers, body } = await post('/api/auth/reset-password', {
    token,
    password: 'secret',
  });

  expect(status).toEqual(200);
  expect(headers.get('content-type')).toMatch(/application\/json/);
  expectTokenResult(body);

  // can log in with new password
  const loginResponse = await post('/api/auth/login', {
    email: 'hunter@example.com',
    password: 'secret',
  });

  expect(loginResponse.status).toEqual(200);
  expectTokenResult(loginResponse.body);

  // can't login with old password
  const oldPasswordLoginResponse = await post('/api/auth/login', {
    email: 'hunter@example.com',
    password: 'hunter2',
  });

  expect(oldPasswordLoginResponse.status).toEqual(422);
  expect(oldPasswordLoginResponse.body).toEqual({
    message: 'Incorrect credentials provided.',
  });
});

test('can verify email', async () => {
  // request and parse forgot-password mail
  const [email] = await smokeTest(
    post('/api/auth/verify-email', {
      email: 'hunter@example.com',
    }),
  );

  const token = email.match(/\/verify-email\/(.*)\s/)[1];

  // verify email
  const { status, headers, body } = await post('/api/auth/verify-email', {
    token,
  });

  // all we do is verify if we got a positive result. We don't really verify
  // if the email is now marked as verified. That's up to the accounts lib.
  expect(status).toEqual(200);
  expect(headers.get('content-type')).toMatch(/application\/json/);
  expectTokenResult(body);
});

test('can request enroll account email', async () => {
  // request and parse enroll account mail
  const [email] = await smokeTest(
    post('/api/auth/create-account', {
      email: 'hunter-invited@example.com',
    }),
  );

  const token = email.match(/\/enroll-account\/(.*)\s/)[1];

  // verify email
  const { status, headers, body } = await post('/api/auth/enroll-account', {
    token,
    password: 'hunter2',
  });

  // all we do is verify if we got a positive result. We don't really verify
  // if the email is now marked as verified. That's up to the accounts lib.
  expect(status).toEqual(200);
  expect(headers.get('content-type')).toMatch(/application\/json/);
  expectTokenResult(body, { email: 'hunter-invited@example.com' });
});
