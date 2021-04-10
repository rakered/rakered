import { AuthTokenResult } from '@rakered/accounts';
import { Password } from '@rakered/accounts/lib/types';
import create, { State } from 'zustand';

async function post(url, data = {}) {
  const response = await fetch(`/api/auth/${url.replace(/^\//, '')}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return {
    status: response.status,
    data: await response.json(),
  };
}

const defaultState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

type Store = {
  status: 'loading' | 'ready';
  user: null | AuthTokenResult['user'];
  refreshToken: null | AuthTokenResult['refreshToken'];
  accessToken: null | AuthTokenResult['accessToken'];
  login: (identity: {
    email: string;
    password: Password;
  }) => Promise<{ ok: true } | { error: string }>;
  join: (identity: {
    name: string;
    email: string;
    password: Password;
  }) => Promise<{ ok: true } | { error: string }>;
  enroll: (identity: {
    token: string;
    name: string;
    password: Password;
  }) => Promise<{ ok: true } | { error: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  verifyEmail: (token: {
    token: string;
  }) => Promise<{ ok: true } | { error: string }>;
  forgotPassword: (identity: {
    email: string;
  }) => Promise<{ ok: true } | { error: string }>;
  resetPassword: (identity: {
    password: Password;
    token: string;
  }) => Promise<{ ok: true } | { error: string }>;
} & State;

export const useStore = create<Store>((set) => {
  const hasSession = () => {
    return (
      typeof window !== 'undefined' &&
      'localStorage' in window &&
      !!localStorage.getItem('rake.red.user')
    );
  };

  const destroySession = () => {
    localStorage.removeItem('rake.red.user');

    // hit the logout endpoint to kill all http-only cookies
    post('/logout').catch(() => {
      // ignore
    });
    set({ ...defaultState, status: 'ready' });
  };

  const initSession = (data) => {
    localStorage.setItem('rake.red.user', JSON.stringify(data.user));
    set({ ...data, status: 'ready' });
  };

  return {
    ...defaultState,
    status: hasSession() ? 'loading' : 'ready',
    user: hasSession()
      ? JSON.parse(localStorage.getItem('rake.red.user') || 'null')
      : null,

    join: async ({ name, email, password }) => {
      const { status, data } = await post('/create-account', {
        name,
        email,
        password,
      });

      if (status !== 200) {
        destroySession();
        return { error: data.message };
      }

      initSession(data);
      return { ok: true };
    },

    enroll: async ({ token, name, password }) => {
      const { status, data } = await post('/enroll-account', {
        token,
        name,
        password,
      });

      if (status !== 200) {
        destroySession();
        return { error: data.message };
      }

      initSession(data);
      return { ok: true };
    },

    login: async ({ email, password }) => {
      const { status, data } = await post('/login', {
        email,
        password,
      });

      if (status !== 200) {
        destroySession();
        return { error: data.message };
      }

      initSession(data);
      return { ok: true };
    },

    logout: async () => {
      destroySession();
    },

    refresh: async () => {
      if (!hasSession()) {
        destroySession();
        return;
      }

      const { status, data } = await post('/refresh-token');

      if (status !== 200) {
        destroySession();
        return;
      }

      return initSession(data);
    },

    verifyEmail: async ({ token }) => {
      const { status, data } = await post(`/verify-email`, { token });

      if (status !== 200) {
        destroySession();
        return { error: data.message };
      }

      initSession(data);
      return { ok: true };
    },

    forgotPassword: async ({ email }) => {
      const { status, data } = await post(`/reset-password`, {
        email,
      });

      if (status !== 200) {
        return { error: data.message };
      }

      return { ok: true };
    },

    resetPassword: async ({ password, token }) => {
      const { status, data } = await post(`/reset-password`, {
        password,
        token,
      });

      if (status !== 200) {
        destroySession();
        return { error: data.message };
      }

      initSession(data);
      return { ok: true };
    },
  };
});

export const store = useStore;

const staticRoutes = new Set([
  '/thanks',
  '/err',
  '/err/not-found',
  '/err/invalid-data',
]);

if (typeof window !== 'undefined') {
  setInterval(async () => {
    store.getState().refresh();
  }, 3_600_000); // 1 hour

  // don't refresh static routes. Refresh can force a logout
  // we don't want to log out the user, when they submit the form
  // from a different website.
  if (!staticRoutes.has(location.pathname)) {
    store.getState().refresh();
  }

  if (process.env.NODE_ENV === 'development') {
    (window as any).store = store;
  }
}

export function useUser() {
  return useStore((state) => state.user);
}

export function useAccessToken() {
  return useStore((state) => state.accessToken);
}
