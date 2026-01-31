import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { OllamaService } from './ollama.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  JobDescriptionDto,
  JobMatchDto,
  RecommendationsDto,
  SkillsAnalysisDto,
  CoverLetterDto,
  ChatDto,
  AiResponseDto,
  ResumeAnalysisDto,
  ResumeImprovementDto,
} from './dto/ai.dto';

@ApiTags('AI Agent')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly ollamaService: OllamaService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Проверить доступность AI сервиса' })
  @ApiResponse({ status: 200, description: 'Статус AI сервиса' })
  async checkHealth(): Promise<{ healthy: boolean; models?: string[] }> {
    try {
      const healthy = await this.aiService.checkHealth();
      const models = healthy ? await this.ollamaService.getModels() : [];
      
      return {
        healthy,
        models,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to check AI service health',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Post('generate-job-description')
  @ApiOperation({ summary: 'Сгенерировать описание вакансии' })
  @ApiResponse({ status: 200, description: 'Сгенерированное описание вакансии', type: AiResponseDto })
  async generateJobDescription(@Body() dto: JobDescriptionDto): Promise<AiResponseDto> {
    try {
      return await this.aiService.generateJobDescription(dto.requirements);
    } catch (error) {
      throw new HttpException(
        'Failed to generate job description',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze-job-match')
  @ApiOperation({ summary: 'Анализировать соответствие кандидата и вакансии' })
  @ApiResponse({ status: 200, description: 'Результат анализа соответствия', type: AiResponseDto })
  async analyzeJobMatch(@Body() dto: JobMatchDto): Promise<AiResponseDto> {
    try {
      return await this.aiService.analyzeJobMatch(dto.candidateProfile, dto.jobRequirements);
    } catch (error) {
      throw new HttpException(
        'Failed to analyze job match',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-recommendations')
  @ApiOperation({ summary: 'Сгенерировать рекомендации для кандидата' })
  @ApiResponse({ status: 200, description: 'Персональные рекомендации', type: AiResponseDto })
  async generateRecommendations(@Body() dto: RecommendationsDto): Promise<AiResponseDto> {
    try {
      return await this.aiService.generateRecommendations(dto.candidateProfile, dto.targetJob);
    } catch (error) {
      throw new HttpException(
        'Failed to generate recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze-skills')
  @ApiOperation({ summary: 'Анализировать навыки кандидата' })
  @ApiResponse({ status: 200, description: 'Анализ навыков и рекомендации', type: AiResponseDto })
  async analyzeSkills(@Body() dto: SkillsAnalysisDto): Promise<AiResponseDto> {
    try {
      return await this.aiService.analyzeSkills(dto.skills, dto.targetSkills);
    } catch (error) {
      throw new HttpException(
        'Failed to analyze skills',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-cover-letter')
  @ApiOperation({ summary: 'Сгенерировать сопроводительное письмо' })
  @ApiResponse({ status: 200, description: 'Сгенерированное сопроводительное письмо', type: AiResponseDto })
  async generateCoverLetter(@Body() dto: CoverLetterDto): Promise<AiResponseDto> {
    try {
      return await this.aiService.generateCoverLetter(dto.candidateProfile, dto.jobDescription);
    } catch (error) {
      throw new HttpException(
        'Failed to generate cover letter',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('chat')
  @ApiOperation({ summary: 'Чат с AI агентом' })
  @ApiResponse({ status: 200, description: 'Ответ AI агента', type: AiResponseDto })
  async chat(@Body() dto: ChatDto): Promise<AiResponseDto> {
    try {
      const startTime = Date.now();
      
      const response = await this.ollamaService.chat(
        [{ role: 'user', content: dto.message }],
        dto.model || 'llama2'
      );
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: { response },
        processingTime,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to process chat message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('models')
  @ApiOperation({ summary: 'Получить список доступных моделей' })
  @ApiResponse({ status: 200, description: 'Список доступных моделей' })
  async getModels(): Promise<{ models: string[] }> {
    try {
      const models = await this.ollamaService.getModels();
      return { models };
    } catch (error) {
      throw new HttpException(
        'Failed to get models',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze-resume')
  @ApiOperation({ summary: 'Анализировать резюме и получить предложения по улучшению' })
  @ApiResponse({ 
    status: 200, 
    description: 'Анализ резюме с предложениями по улучшению', 
    type: AiResponseDto 
  })
  async analyzeResume(@Body() dto: ResumeAnalysisDto): Promise<AiResponseDto> {
    try {
      return await this.aiService.analyzeResume(dto.resumeText, dto.model);
    } catch (error) {
      throw new HttpException(
        'Failed to analyze resume',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


}
