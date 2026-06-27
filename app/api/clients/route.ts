import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ClientSchema } from '@/lib/schemas/client'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const clients = await prisma.client.findMany({
    where: { userId: session.userId },
    include: { _count: { select: { quotes: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = ClientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { name, email, phone, address, notes } = parsed.data

  if (!email && !phone) {
    return NextResponse.json({ error: 'Email ou téléphone requis' }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: { userId: session.userId, name, email: email || null, phone, address, notes },
  })

  return NextResponse.json(client, { status: 201 })
}
