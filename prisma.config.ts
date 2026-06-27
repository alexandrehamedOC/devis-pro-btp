import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    // URL directe (port 5432, sans PgBouncer) pour les migrations Prisma
    connectionString: process.env.DATABASE_URL_UNPOOLED!,
  },
})
