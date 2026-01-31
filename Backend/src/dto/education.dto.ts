import { IsString, IsOptional, IsDateString, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  degree: string;

  @IsString()
  field: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  gpa?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class UpdateEducationDto {
  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  gpa?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}
