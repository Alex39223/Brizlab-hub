import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = 
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')

  if (isPublic) {
    return NextResponse.next()
  }

  const hasSession = 
    request.cookies.get('sb-nubbdzaexgphedaqlnsu-auth-token') ||
    request.cookies.get('sb-access-token') ||
    request.cookies.get('supabase-auth-token')

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
