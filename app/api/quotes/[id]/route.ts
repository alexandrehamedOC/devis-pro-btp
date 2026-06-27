import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

async function getOwnedQuote(userId: string, id: string) {
  return prisma.quote.findFirst({ where: { id, userId }, include: { lines: { orderBy: { position: 'asc' } }, client: true } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const quote = await getOwnedQuote(session.userId, id)
  if (!quote) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  return NextResponse.json(quote)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const owned = await prisma.quote.findFirst({ where: { id, userId: session.userId } })
  if (!owned) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const { lines, ...quoteData } = body

  await prisma.$transaction(async (tx) => {
    if (quoteData && Object.keys(quoteData).length > 0) {
      await tx.quote.update({
        where: { id },
        data: {
          title: quoteData.title,
          introNote: quoteData.introNote,
          paymentConditions: quoteData.paymentConditions,
          legalText: quoteData.legalText,
          validUntil: quoteData.validUntil ? new Date(quoteData.validUntil) : undefined,
        },
      })
    }

    if (lines && Array.isArray(lines)) {
      await tx.quoteLine.deleteMany({ where: { quoteId: id } })
      if (lines.length > 0) {
        await tx.quoteLine.createMany({
          data: lines.map((l: { position: number; description: string; quantity: number; unit: string; unitPriceHt: number; tvaRate: number }, i: number) => ({
            quoteId: id,
            position: i,
            description: l.description,
            quantity: l.quantity,
            unit: l.unit,
            unitPriceHt: l.unitPriceHt,
            tvaRate: l.tvaRate,
          })),
        })
      }
    }
  })

  const updated = await getOwnedQuote(session.userId, id)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const owned = await prisma.quote.findFirst({ where: { id, userId: session.userId } })
  if (!owned) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  await prisma.quote.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
