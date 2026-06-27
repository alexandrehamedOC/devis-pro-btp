import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { resend, FROM } from '@/lib/resend'
import { forgotPasswordRateLimit } from '@/lib/rate-limit'
import { ForgotPasswordSchema } from '@/lib/schemas/auth'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await forgotPasswordRateLimit.limit(ip)
  if (!success) return NextResponse.json({ ok: true }) // réponse identique pour ne pas révéler le rate limit

  const body = await req.json().catch(() => null)
  const parsed = ForgotPasswordSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: true }) // réponse toujours identique

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

  if (user) {
    const plainToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1h

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const resetLink = `${appUrl}/reset-password?token=${plainToken}`

    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <p>Bonjour ${user.name},</p>
        <p>Vous avez demandé une réinitialisation de mot de passe.</p>
        <p><a href="${resetLink}" style="color:#C45E3A">Cliquez ici pour réinitialiser votre mot de passe</a></p>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      `,
    })
  }

  return NextResponse.json({ ok: true })
}
