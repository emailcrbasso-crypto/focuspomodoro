import { createServerClient } from '@supabase/ssr'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ROUTES = ['/login', '/signup', '/reset-password', '/update-password']
const PROTECTED_PREFIXES = ['/timer', '/dashboard', '/history']
const PUBLIC_ROUTES = ['/auth/callback']  // OAuth callback — nunca redirecionar

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Partial<ResponseCookie> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Rotas públicas passam sem verificação (ex: callback OAuth)
  if (PUBLIC_ROUTES.some(r => path.startsWith(r))) return supabaseResponse

  const isAuthRoute = AUTH_ROUTES.some(r => path.startsWith(r))
  const isProtected = PROTECTED_PREFIXES.some(r => path.startsWith(r)) || path === '/'

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/timer', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
