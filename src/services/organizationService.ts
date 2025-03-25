import { prisma } from '@/lib/prisma'

export type OrganizationPlan = 'creator' | 'studio'

export type OrganizationCreateInput = {
  name: string
  company: string
  email?: string
  phone?: string
  industry?: string
  address?: string
  plan: OrganizationPlan
  notes?: string
}

export type OrganizationUpdateInput = Partial<OrganizationCreateInput>

// Generate a random 5-digit organization code
const generateOrgCode = async (): Promise<string> => {
  // Generate a random 5-digit number between 10000 and 99999
  const generateRandomCode = () => 
    (10000 + Math.floor(Math.random() * 90000)).toString();
  
  let code = generateRandomCode();
  let isUnique = false;
  
  // Keep generating until we find a unique code
  while (!isUnique) {
    // Check if code exists
    const existing = await prisma.organization.findUnique({
      where: { code }
    });
    
    if (!existing) {
      isUnique = true;
    } else {
      code = generateRandomCode();
    }
  }
  
  return code;
};

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
            role: true
          }
        },
        _count: {
          select: {
            users: true,
            projects: true
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
            role: true,
            phoneNumber: true
          }
        },
        projects: true
      }
    })
  },

  // Create a new organization
  create: async (data: OrganizationCreateInput) => {
    // Generate a unique 5-digit code
    const code = await generateOrgCode();
    
    return prisma.organization.create({
      data: {
        ...data,
        code,
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
        role: true,
        phoneNumber: true,
        createdAt: true
      }
    })
  }
} 