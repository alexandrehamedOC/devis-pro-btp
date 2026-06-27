import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { QuoteSchema } from '@/lib/schemas/quote'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const quotes = await prisma.quote.findMany({
    where: { userId: session.userId },
    include: {
      client: { select: { id: true, name: true } },
      lines: { select: { quantity: true, unitPriceHt: true, tvaRate: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(quotes)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = QuoteSchema.partial().safeParse(body)
  if (!parsed.success || !body?.clientId) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  // Vérifier que le client appartient à cet utilisateur
  const client = await prisma.client.findFirst({ where: { id: body.clientId, userId: session.userId } })
  if (!client) return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })

  // Numérotation YYYY-NNN
  const year = new Date().getFullYear()
  const count = await prisma.quote.count({
    where: { userId: session.userId, number: { startsWith: `${year}-` } },
  })
  const number = `${year}-${String(count + 1).padStart(3, '0')}`

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  const quote = await prisma.quote.create({
    data: {
      userId: session.userId,
      clientId: body.clientId,
      number,
      title: body.title ?? '',
      paymentConditions: user?.paymentDefault ?? '',
      legalText: user?.legalDefault ?? '',
      validUntil: body.validUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lines: {
        create: [{
          position: 0,
          description: '',
          quantity: 1,
          unit: 'forfait',
          unitPriceHt: 0,
          tvaRate: 10,
        }],
      },
    },
  })

  return NextResponse.json(quote, { status: 201 })
}
