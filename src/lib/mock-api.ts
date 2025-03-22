// Mock API for development testing

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Mock user data
const mockUsers = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Client Manager',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager',
  },
];

export const mockApi = {
  // Mock login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.email === email);
    
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Create a mock token
    const token = btoa(`${user.id}:${user.email}:${Date.now()}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  // Mock get current user
  getCurrentUser: async (): Promise<User> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      // Decode token to get user ID
      const [userId] = atob(token).split(':');
      const user = mockUsers.find((u) => u.id === userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
}; 