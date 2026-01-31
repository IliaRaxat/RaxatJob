import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { JobType, JobStatus, ExperienceLevel } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @MaxLength(200, { message: 'Название вакансии не должно превышать 200 символов' })
  title: string;

  @IsString()
  @MaxLength(5000, { message: 'Описание не должно превышать 5000 символов' })
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: 'Требования не должны превышать 3000 символов' })
  requirements?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: 'Обязанности не должны превышать 3000 символов' })
  responsibilities?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Преимущества не должны превышать 2000 символов' })
  benefits?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  location: string;

  @IsEnum(JobType)
  type: JobType;

  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  skillIds?: string[];
}

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Название вакансии не должно превышать 200 символов' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Описание не должно превышать 5000 символов' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: 'Требования не должны превышать 3000 символов' })
  requirements?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: 'Обязанности не должны превышать 3000 символов' })
  responsibilities?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Преимущества не должны превышать 2000 символов' })
  benefits?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  skillIds?: string[];
}

export class JobQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
