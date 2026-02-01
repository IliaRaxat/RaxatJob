export interface User {
  id: string;
  email: string;
  role: 'HR' | 'CANDIDATE' | 'UNIVERSITY' | 'ADMIN' | 'MODERATOR';
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isActive?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
}
export interface HRProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phone?: string;
  avatarUrl?: string;
  avatarId?: string;
  user: User;
}
export interface CandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  avatarId?: string;
  user: User;
}
export interface UniversityProfile {
  id: string;
  userId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  logoId?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  students: Record<string, unknown>[];
  educations: Record<string, unknown>[];
}
export interface AdminProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  phone?: string;
  avatarId?: string;
  permissions?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  avatar?: string;
}
