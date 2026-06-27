import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/p/',        // public quote consultation pages
  '/api/auth',
  '/_next',
  '/fonts',
  '/favicon',
]

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // CSRF: vérification de l'en-tête Origin sur les mutations
  if (MUTATION_METHODS.includes(req.method) && pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (origin && appUrl) {
      const allowedOrigin = new URL(appUrl).origin
      if (origin !== allowedOrigin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (origin && host) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }

  // Routes publiques
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  // Vérification JWT
  const token = req.cookies.get('token')?.value
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = await verifyJWT(token)
  if (!payload) {
    const loginUrl = new URL('/login', req.url)
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete('token')
    return res
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fonts|images).*)',
  ],
}
