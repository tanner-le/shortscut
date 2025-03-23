import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type ClientStatus = 'active' | 'inactive'

export interface Client {
  id: string
  name: string
  email: string
  phone?: string | null
  company: string
  industry?: string | null
  address?: string | null
  notes?: string | null
  status: ClientStatus
  createdAt: Date
  updatedAt: Date
}

export type ClientCreateInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
export type ClientUpdateInput = Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>

export const clientService = {
  // Get all clients
  getAll: async (): Promise<Client[]> => {
    return prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    })
  },

  // Get client by ID
  getById: async (id: string): Promise<Client | null> => {
    return prisma.client.findUnique({
      where: { id }
    })
  },

  // Create a new client
  create: async (data: ClientCreateInput): Promise<Client> => {
    return prisma.client.create({
      data
    })
  },

  // Update a client
  update: async (id: string, data: ClientUpdateInput): Promise<Client | null> => {
    return prisma.client.update({
      where: { id },
      data
    })
  },

  // Delete a client
  delete: async (id: string): Promise<boolean> => {
    await prisma.client.delete({
      where: { id }
    })
    return true
  }
} 