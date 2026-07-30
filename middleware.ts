import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/admin']
const AUTH_PATHS = ['/login', '/signup']
// Paths that must be excluded from auth gating so OAuth callbacks can complete
const BYPASS_PATHS = ['/auth/callback', '/auth/confirm']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Auth callback and confirm routes must never be gated — they complete
  // the OAuth / magic-link flow and set the session cookie themselves.
  if (BYPASS_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT with Supabase servers — prevents spoofing.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  const isAuthPath = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  // Unauthenticated → redirect to /login
  if (!user && isProtected) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    response = NextResponse.redirect(url)
    return response
  }

  // Already authenticated → skip login/signup
  if (user && isAuthPath) {
    response = NextResponse.redirect(new URL('/dashboard', request.url))
    return response
  }

  // Admin routes — single source of truth: profiles.role = 'admin'
  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      response = NextResponse.redirect(new URL('/', request.url))
      return response
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|json)$).*)',
  ],
}
