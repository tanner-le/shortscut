export type ClientStatus = 'active' | 'inactive';
export type OrganizationPlan = 'creator' | 'studio';

export interface Client {
  id: string;
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company: string;
  industry?: string | null;
  address?: string | null;
  plan: OrganizationPlan;
  notes?: string | null;
  status: ClientStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type ClientCreateInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type ClientUpdateInput = Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>; 