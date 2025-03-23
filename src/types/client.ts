export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
} 