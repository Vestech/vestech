type Env = {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

const SESSION_COOKIE = 'vestech_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

export const onRequestPost = async ({ request, env }: PagesContext) => {
  try {
    const formData = await request.formData();
    const password = String(formData.get('password') ?? '');
    const next = sanitizeNextPath(String(formData.get('next') ?? '/admin'));

    if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
      return redirect(buildLoginUrl(request, 'config', next));
    }

    if (password !== env.ADMIN_PASSWORD) {
      return redirect(buildLoginUrl(request, 'invalid', next));
    }

    const token = createSessionToken(env);
    if (!token) {
      return redirect(buildLoginUrl(request, 'config', next));
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: new URL(next, request.url).toString(),
        'Set-Cookie': [
          `${SESSION_COOKIE}=${token}`,
          'HttpOnly',
          'Path=/admin',
          'SameSite=Lax',
          'Secure',
          `Max-Age=${SESSION_DURATION_SECONDS}`,
        ].join('; '),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return new Response(
      `Admin login error: ${error instanceof Error ? error.message : 'unknown'}`,
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
