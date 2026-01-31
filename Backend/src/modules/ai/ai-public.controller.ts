import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OllamaService } from './ollama.service';
import { AiService } from './ai.service';
import {
  AiResponseDto,
  ResumeAnalysisDto,
} from './dto/ai.dto';

@ApiTags('AI Public')
@Controller('ai-public')
export class AiPublicController {
  constructor(
    private readonly ollamaService: OllamaService,
    private readonly aiService: AiService
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Проверить доступность AI сервиса (БЕЗ АВТОРИЗАЦИИ)' })
  @ApiResponse({ status: 200, description: 'Статус AI сервиса' })
  async checkHealth(): Promise<{ healthy: boolean; models?: string[] }> {
    try {
      const healthy = await this.ollamaService.checkHealth();
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

  @Post('analyze-resume')
  @ApiOperation({ summary: 'Анализировать резюме и получить предложения по улучшению (БЕЗ АВТОРИЗАЦИИ)' })
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
