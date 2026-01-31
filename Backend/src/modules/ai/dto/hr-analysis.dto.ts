import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JobAnalysisDto {
  @ApiProperty({
    description: 'ID вакансии для анализа кандидатов',
    example: 'job_123456789'
  })
  @IsString()
  @IsNotEmpty()
  jobId: string;
}

export class CandidateAnalysisResponseDto {
  @ApiProperty({ description: 'ID кандидата' })
  candidateId: string;

  @ApiProperty({ description: 'ID заявки' })
  applicationId: string;

  @ApiProperty({ description: 'Общая оценка кандидата (1-10)' })
  overallScore: number;

  @ApiProperty({ description: 'Оценка соответствия вакансии (0-100)' })
  matchScore: number;

  @ApiProperty({ 
    description: 'Уровень соответствия',
    enum: ['low', 'medium', 'high']
  })
  fitLevel: 'low' | 'medium' | 'high';

  @ApiProperty({ 
    description: 'Сильные стороны кандидата',
    type: [String]
  })
  strengths: string[];

  @ApiProperty({ 
    description: 'Слабые стороны кандидата',
    type: [String]
  })
  weaknesses: string[];

  @ApiProperty({ 
    description: 'Рекомендации для HR',
    type: [String]
  })
  recommendations: string[];

  @ApiProperty({ description: 'Комментарии AI' })
  aiNotes: string;
}

export class JobAnalysisResponseDto {
  @ApiProperty({ description: 'ID вакансии' })
  jobId: string;

  @ApiProperty({ description: 'Общее количество откликов' })
  totalApplications: number;

  @ApiProperty({ 
    description: 'Топ кандидаты с AI анализом',
    type: [CandidateAnalysisResponseDto]
  })
  topCandidates: CandidateAnalysisResponseDto[];

  @ApiProperty({ description: 'Краткое резюме анализа' })
  analysisSummary: string;

  @ApiProperty({ description: 'Время обработки в миллисекундах' })
  processingTime: number;
}