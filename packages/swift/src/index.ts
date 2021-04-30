import axios, { AxiosResponse } from 'axios';
import SHA from 'jssha';

function hmac({ content, key }) {
  const sha = new SHA('SHA-1', 'TEXT');
  sha.setHMACKey(key, 'TEXT');
  sha.update(content);
  return sha.getHMAC('HEX');
}

function unix() {
  return Math.round(new Date().getTime() / 1000);
}

interface SignProps {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  expires: number;
  container: string;
  object: string;
}

const sign = ({ endpoint, method, expires, container, object }: SignProps) => {
  const objectPath = `/${container}/${object}`;
  const content = `${method}\n${expires}\n${objectPath}`;
  const signature = hmac({ content, key: process.env.OPENSTACK_TEMP_URL_KEY });

  return `${endpoint}${objectPath}?temp_url_sig=${signature}&temp_url_expires=${expires}`;
};

interface TempUrlProps {
  method: SignProps['method'];
  container: SignProps['container'];
  object: SignProps['object'];
  expires?: SignProps['expires'];
}

const ENV_VARS = ['OPENSTACK_SWIFT_ENDPOINT', 'OPENSTACK_TEMP_URL_KEY'];
const REQUIRED_ENV_MSG = `@rakered/swift requires the following env keys to be set:\n\n${ENV_VARS.map(
  (x) => `  ${x}`,
).join('\n')}\n`;

if (ENV_VARS.some((key) => typeof process.env[key] === 'undefined')) {
  throw new Error(REQUIRED_ENV_MSG);
}

export function getTempURL({
  method,
  container,
  object,
  expires,
}: TempUrlProps) {
  if (!container || !object) {
    throw new Error('please provide a container and object');
  }

  return sign({
    endpoint: process.env.OPENSTACK_SWIFT_ENDPOINT as string,
    expires: unix() + (expires || 300), // seconds
    method,
    container,
    object,
  });
}

export type ObjectRef = { container: string; object: string };

export type ResponsePromise = Promise<AxiosResponse> & {
  cancel: () => void;
};

export const api = {
  // can't decorate with async, because of typescript:
  //   The return type of an async function or method must be the global Promise  type. Did you mean to write 'Promise  >'?
  upload(
    options: ObjectRef & {
      data: any;
      headers: { 'content-type': string; [key: string]: string };
    },
  ): ResponsePromise {
    const source = axios.CancelToken.source();

    const url = getTempURL({
      method: 'PUT',
      container: options.container,
      object: options.object,
    });

    const response = axios.put(url, options.data, {
      headers: options.headers,
      cancelToken: source.token,
    }) as ResponsePromise;

    // add cancel handler
    response.cancel = source.cancel;

    // wrap catch so that cancel actions don't throw errors
    response.catch((error) => {
      if (axios.isCancel(error)) {
        return;
      }

      throw error;
    });

    return response;
  },

  async delete(options: ObjectRef): Promise<AxiosResponse> {
    const url = getTempURL({
      method: 'DELETE',
      container: options.container,
      object: options.object,
    });

    return axios.delete(url);
  },

  getDownloadUrl(options: ObjectRef & { expires?: number }): string {
    return getTempURL({
      method: 'GET',
      container: options.container,
      object: options.object,
      expires: options.expires || 300,
    });
  },
};

export default api;
