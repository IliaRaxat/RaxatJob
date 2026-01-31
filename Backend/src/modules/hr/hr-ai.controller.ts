import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CandidateAnalysisService } from '../ai/candidate-analysis.service';
import { JobAnalysisDto } from '../ai/dto/hr-analysis.dto';

@ApiTags('HR AI Analysis')
@Controller('hr-ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HR', 'ADMIN')
@ApiBearerAuth()
export class HrAiController {
  constructor(
    private readonly candidateAnalysisService: CandidateAnalysisService,
  ) {}

  @Post('analyze-job-candidates')
  @ApiOperation({ 
    summary: 'Анализировать всех кандидатов на вакансию с помощью AI',
    description: 'HR может нажать кнопку и получить AI анализ всех откликов на его вакансию с рейтингом лучших кандидатов'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'AI анализ всех кандидатов на вакансию'
  })
  async analyzeJobCandidates(
    @Body() dto: JobAnalysisDto,
    @Request() req: any,
  ) {
    try {
      const userId = req.user.id;
      
      // Получаем HR профиль пользователя (как в HrService)
      const hrProfile = await this.candidateAnalysisService.getHrProfile(userId);
      
      if (!hrProfile) {
        throw new HttpException('HR профиль не найден. Создайте HR профиль через /profiles/hr', HttpStatus.FORBIDDEN);
      }

      const result = await this.candidateAnalysisService.analyzeJobCandidates(
        dto.jobId,
        hrProfile.id
      );

      return {
        success: true,
        data: result,
        message: `Проанализировано ${result.totalApplications} кандидатов за ${result.processingTime}мс`
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Ошибка AI анализа: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('job/:jobId/analysis')
  @ApiOperation({ 
    summary: 'Получить результаты AI анализа для вакансии'
  })
  async getJobAnalysis(
    @Param('jobId') jobId: string,
    @Request() req: any,
  ) {
    try {
      const userId = req.user.id;
      
      // Получаем HR профиль пользователя
      const hrProfile = await this.candidateAnalysisService.getHrProfile(userId);
      
      if (!hrProfile) {
        throw new HttpException('HR профиль не найден. Создайте HR профиль через /profiles/hr', HttpStatus.FORBIDDEN);
      }

      return {
        success: true,
        message: 'Для получения анализа запустите POST /hr-ai/analyze-job-candidates',
        data: null
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `Ошибка получения анализа: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Проверить доступность AI сервиса для HR' })
  async checkHealth() {
    try {
      return {
        success: true,
        data: {
          healthy: true,
          message: 'AI сервис доступен для анализа кандидатов'
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          healthy: false,
          message: 'AI сервис недоступен'
        }
      };
    }
  }

  @Get('test')
  @ApiOperation({ summary: 'Тестовый endpoint для проверки маршрута' })
  async test() {
    return {
      success: true,
      message: 'HR AI Analysis контроллер работает!',
      timestamp: new Date().toISOString()
    };
  }
}
