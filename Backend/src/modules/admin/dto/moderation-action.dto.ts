import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ModerationStatus } from '@prisma/client';

export class ModerationActionDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ModerationStatus)
  status?: ModerationStatus;
}
