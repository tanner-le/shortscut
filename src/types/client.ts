export interface Client {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  plan: 'creator' | 'studio';
  userCount?: number;
  createdAt: string;
  updatedAt: string;
} 