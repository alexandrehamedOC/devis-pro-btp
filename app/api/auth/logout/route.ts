import { NextResponse } from 'next/server'
import { cookieOptions } from '@/lib/auth'

export async function POST() {
  const { name } = cookieOptions()
  const res = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
  res.cookies.delete(name)
  return res
}
