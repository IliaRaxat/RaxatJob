import { IsString, IsOptional, IsArray, IsObject, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class JobDescriptionDto {
  @ApiProperty({ description: 'Требования для генерации описания вакансии' })
  @IsString()
  requirements: string;
}

export class JobMatchDto {
  @ApiProperty({ description: 'Профиль кандидата' })
  @IsObject()
  candidateProfile: any;

  @ApiProperty({ description: 'Требования вакансии' })
  @IsObject()
  jobRequirements: any;
}

export class RecommendationsDto {
  @ApiProperty({ description: 'Профиль кандидата' })
  @IsObject()
  candidateProfile: any;

  @ApiProperty({ description: 'Целевая вакансия' })
  @IsObject()
  targetJob: any;
}

export class SkillsAnalysisDto {
  @ApiProperty({ description: 'Текущие навыки кандидата', type: [String] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ description: 'Целевые навыки', type: [String] })
  @IsArray()
  @IsString({ each: true })
  targetSkills: string[];
}

export class CoverLetterDto {
  @ApiProperty({ description: 'Профиль кандидата' })
  @IsObject()
  candidateProfile: any;

  @ApiProperty({ description: 'Описание вакансии' })
  @IsString()
  jobDescription: string;
}

export class ChatDto {
  @ApiProperty({ description: 'Сообщение для AI' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Модель для использования', default: 'llama2' })
  @IsOptional()
  @IsString()
  model?: string;
}

export class AiResponseDto {
  @ApiProperty({ description: 'Успешность операции' })
  success: boolean;

  @ApiPropertyOptional({ description: 'Данные ответа' })
  data?: any;

  @ApiPropertyOptional({ description: 'Сообщение об ошибке' })
  error?: string;

  @ApiPropertyOptional({ description: 'Время обработки в миллисекундах' })
  processingTime?: number;
}

export class ResumeAnalysisResultDto {
  @ApiPropertyOptional({ description: 'Имя кандидата' })
  name?: string;

  @ApiPropertyOptional({ description: 'Email кандидата' })
  email?: string;

  @ApiPropertyOptional({ description: 'Телефон кандидата' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Навыки', type: [String] })
  skills?: string[];

  @ApiPropertyOptional({ description: 'Опыт работы' })
  experience?: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;

  @ApiPropertyOptional({ description: 'Образование' })
  education?: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;

  @ApiPropertyOptional({ description: 'Краткое резюме' })
  summary?: string;
}

export class JobMatchResultDto {
  @ApiProperty({ description: 'Оценка соответствия от 0 до 100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  match_score: number;

  @ApiProperty({ description: 'Сильные стороны', type: [String] })
  @IsArray()
  @IsString({ each: true })
  strengths: string[];

  @ApiProperty({ description: 'Слабые стороны', type: [String] })
  @IsArray()
  @IsString({ each: true })
  weaknesses: string[];

  @ApiProperty({ description: 'Рекомендации', type: [String] })
  @IsArray()
  @IsString({ each: true })
  recommendations: string[];

  @ApiProperty({ description: 'Уровень соответствия' })
  @IsString()
  fit_level: 'low' | 'medium' | 'high';
}

export class ResumeAnalysisDto {
  @ApiProperty({ description: 'Текст резюме для анализа' })
  @IsString()
  resumeText: string;

  @ApiPropertyOptional({ description: 'Модель для использования', default: 'gemma3:latest' })
  @IsOptional()
  @IsString()
  model?: string;
}

export class ResumeImprovementDto {
  @ApiProperty({ description: 'Общая оценка резюме от 1 до 10' })
  @IsNumber()
  @Min(1)
  @Max(10)
  overall_score: number;

  @ApiProperty({ description: 'Сильные стороны резюме', type: [String] })
  @IsArray()
  @IsString({ each: true })
  strengths: string[];

  @ApiProperty({ description: 'Слабые стороны резюме', type: [String] })
  @IsArray()
  @IsString({ each: true })
  weaknesses: string[];

  @ApiProperty({ description: 'Конкретные предложения по улучшению', type: [String] })
  @IsArray()
  @IsString({ each: true })
  improvements: string[];

  @ApiProperty({ description: 'Ключевые слова для добавления', type: [String] })
  @IsArray()
  @IsString({ each: true })
  keywords_to_add: string[];

  @ApiProperty({ description: 'Лишнее/ненужное в резюме', type: [String] })
  @IsArray()
  @IsString({ each: true })
  unnecessary: string[];
}