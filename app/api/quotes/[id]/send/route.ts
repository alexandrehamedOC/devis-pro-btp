import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { resend, FROM } from '@/lib/resend'
import { put } from '@/lib/blob'
import { registerPdfFonts } from '@/lib/pdf-fonts'
import { QuoteDocument } from '@/components/pdf/QuoteDocument'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.userId },
    include: { client: true, lines: { orderBy: { position: 'asc' } } },
  })
  if (!quote) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const toEmail = body.email ?? quote.client.email
  if (!toEmail) return NextResponse.json({ error: 'Adresse email requise' }, { status: 400 })

  registerPdfFonts()

  // Générer le PDF
  const pdfBuffer = await renderToBuffer(
    createElement(QuoteDocument, {
      quote: {
        ...quote,
        lines: quote.lines.map(l => ({
          ...l,
          quantity: Number(l.quantity),
          unitPriceHt: Number(l.unitPriceHt),
          tvaRate: Number(l.tvaRate),
        })),
      },
      user,
    })
  )

  // Stocker dans Vercel Blob
  const blobResult = await put(`quotes/${quote.number}.pdf`, pdfBuffer, {
    access: 'public',
    contentType: 'application/pdf',
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const consultLink = `${appUrl}/q/${quote.token}`

  // Envoyer par Resend
  const emailResult = await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: body.subject ?? `Votre devis n°${quote.number} — ${user.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1C1410">
        <h1 style="font-size:24px;margin-bottom:8px">${user.name}</h1>
        <p style="color:#8B7355">${user.specialty ?? ''}</p>
        <hr style="border:none;border-top:1px solid #D4C5B0;margin:20px 0">
        <p>Bonjour ${quote.client.name},</p>
        ${body.message ? `<p>${body.message}</p>` : ''}
        <p>Veuillez trouver votre devis n°<strong>${quote.number}</strong> — <em>${quote.title}</em>.</p>
        <p>
          <a href="${consultLink}" style="display:inline-block;padding:12px 24px;background:#C45E3A;color:#fff;text-decoration:none;border-radius:8px;font-weight:500">
            Consulter mon devis en ligne →
          </a>
        </p>
        <p style="font-size:13px;color:#8B7355">Le PDF est également joint à cet email.</p>
        <hr style="border:none;border-top:1px solid #D4C5B0;margin:20px 0">
        <p style="font-size:12px;color:#8B7355">${user.phone ?? ''} · ${user.email}</p>
      </div>
    `,
    attachments: [{
      filename: `devis-${quote.number}.pdf`,
      content: Buffer.from(pdfBuffer).toString('base64'),
    }],
  })

  // Mettre à jour le statut
  const updated = await prisma.quote.update({
    where: { id },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      pdfUrl: blobResult.url,
      resendMessageId: emailResult.data?.id,
    },
    include: { client: true, lines: { orderBy: { position: 'asc' } } },
  })

  return NextResponse.json(updated)
}
