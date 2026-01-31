import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ModerationStatus } from '@prisma/client';

export class JobModerationQueryDto {
  @IsOptional()
  @IsEnum(ModerationStatus)
  status?: ModerationStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
