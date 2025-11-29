export type EnvironmentStatus = 'working' | 'degraded' | 'down';

export interface Environment {
  id: string;
  name?: string;
  url: string;
  version?: string;
  status: EnvironmentStatus;
  notes?: string;
  lastUpdated: string; // ISO date string
}

export interface CreateEnvironmentDto {
  name?: string;
  url: string;
  version?: string;
  status: EnvironmentStatus;
  notes?: string;
}

export interface UpdateEnvironmentDto {
  name?: string;
  url?: string;
  version?: string;
  status?: EnvironmentStatus;
  notes?: string;
}
