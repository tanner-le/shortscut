export type ContractStatus = 'active' | 'pending' | 'completed' | 'draft' | 'cancelled';

export interface Contract {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  status: ContractStatus;
  value: number;
  startDate: string;
  endDate?: string;
  terms?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 