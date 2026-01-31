import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OllamaService } from './ollama.service';
import {
  AiResponseDto,
} from './dto/ai.dto';

@ApiTags('AI Test')
@Controller('ai-test')
export class AiTestController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('chat')
  @ApiOperation({ 
    summary: 'Тестовый чат с AI (без авторизации)',
    description: 'Простой чат с AI агентом для тестирования'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ответ AI агента'
  })
  async chat(@Body() dto: { message: string; model?: string }): Promise<AiResponseDto> {
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
}
