import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { PrismaClient } from "../prisma/generated/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg(pool, {
      disposeExternalPool: true,
    }),
    // Optional: Log queries to see if connection works
    // log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
