import { ResumeSkill, ResumeExperience, ResumeEducation, ResumeProject, ResumeAchievement, ResumeLanguage, ResumeCertification } from '../dto/resume.dto';

export interface Resume {
  id: string;
  candidateId: string;
  title: string;
  summary?: string;
  objective?: string;
  skills?: ResumeSkill[];
  experiences?: ResumeExperience[];
  educations?: ResumeEducation[];
  projects?: ResumeProject[];
  achievements?: ResumeAchievement[];
  languages?: ResumeLanguage[];
  certifications?: ResumeCertification[];
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeCreateData {
  candidateId: string;
  title: string;
  summary?: string;
  objective?: string;
  skills?: ResumeSkill[];
  experiences?: ResumeExperience[];
  educations?: ResumeEducation[];
  projects?: ResumeProject[];
  achievements?: ResumeAchievement[];
  languages?: ResumeLanguage[];
  certifications?: ResumeCertification[];
  isDefault?: boolean;
  isPublic?: boolean;
}

export interface ResumeUpdateData {
  title?: string;
  summary?: string;
  objective?: string;
  skills?: ResumeSkill[];
  experiences?: ResumeExperience[];
  educations?: ResumeEducation[];
  projects?: ResumeProject[];
  achievements?: ResumeAchievement[];
  languages?: ResumeLanguage[];
  certifications?: ResumeCertification[];
  isDefault?: boolean;
  isPublic?: boolean;
}

export interface ResumeFilters {
  candidateId?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  search?: string;
}

export interface ResumePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ResumeListResult {
  resumes: Resume[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
