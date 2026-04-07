type PagesContext = {
  request: Request;
};

const SESSION_COOKIE = 'vestech_admin_session';

export const onRequestGet = async ({ request }: PagesContext) => {
  const loginUrl = new URL('/admin/login', request.url).toString();
  return new Response(null, {
    status: 302,
    headers: {
      Location: loginUrl,
      'Set-Cookie': [
        `${SESSION_COOKIE}=`,
        'HttpOnly',
        'Path=/admin',
        'SameSite=Lax',
        'Secure',
        'Max-Age=0',
      ].join('; '),
      'Cache-Control': 'private, no-store',
    },
  });
};
