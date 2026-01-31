import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTO для навыков
export class ResumeSkillDto {
  @IsString()
  name: string;

  @IsNumber()
  level: number;

  @IsOptional()
  @IsString()
  category?: string;
}

// DTO для опыта работы
export class ResumeExperienceDto {
  @IsString()
  company: string;

  @IsString()
  position: string;

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsBoolean()
  isCurrent: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];
}

// DTO для образования
export class ResumeEducationDto {
  @IsString()
  institution: string;

  @IsString()
  degree: string;

  @IsString()
  field: string;

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsBoolean()
  isCurrent: boolean;

  @IsOptional()
  @IsNumber()
  gpa?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

// DTO для проектов
export class ResumeProjectDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsBoolean()
  isCurrent: boolean;

  @IsArray()
  @IsString({ each: true })
  technologies: string[];

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;
}

// DTO для достижений
export class ResumeAchievementDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  category?: string;
}

// DTO для языков
export class ResumeLanguageDto {
  @IsString()
  name: string;

  @IsString()
  level: string; // Native, Fluent, Intermediate, Basic

  @IsOptional()
  @IsString()
  certification?: string;
}

// DTO для сертификатов
export class ResumeCertificationDto {
  @IsString()
  name: string;

  @IsString()
  issuer: string;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  credentialId?: string;

  @IsOptional()
  @IsString()
  url?: string;
}
