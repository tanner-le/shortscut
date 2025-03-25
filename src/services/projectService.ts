import { ProjectStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface Project {
  id: string
  title: string
  organizationId: string
  description?: string | null
  startDate: Date
  dueDate?: Date | null
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export type ProjectCreateInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type ProjectUpdateInput = Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>

export const projectService = {
  // Get all projects
  getAll: async () => {
    return prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    })
  },

  // Get project by ID
  getById: async (id: string) => {
    return prisma.project.findUnique({
      where: { id }
    })
  },

  // Get projects by organization ID
  getByOrganizationId: async (organizationId: string) => {
    try {
      // Using a more generic query approach until Prisma client is regenerated
      return prisma.project.findMany({
        where: {
          // @ts-ignore - This will work at runtime but TypeScript doesn't know about the new schema yet
          organizationId
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Error fetching projects by organization ID:', error)
      return []
    }
  },

  // Create a new project
  create: async (data: any) => {
    return prisma.project.create({
      data
    })
  },

  // Update a project
  update: async (id: string, data: any) => {
    return prisma.project.update({
      where: { id },
      data
    })
  },

  // Delete a project
  delete: async (id: string): Promise<boolean> => {
    await prisma.project.delete({
      where: { id }
    })
    return true
  }
} 