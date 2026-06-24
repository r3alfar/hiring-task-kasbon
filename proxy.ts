import { NextResponse, type NextRequest } from 'next/server'
import { updateAuth } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // Refresh Supabase session & get user
  const { response, user } = await updateAuth(request)

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/sign-in') ||
    request.nextUrl.pathname.startsWith('/sign-up')

  // Logged-in user trying to access auth pages → redirect to dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Not logged in trying to access protected pages → redirect to sign-in
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
