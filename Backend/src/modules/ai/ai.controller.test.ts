import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { OllamaService } from './ollama.service';
import {
  JobDescriptionDto,
  JobMatchDto,
  RecommendationsDto,
  SkillsAnalysisDto,
  CoverLetterDto,
  ChatDto,
  AiResponseDto,
} from './dto/ai.dto';

@ApiTags('AI Agent (Test)')
@Controller('ai-test')
export class AiTestController {
  constructor(
    private readonly aiService: AiService,
    private readonly ollamaService: OllamaService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Проверить доступность AI сервиса (без авторизации)' })
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


  @Post('chat')
  @ApiOperation({ summary: 'Чат с AI агентом (без авторизации)' })
  @ApiResponse({ status: 200, description: 'Ответ AI агента', type: AiResponseDto })
  async chat(@Body() dto: ChatDto): Promise<AiResponseDto> {
    try {
      const startTime = Date.now();
      
      const response = await this.ollamaService.chat(
        [{ role: 'user', content: dto.message }],
        dto.model || 'gemma3:latest'
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
  @ApiOperation({ summary: 'Получить список доступных моделей (без авторизации)' })
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
}
