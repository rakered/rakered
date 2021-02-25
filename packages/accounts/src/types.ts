import { Collection } from '@rakered/mongo';
import { EmailSettings } from './index';

export type Password = string | { algorithm: 'sha-256'; digest: string };

export type EmailDoc = { email: string };

export type TokenUrls = {
  verifyEmail: (token: string) => string;
  resetPassword: (token: string) => string;
  enrollAccount: (token: string) => string;
};

export interface Context {
  collection: Collection<UserDocument>;
  email: EmailSettings;
  urls: TokenUrls;
}

export interface EmailOptions {
  to: string;
  from: string;
  siteName: string;
  siteUrl: string;
  logoUrl?: string;
  magicLink: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  roles: string[];
}

export interface InviteUserResult {
  user: {
    _id: string;
    email: string;
  };
}

export interface AuthTokenResult {
  user: User;
  refreshToken: string;
  accessToken: string;
}

export interface TokenResult {
  token: string;
  expires: number;
}

export interface UserDocument {
  _id: string;
  name?: string;
  username?: string;
  // handle is a private field, it's a normalized version of the username
  handle?: string;
  emails?: {
    address: string;
    verified: boolean;
    token?: string;
    digits?: string;
  }[];
  roles?: string[];
  services: {
    password?: {
      argon?: string;
      bcrypt?: string;
      reset?: {
        token: string;
        email: string;
        reason?: string;
        when: Date;
      };
    };
    resume?: {
      refreshTokens?: {
        token: string;
        when: Date;
      }[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
