export type UserRole = 'Admin' | 'Employee' | 'Client';
export type ProjectStatus = 'On Track' | 'At Risk' | 'Critical' | 'Completed';
export type RiskSeverity = 'Low' | 'Medium' | 'High';
export type RiskStatus = 'Open' | 'Resolved';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  healthScore: number;
  clientId: string | IUser;
  employeeIds: string[] | IUser[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICheckIn {
  _id: string;
  projectId: string | IProject;
  employeeId: string | IUser;
  weekStartDate: Date;
  progressSummary: string;
  blockers: string;
  confidenceLevel: number;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeedback {
  _id: string;
  projectId: string | IProject;
  clientId: string | IUser;
  weekStartDate: Date;
  satisfactionRating: number;
  communicationRating: number;
  comments?: string;
  issueFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRisk {
  _id: string;
  projectId: string | IProject;
  employeeId: string | IUser;
  title: string;
  severity: RiskSeverity;
  mitigationPlan: string;
  status: RiskStatus;
  createdAt: Date;
  updatedAt: Date;
}