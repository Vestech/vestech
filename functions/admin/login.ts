import {
  buildLoginUrl,
  createSessionCookie,
  sanitizeNextPath,
} from './_lib/auth';

type Env = {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');
  const next = sanitizeNextPath(String(formData.get('next') ?? '/admin'));

  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
    return Response.redirect(buildLoginUrl(request, 'config', next), 302);
  }

  if (!timingSafeEqual(password, env.ADMIN_PASSWORD)) {
    return Response.redirect(buildLoginUrl(request, 'invalid', next), 302);
  }

  const sessionCookie = await createSessionCookie(env);
  if (!sessionCookie) {
    return Response.redirect(buildLoginUrl(request, 'config', next), 302);
  }

  const response = Response.redirect(new URL(next, request.url), 302);
  response.headers.append('Set-Cookie', sessionCookie);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
};

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}
