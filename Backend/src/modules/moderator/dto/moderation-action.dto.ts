import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ModerationActionDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
