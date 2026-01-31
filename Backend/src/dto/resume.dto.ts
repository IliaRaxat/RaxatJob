import { IsString, IsOptional, IsBoolean, IsArray, IsObject, ValidateNested, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { 
  ResumeSkillDto, 
  ResumeExperienceDto, 
  ResumeEducationDto, 
  ResumeProjectDto, 
  ResumeAchievementDto, 
  ResumeLanguageDto, 
  ResumeCertificationDto 
} from './resume-nested.dto';

// Интерфейсы для структурированных данных резюме
export interface ResumeSkill {
  name: string;
  level: number; // 1-5
  category?: string;
}

export interface ResumeExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  gpa?: number;
  description?: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  technologies: string[];
  url?: string;
  githubUrl?: string;
}

export interface ResumeAchievement {
  title: string;
  description: string;
  date: string;
  category?: string;
}

export interface ResumeLanguage {
  name: string;
  level: string; // Native, Fluent, Intermediate, Basic
  certification?: string;
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

// DTO для создания резюме
export class CreateResumeDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeSkillDto)
  skills?: ResumeSkillDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeExperienceDto)
  experiences?: ResumeExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeEducationDto)
  educations?: ResumeEducationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeProjectDto)
  projects?: ResumeProjectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeAchievementDto)
  achievements?: ResumeAchievementDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeLanguageDto)
  languages?: ResumeLanguageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeCertificationDto)
  certifications?: ResumeCertificationDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// DTO для обновления резюме
export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeSkillDto)
  skills?: ResumeSkillDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeExperienceDto)
  experiences?: ResumeExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeEducationDto)
  educations?: ResumeEducationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeProjectDto)
  projects?: ResumeProjectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeAchievementDto)
  achievements?: ResumeAchievementDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeLanguageDto)
  languages?: ResumeLanguageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeCertificationDto)
  certifications?: ResumeCertificationDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// DTO для ответа с резюме
export class ResumeResponseDto {
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

// DTO для списка резюме
export class ResumeListResponseDto {
  resumes: ResumeResponseDto[];
  total: number;
  page: number;
  limit: number;
}
