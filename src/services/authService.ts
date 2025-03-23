import jwt from 'jsonwebtoken'
import { userService } from './userService'
import type { User } from './userService'

// JWT config
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'
const JWT_EXPIRES_IN = '7d' // Token expires in 7 days

type TokenPayload = {
  userId: string
  email: string
  role: string
}

export type AuthTokens = {
  accessToken: string
  user: Omit<User, 'password'>
}

export const authService = {
  // Register a new user
  register: async (name: string, email: string, password: string): Promise<AuthTokens> => {
    // Check if user already exists
    const existingUser = await userService.getByEmail(email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Create new user
    const user = await userService.create({
      name,
      email,
      password,
      role: 'user' // Default role for new registrations
    })

    // Generate token
    const token = generateToken(user)

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user

    return {
      accessToken: token,
      user: userWithoutPassword as Omit<User, 'password'>
    }
  },

  // Login user
  login: async (email: string, password: string): Promise<AuthTokens> => {
    // Validate credentials
    const user = await userService.validateCredentials(email, password)
    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Generate token
    const token = generateToken(user)

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user

    return {
      accessToken: token,
      user: userWithoutPassword as Omit<User, 'password'>
    }
  },

  // Verify JWT token
  verifyToken: (token: string): TokenPayload => {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  },

  // Get user from token
  getUserFromToken: async (token: string): Promise<Omit<User, 'password'> | null> => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
      const user = await userService.getById(decoded.userId)
      
      if (!user) return null

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword as Omit<User, 'password'>
    } catch (error) {
      return null
    }
  }
}

// Helper function to generate JWT token
const generateToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
} 