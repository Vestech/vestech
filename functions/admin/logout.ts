import { buildLoginUrl, clearSessionCookie } from './_lib/auth';

type PagesContext = {
  request: Request;
};

export const onRequestGet = async ({ request }: PagesContext) => {
  const response = Response.redirect(buildLoginUrl(request).toString(), 302);
  response.headers.append('Set-Cookie', clearSessionCookie());
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
};
