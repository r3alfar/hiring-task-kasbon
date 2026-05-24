import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];
const PROTECTED_ROUTES = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);
  const isAuthed = Boolean(sessionCookie);

  // Redirect authenticated users away from auth pages
  if (isAuthed && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthed && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
