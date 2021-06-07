import nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from 'nodemailer';
import Composer from 'nodemailer/lib/mail-composer';
import { URL } from 'url';
import onExit from 'exit-hook';

function createTransport(mailUrl: string): Transporter {
  const url = new URL(mailUrl);

  if (url.protocol !== 'smtp:' && url.protocol !== 'smtps:') {
    throw new Error(`Email protocol must be smtp or smtps`);
  }

  if (url.protocol === 'smtp:' && url.port === '465') {
    console.warn(
      `Connecting over a secure port, while using smtp protocol! You probably mean to use smtps:`,
    );
  }

  // Allow overriding pool setting, but default to true.
  if (!url.searchParams.has('pool')) {
    url.searchParams.set('pool', 'true');
  }

  return nodemailer.createTransport(url.toString());
}

const _transportCache = new Map<string, Transporter>();
function getTransport() {
  const url = process.env.MAIL_URL;

  if (!url) {
    return null;
  }

  if (_transportCache.has(url)) {
    return _transportCache.get(url);
  }

  const transporter = createTransport(url);
  _transportCache.set(url, transporter);
  return _transportCache.get(url);
}

let devModeMailId = 0;

const listeners = new Set<(email: string) => void>();

export const addSmokeListener = (fn) => {
  listeners.add(fn);
};

async function devModeSend(mail: SendMailOptions) {
  const messageId = (++devModeMailId).toString().padStart(3, '0');

  const chunks: any[] = [];
  const stream = new Composer(mail).compile().createReadStream();

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const content = Buffer.concat(chunks).toString('utf-8');
  const header = '====== BEGIN MAIL #' + messageId + ' ======';
  const footer = '====== END MAIL   #' + messageId + ' ======';

  const output = [header, content, footer].join('\n');

  for (const listener of listeners) {
    listener(output);
    listeners.delete(listener);
  }

  if (process.env.NODE_ENV !== 'test') {
    console.log(output);
  }

  return;
}

export type SendOptions = SendMailOptions;
export async function send(options: SendOptions): Promise<SentMessageInfo> {
  const transport = getTransport();

  if (transport) {
    return transport.sendMail(options);
  }

  return devModeSend(options);
}

export async function disconnect() {
  for (const url of _transportCache.keys()) {
    const transport = _transportCache.get(url);
    _transportCache.delete(url);

    if (transport && typeof transport.close === 'function') {
      transport.close();
    }
  }
}

// graceful shutdown
onExit(() => disconnect());
