import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { registerPdfFonts } from '@/lib/pdf-fonts'
import { QuoteDocument } from '@/components/pdf/QuoteDocument'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.userId },
    include: { client: true, lines: { orderBy: { position: 'asc' } } },
  })
  if (!quote) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  registerPdfFonts()

  const buffer = await renderToBuffer(
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

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="devis-${quote.number}.pdf"`,
    },
  })
}
