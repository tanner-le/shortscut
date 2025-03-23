import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'

type UserRole = 'admin' | 'user'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserCreateInput = {
  name: string
  email: string
  password: string
  role?: UserRole
}

export type UserUpdateInput = Partial<{
  name: string
  email: string
  password: string
  role: UserRole
}>

export const userService = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
  },

  // Get user by ID
  getById: async (id: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { id }
    })
  },

  // Get user by email
  getByEmail: async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { email }
    })
  },

  // Create a new user
  create: async (data: UserCreateInput): Promise<User> => {
    const hashedPassword = await hash(data.password, 10)
    
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || 'user'
      }
    })
  },

  // Update a user
  update: async (id: string, data: UserUpdateInput): Promise<User | null> => {
    // If password is being updated, hash it
    if (data.password) {
      data.password = await hash(data.password, 10)
    }

    return prisma.user.update({
      where: { id },
      data
    })
  },

  // Delete a user
  delete: async (id: string): Promise<boolean> => {
    await prisma.user.delete({
      where: { id }
    })
    return true
  },

  // Validate user credentials
  validateCredentials: async (email: string, password: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) return null

    const isValid = await compare(password, user.password)
    if (!isValid) return null

    return user
  }
} 