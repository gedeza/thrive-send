export const PROJECT_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const;

export type ProjectStatus = keyof typeof PROJECT_STATUS;

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  clientId: string | null;
  organizationId: string;
  managerId: string | null;
  createdAt: string;
}

export interface ProjectFormData {
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate: string;
  endDate?: string | null;
  clientId: string;
  organizationId: string;
  managerId?: string | null;
}

export interface ProjectFormSchema {
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  clientId: string;
  organizationId: string;
  managerId?: string;
} 