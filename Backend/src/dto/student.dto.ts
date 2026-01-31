import { IsString, IsOptional, IsEmail, IsInt, IsNumber, Min, Max } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  studentId: string;

  @IsInt()
  @Min(1)
  @Max(6)
  yearOfStudy: number;

  @IsString()
  major: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  gpa?: number;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  yearOfStudy?: number;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  gpa?: number;

  @IsOptional()
  @IsString()
  phone?: string;
}
