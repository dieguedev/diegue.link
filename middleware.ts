import { NextRequest, NextResponse } from 'next/server';
import { routeRequest } from '@/lib/routing/route-request';

export function middleware(request: NextRequest) {
  const route = routeRequest({
    host: request.headers.get('host') ?? '',
    pathname: request.nextUrl.pathname,
  });

  if (route.type === 'redirect')
    return NextResponse.redirect(
      new URL(`${route.to}${request.nextUrl.search}`),
      route.permanent ? 308 : 307,
    );

  if (route.type === 'link')
    return NextResponse.rewrite(
      new URL(`/resolve/${route.domain}${route.path}`, request.url),
    );

  return NextResponse.next();
}

export const config = { matcher: '/((?!_next/).*)' };
