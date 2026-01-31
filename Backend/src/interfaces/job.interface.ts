import { JobType, JobStatus, ExperienceLevel } from '@prisma/client';

export interface IJob {
  id: string;
  hrId: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  location: string;
  type: JobType;
  status: JobStatus;
  experienceLevel: ExperienceLevel;
  remote: boolean;
  publishedAt?: Date;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobWithSkills extends IJob {
  skills: IJobSkill[];
}

export interface IJobSkill {
  id: string;
  jobId: string;
  skillId: string;
  required: boolean;
  level?: number;
  skill: {
    id: string;
    name: string;
    category?: string;
  };
}
