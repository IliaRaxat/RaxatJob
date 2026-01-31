import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, Min, Max, MaxLength, IsArray } from 'class-validator';
import { InternshipRequestStatus } from '@prisma/client';

export class CreateInternshipRequestDto {
  @IsString()
  @MaxLength(100, { message: 'Специальность не должна превышать 100 символов' })
  specialty: string;

  @IsInt()
  @Min(1, { message: 'Количество студентов должно быть не менее 1' })
  @Max(100, { message: 'Количество студентов не должно превышать 100' })
  studentCount: number;

  @IsString()
  @MaxLength(50, { message: 'Период не должен превышать 50 символов' })
  period: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Описание не должно превышать 2000 символов' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Требования не должны превышать 1000 символов' })
  requirements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Локация не должна превышать 200 символов' })
  location?: string;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;
}

export class UpdateInternshipRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Специальность не должна превышать 100 символов' })
  specialty?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Количество студентов должно быть не менее 1' })
  @Max(100, { message: 'Количество студентов не должно превышать 100' })
  studentCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Период не должен превышать 50 символов' })
  period?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Описание не должно превышать 2000 символов' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Требования не должны превышать 1000 символов' })
  requirements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Локация не должна превышать 200 символов' })
  location?: string;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;
}

export class InternshipRequestActionDto {
  @IsString()
  @MaxLength(500, { message: 'Заметки не должны превышать 500 символов' })
  notes: string;
}

export class InternshipRequestQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  status?: InternshipRequestStatus;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

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
