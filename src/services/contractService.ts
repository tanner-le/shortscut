import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type PackageType = 'creator' | 'studio'
type ContractStatus = 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'cancelled'

export interface Contract {
  id: string
  title: string
  clientId: string
  packageType: PackageType
  startDate: Date
  endDate?: Date | null
  totalMonths?: number | null
  syncCallDay?: number | null
  value: number
  status: ContractStatus
  description?: string | null
  terms?: string | null
  files?: string[]
  createdAt: Date
  updatedAt: Date
}

export type ContractCreateInput = Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>
export type ContractUpdateInput = Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>>

export const contractService = {
  // Get all contracts
  getAll: async (): Promise<Contract[]> => {
    return prisma.contract.findMany({
      orderBy: { createdAt: 'desc' },
      include: { client: true }
    })
  },

  // Get contract by ID
  getById: async (id: string): Promise<Contract | null> => {
    return prisma.contract.findUnique({
      where: { id },
      include: { client: true }
    })
  },

  // Get contracts by client ID
  getByClientId: async (clientId: string): Promise<Contract[]> => {
    return prisma.contract.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    })
  },

  // Create a new contract
  create: async (data: ContractCreateInput): Promise<Contract> => {
    return prisma.contract.create({
      data: {
        ...data,
        files: data.files || []
      }
    })
  },

  // Update a contract
  update: async (id: string, data: ContractUpdateInput): Promise<Contract | null> => {
    return prisma.contract.update({
      where: { id },
      data
    })
  },

  // Delete a contract
  delete: async (id: string): Promise<boolean> => {
    await prisma.contract.delete({
      where: { id }
    })
    return true
  }
} 