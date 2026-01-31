import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, Min, Max, MaxLength, IsArray, IsEnum, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { InternshipStatus } from '@prisma/client';

// Кастомный валидатор для дат
@ValidatorConstraint({ name: 'isValidDate', async: false })
export class IsValidDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return true; // Позволяем пустые значения для опциональных полей
    
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  defaultMessage(args: ValidationArguments) {
    return 'Поле должно содержать корректную дату';
  }
}

export class CreateInternshipDto {
  @IsString()
  @MaxLength(200, { message: 'Название стажировки не должно превышать 200 символов' })
  title: string;

  @IsString()
  @MaxLength(5000, { message: 'Описание не должно превышать 5000 символов' })
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: 'Требования не должны превышать 3000 символов' })
  requirements?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: 'Обязанности не должны превышать 3000 символов' })
  responsibilities?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Преимущества не должны превышать 2000 символов' })
  benefits?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  @MaxLength(200, { message: 'Локация не должна превышать 200 символов' })
  location: string;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @Validate(IsValidDateConstraint)
  startDate: string;

  @Validate(IsValidDateConstraint)
  endDate: string;

  @IsInt()
  @Min(1)
  @Max(365)
  duration: number; // Продолжительность в днях

  @IsInt()
  @Min(1)
  @Max(100)
  maxParticipants: number;

  @IsOptional()
  @Validate(IsValidDateConstraint)
  deadline?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateInternshipDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Название стажировки не должно превышать 200 символов' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Описание не должно превышать 5000 символов' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: 'Требования не должны превышать 3000 символов' })
  requirements?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: 'Обязанности не должны превышать 3000 символов' })
  responsibilities?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Преимущества не должны превышать 2000 символов' })
  benefits?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Локация не должна превышать 200 символов' })
  location?: string;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @IsOptional()
  @Validate(IsValidDateConstraint)
  startDate?: string;

  @IsOptional()
  @Validate(IsValidDateConstraint)
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  duration?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxParticipants?: number;

  @IsOptional()
  @Validate(IsValidDateConstraint)
  deadline?: string;

  @IsOptional()
  @IsEnum(InternshipStatus)
  status?: InternshipStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class InternshipQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(InternshipStatus)
  status?: InternshipStatus;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @IsOptional()
  @IsString()
  skill?: string;

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

export class InternshipApplicationDto {
  @IsString()
  internshipId: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Сопроводительное письмо не должно превышать 2000 символов' })
  coverLetter?: string;
}
