import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass API routes through without locale processing
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || 
      pathname === '/manifest.json' || pathname === '/sw.js' ||
      pathname.startsWith('/icons/')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
