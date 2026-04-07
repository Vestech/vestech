const SESSION_COOKIE = 'vestech_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

export interface Env {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
}

export function buildLoginUrl(request: Request, error?: string, next = '/admin') {
  const url = new URL('/admin/login', request.url);
  url.searchParams.set('next', sanitizeNextPath(next));
  if (error) {
    url.searchParams.set('error', error);
  }
  return url;
}

export function sanitizeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith('/')) {
    return '/admin';
  }
  if (next.startsWith('//')) {
    return '/admin';
  }
  return next;
}

export async function isAuthenticated(request: Request, env: Env) {
  const expected = await createSessionToken(env);
  if (!expected) {
    return false;
  }

  const cookies = parseCookies(request.headers.get('Cookie'));
  return timingSafeEqual(cookies[SESSION_COOKIE], expected);
}

export async function createSessionCookie(env: Env) {
  const token = await createSessionToken(env);
  if (!token) {
    return null;
  }

  return [
    `${SESSION_COOKIE}=${token}`,
    'HttpOnly',
    'Path=/admin',
    'SameSite=Lax',
    'Secure',
    `Max-Age=${SESSION_DURATION_SECONDS}`,
  ].join('; ');
}

export function clearSessionCookie() {
  return [
    `${SESSION_COOKIE}=`,
    'HttpOnly',
    'Path=/admin',
    'SameSite=Lax',
    'Secure',
    'Max-Age=0',
  ].join('; ');
}

async function createSessionToken(env: Env) {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
    return null;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.ADMIN_SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`v1:${env.ADMIN_PASSWORD}`),
  );

  return toBase64Url(signature);
}

function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) {
    return cookies;
  }

  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName) {
      continue;
    }
    cookies[rawName] = rawValue.join('=');
  }

  return cookies;
}

function timingSafeEqual(left: string | undefined, right: string | undefined) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

function toBase64Url(input: ArrayBuffer) {
  const bytes = new Uint8Array(input);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index]!;
    const b = index + 1 < bytes.length ? bytes[index + 1]! : 0;
    const c = index + 2 < bytes.length ? bytes[index + 2]! : 0;
    const triple = (a << 16) | (b << 8) | c;

    output += alphabet[(triple >> 18) & 63];
    output += alphabet[(triple >> 12) & 63];
    output += index + 1 < bytes.length ? alphabet[(triple >> 6) & 63] : '';
    output += index + 2 < bytes.length ? alphabet[triple & 63] : '';
  }

  return output;
}
