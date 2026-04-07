type Env = {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
};

const SESSION_COOKIE = 'vestech_admin_session';

export const onRequest = async ({ request, env, next }: PagesContext) => {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/admin/login') || url.pathname.startsWith('/admin/logout')) {
    return next();
  }

  try {
    const expected = createSessionToken(env);
    const cookie = parseCookies(request.headers.get('Cookie'))[SESSION_COOKIE];

    if (expected && cookie === expected) {
      const response = await next();
      response.headers.set('Cache-Control', 'private, no-store');
      return response;
    }

    return redirect(buildLoginUrl(request, undefined, url.pathname));
  } catch (error) {
    return new Response(
      `Admin middleware error: ${error instanceof Error ? error.message : 'unknown'}`,
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }
};

function buildLoginUrl(request: Request, error?: string, next = '/admin') {
  const url = new URL('/admin/login', request.url);
  url.searchParams.set('next', sanitizeNextPath(next));
  if (error) url.searchParams.set('error', error);
  return url.toString();
}

function sanitizeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/admin';
  return next;
}

function createSessionToken(env: Env) {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return null;
  return `v1-${simpleHash(`${env.ADMIN_SESSION_SECRET}:${env.ADMIN_PASSWORD}`)}`;
}

function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (!name) continue;
    cookies[name] = rest.join('=');
  }
  return cookies;
}

function simpleHash(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(36);
}

function redirect(location: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      'Cache-Control': 'private, no-store',
    },
  });
}
