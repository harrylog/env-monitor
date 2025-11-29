export type EnvironmentStatus = 'working' | 'degraded' | 'down';

export interface Environment {
  id: string;
  name?: string;
  url: string; // IP address or URL of the environment
  version?: string;
  status: EnvironmentStatus;
  notes?: string; // General notes/issues for any status
  lastUpdated: Date;
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
