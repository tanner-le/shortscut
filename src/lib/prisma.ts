import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty'
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add error handler to handle missing tables gracefully
prisma.$use(async (params, next) => {
  try {
    return await next(params)
  } catch (error: any) {
    // Check if the error is related to a missing table
    if (error.message && error.message.includes('does not exist in the current database')) {
      console.error(`Table error: ${error.message}`)
      
      // If trying to include Invitation relation, return without it
      if (params.model === 'Organization' && 
          params.action === 'findUnique' && 
          params.args?.include?.invitations) {
        // Remove invitations from the include
        delete params.args.include.invitations
        return next(params)
      }
    }
    throw error
  }
})

export default prisma 