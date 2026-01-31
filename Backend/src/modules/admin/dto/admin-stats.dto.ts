import { IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AdminStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  universityId?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;
}
