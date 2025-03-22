import { PackageType } from './package';

export type ContractStatus = 'active' | 'pending' | 'completed' | 'draft' | 'cancelled';

export interface Contract {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  status: ContractStatus;
  packageType: PackageType;
  videosPerMonth: number;
  pricePerMonth: number;
  totalMonths: number;
  startDate: string;
  endDate?: string;
  terms?: string;
  notes?: string;
  syncCallDay?: number; // Day of month for sync call
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  status: 'planning' | 'scripting' | 'production' | 'editing' | 'review' | 'completed';
  dueDate: string;
  deliveryDate?: string;
  feedback?: string[];
  revisionCount: number;
  createdAt: string;
  updatedAt: string;
} 