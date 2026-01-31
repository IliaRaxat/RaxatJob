import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AddCandidateSkillDto {
  @IsString()
  skillId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  level: number;
}

export class UpdateCandidateSkillDto {
  @IsInt()
  @Min(1)
  @Max(5)
  level: number;
}

export class AddStudentSkillDto {
  @IsString()
  skillId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  level: number;
}

export class UpdateStudentSkillDto {
  @IsInt()
  @Min(1)
  @Max(5)
  level: number;
}
