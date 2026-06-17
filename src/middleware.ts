import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes
  if (
    pathname === "/login" || pathname === "/register" || pathname === "/" ||
    pathname.startsWith("/api/auth") || pathname === "/api/categories" ||
    pathname === "/api/feed" || pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/polls/") && pathname.endsWith("/vote") === false
  ) {
    return NextResponse.next()
  }

  // Protected pages — check cookie for client-side auth
  const isProtectedPage = pathname.startsWith("/feed") || pathname.startsWith("/create") || pathname.startsWith("/poll/")
  if (isProtectedPage) {
    // Let client-side AuthProvider handle auth
    return NextResponse.next()
  }

  // Protected API routes — pass through, route handler will verify
  const isProtectedApi = pathname.startsWith("/api/polls") || pathname.startsWith("/api/users/me")
  if (isProtectedApi) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)"],
}
