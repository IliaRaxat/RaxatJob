import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  company: string;

  @IsString()
  position: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class UpdateExperienceDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}
