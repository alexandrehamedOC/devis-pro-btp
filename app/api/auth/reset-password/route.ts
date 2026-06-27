import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ResetPasswordSchema } from '@/lib/schemas/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const { searchParams } = new URL(req.url)
  const plainToken = searchParams.get('token') ?? body?.token

  if (!plainToken) return NextResponse.json({ error: 'Token manquant' }, { status: 400 })

  const parsed = ResetPasswordSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex')
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Ce lien est expiré ou déjà utilisé — demandez un nouveau lien' },
      { status: 400 }
    )
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { tokenHash }, data: { usedAt: new Date() } }),
  ])

  return NextResponse.json({ ok: true })
}
