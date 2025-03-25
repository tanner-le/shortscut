export type ProjectStatus = 'not_started' | 'writing' | 'filming' | 'editing' | 'revising' | 'delivered';

export interface Project {
  id: string;
  title: string;
  organizationId: string;
  description?: string | null;
  startDate: Date | string;
  dueDate?: Date | string | null;
  status: ProjectStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type ProjectCreateInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type ProjectUpdateInput = Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>; 