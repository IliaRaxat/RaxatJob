import { ApplicationStatus } from '@prisma/client';

export interface IApplication {
  id: string;
  jobId: string;
  candidateId: string;
  hrId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeId?: string; // Ссылка на структурированное резюме
  notes?: string;
  appliedAt: Date;
  updatedAt: Date;
}

export interface IApplicationWithDetails extends IApplication {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
  };
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}
