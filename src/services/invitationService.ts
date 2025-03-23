import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export type InvitationCreateInput = {
  email: string
  name: string
  role: 'client' | 'teamMember'
  organizationId: string
}

export const invitationService = {
  // Create a new invitation
  create: async (data: InvitationCreateInput) => {
    // Generate a unique token
    const token = randomBytes(32).toString('hex')
    
    // Set expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    return prisma.invitation.create({
      data: {
        ...data,
        token,
        status: 'pending',
        expiresAt
      }
    })
  },
  
  // Get invitation by token
  getByToken: async (token: string) => {
    return prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            company: true
          }
        }
      }
    })
  },
  
  // Check if invitation is valid
  isValid: async (token: string) => {
    const invitation = await prisma.invitation.findUnique({
      where: { token }
    })
    
    if (!invitation) return false
    if (invitation.status !== 'pending') return false
    if (invitation.expiresAt < new Date()) {
      // Update status to expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      })
      return false
    }
    
    return true
  },
  
  // Mark invitation as accepted
  accept: async (token: string) => {
    return prisma.invitation.update({
      where: { token },
      data: { status: 'accepted' }
    })
  },
  
  // Get pending invitations for an organization
  getPendingByOrganization: async (organizationId: string) => {
    return prisma.invitation.findMany({
      where: {
        organizationId,
        status: 'pending',
        expiresAt: { gt: new Date() }
      }
    })
  },
  
  // Delete an invitation
  delete: async (id: string) => {
    await prisma.invitation.delete({
      where: { id }
    })
    return true
  }
} 