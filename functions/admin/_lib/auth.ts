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

export function isAuthenticated(request: Request, env: Env) {
  const expected = createSessionToken(env);
  if (!expected) {
    return false;
  }

  const cookies = parseCookies(request.headers.get('Cookie'));
  return timingSafeEqual(cookies[SESSION_COOKIE], expected);
}

export function createSessionCookie(env: Env) {
  const token = createSessionToken(env);
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

function createSessionToken(env: Env) {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
    return null;
  }

  return `v1-${simpleHash(`${env.ADMIN_SESSION_SECRET}:${env.ADMIN_PASSWORD}`)}`;
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

function simpleHash(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0).toString(36);
}
