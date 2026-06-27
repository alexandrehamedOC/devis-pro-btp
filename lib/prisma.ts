import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
const adapter = new PrismaNeon(sql)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Middleware soft delete — filtre automatiquement deletedAt IS NULL
prisma.$use(async (params, next) => {
  const softDeleteModels = ['Client', 'Quote']

  if (params.model && softDeleteModels.includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args = params.args ?? {}
      params.args.where = { deletedAt: null, ...params.args.where }
    }
    if (params.action === 'count') {
      params.args = params.args ?? {}
      params.args.where = { deletedAt: null, ...params.args.where }
    }
  }

  return next(params)
})
