import { UserRole } from '@prisma/client';

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHRProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  location?: string;
  bio?: string;
  // resumeUrl удален - используйте структурированные резюме через /resumes API
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUniversityProfile {
  id: string;
  userId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}
