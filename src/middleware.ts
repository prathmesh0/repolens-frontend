import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // The access cookie can expire while the refresh cookie is still valid;
  // /users/me refreshes it, so either one means "maybe logged in".
  const token =
    req.cookies.get('accessToken') || req.cookies.get('refreshToken');

  const protectedRoutes = ['/home', '/chat'];
  const isProtected = protectedRoutes.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*', '/chat/:path*'],
};
