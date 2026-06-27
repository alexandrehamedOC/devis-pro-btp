import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ClientSchema } from '@/lib/schemas/client'

async function getOwnedClient(userId: string, id: string) {
  return prisma.client.findFirst({ where: { id, userId } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const client = await prisma.client.findFirst({
    where: { id, userId: session.userId },
    include: {
      quotes: {
        select: { id: true, number: true, title: true, status: true, createdAt: true, lines: true },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  if (!client) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  return NextResponse.json(client)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const owned = await getOwnedClient(session.userId, id)
  if (!owned) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = ClientSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const client = await prisma.client.update({
    where: { id },
    data: { ...parsed.data, email: parsed.data.email || null },
  })

  return NextResponse.json(client)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const owned = await getOwnedClient(session.userId, id)
  if (!owned) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  await prisma.client.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
