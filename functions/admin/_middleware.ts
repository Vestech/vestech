import { buildLoginUrl, isAuthenticated } from './_lib/auth';

type Env = {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
};

export const onRequest = async (context: PagesContext) => {
  const { request, next, env } = context;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/admin/login') || url.pathname.startsWith('/admin/logout')) {
    return next();
  }

  if (await isAuthenticated(request, env)) {
    const response = await next();
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  return Response.redirect(buildLoginUrl(request, undefined, url.pathname), 302);
};
