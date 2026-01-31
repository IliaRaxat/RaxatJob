import { IsString, IsOptional, IsEmail, IsEnum, IsDateString, IsBoolean, IsNumber, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(['HR', 'CANDIDATE', 'UNIVERSITY', 'ADMIN', 'ANALYST'])
  role: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class CreateHRProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  company: string;

  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatarId?: string;
}

export class UpdateHRProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatarId?: string;
}

export class CreateCandidateProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarId?: string;

  // resumeId удален - используйте структурированные резюме через /resumes API

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;
}

export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarId?: string;

  // resumeId удален - используйте структурированные резюме через /resumes API

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;
}

export class CreateUniversityProfileDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  logoId?: string;
}

export class UpdateUniversityProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  logoId?: string;
}

// Универсальный DTO для обновления любого профиля
export class UpdateProfileDto {
  // Общие поля для всех типов профилей
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatarId?: string;

  // Поля для HR профиля
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  position?: string;

  // Поля для кандидата
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  // resumeId удален - используйте структурированные резюме через /resumes API

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  expectedSalary?: number;

  // Поля для университета
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  logoId?: string;
}