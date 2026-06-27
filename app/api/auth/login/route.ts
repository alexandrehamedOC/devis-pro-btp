import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signJWT, cookieOptions } from '@/lib/auth'
import { loginRateLimit } from '@/lib/rate-limit'
import { LoginSchema } from '@/lib/schemas/auth'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const { success } = await loginRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Trop de tentatives' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

  // Toujours comparer pour éviter les timing attacks
  const hash = user?.passwordHash ?? '$2b$12$invalidsaltinvalidhashXXXXXXXXXXXXXXXXXXXXXXX'
  const valid = await bcrypt.compare(password, hash)

  if (!user || !valid) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
  }

  const token = await signJWT({ userId: user.id, email: user.email })
  const opts = cookieOptions()

  const res = NextResponse.json({ ok: true })
  res.cookies.set(opts.name, token, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  })
  return res
}
