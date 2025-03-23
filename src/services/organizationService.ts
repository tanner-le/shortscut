import { prisma } from '@/lib/prisma'

export type OrganizationCreateInput = {
  name: string
  company: string
  email?: string
  phone?: string
  industry?: string
  address?: string
  notes?: string
}

export type OrganizationUpdateInput = Partial<OrganizationCreateInput>

export const organizationService = {
  // Get all organizations
  getAll: async () => {
    return prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            users: true,
            contracts: true
          }
        }
      }
    })
  },

  // Get organization by ID
  getById: async (id: string) => {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phoneNumber: true
          }
        },
        invitations: {
          where: {
            status: 'pending'
          }
        }
      }
    })
  },

  // Create a new organization
  create: async (data: OrganizationCreateInput) => {
    return prisma.organization.create({
      data: {
        ...data,
        status: 'active'
      }
    })
  },

  // Update an organization
  update: async (id: string, data: OrganizationUpdateInput) => {
    return prisma.organization.update({
      where: { id },
      data
    })
  },

  // Delete an organization
  delete: async (id: string) => {
    // First delete all invitations for this organization
    await prisma.invitation.deleteMany({
      where: { organizationId: id }
    })
    
    // Update all users to remove organization connection
    await prisma.user.updateMany({
      where: { organizationId: id },
      data: { organizationId: null }
    })
    
    // Delete the organization
    await prisma.organization.delete({
      where: { id }
    })
    
    return true
  },
  
  // Get organization users
  getUsers: async (organizationId: string) => {
    return prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        createdAt: true
      }
    })
  }
} 