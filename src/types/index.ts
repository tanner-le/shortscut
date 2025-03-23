import { PackageType } from './package';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  industry?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  title: string;
  clientId: string;
  packageType: PackageType;
  startDate: Date;
  endDate?: Date;
  value: number;
  status: 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'cancelled';
  description?: string;
  terms?: string;
  files?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  contractId: string;
  clientId: string;
  description?: string;
  startDate: Date;
  dueDate?: Date;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
  createdAt: Date;
  updatedAt: Date;
} 