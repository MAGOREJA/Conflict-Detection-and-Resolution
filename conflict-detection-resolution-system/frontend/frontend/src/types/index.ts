export type UserRole = 'Manager' | 'TeamMember';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface Task {
  id: string;
  title: string;
  assigned_to: string;
  start_time: string;
  end_time: string;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
  resource?: string;
}

export type ConflictType = 'resource' | 'dependency' | 'schedule';

export interface ConflictReport {
  id: string;
  task_id: string;
  conflict_type: ConflictType;
  description: string;
  detected_on: string;
  resolved: boolean;
  resolution_suggestion?: string;
  reported_by?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}
