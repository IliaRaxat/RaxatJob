import { Controller, Get, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ModeratorService } from './moderator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { JobModerationQueryDto } from './dto/job-moderation-query.dto';

@Controller('moderator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
export class ModeratorController {
  constructor(private readonly moderatorService: ModeratorService) {}

  /**
   * Получить список вакансий на модерацию
   */
  @Get('jobs')
  async getJobsForModeration(@Query() query: JobModerationQueryDto) {
    return this.moderatorService.getJobsForModeration(query);
  }

  /**
   * Получить детали вакансии для модерации
   */
  @Get('jobs/:id')
  async getJobDetails(@Param('id') id: string) {
    return this.moderatorService.getJobDetails(id);
  }

  /**
   * Одобрить вакансию
   */
  @Patch('jobs/:id/approve')
  async approveJob(
    @Param('id') id: string,
    @Body() actionDto: ModerationActionDto,
    @Request() req,
  ) {
    return this.moderatorService.approveJob(id, actionDto, req.user.id);
  }

  /**
   * Отклонить вакансию
   */
  @Patch('jobs/:id/reject')
  async rejectJob(
    @Param('id') id: string,
    @Body() actionDto: ModerationActionDto,
    @Request() req,
  ) {
    return this.moderatorService.rejectJob(id, actionDto, req.user.id);
  }

  /**
   * Вернуть вакансию на доработку
   */
  @Patch('jobs/:id/return')
  async returnJob(
    @Param('id') id: string,
    @Body() actionDto: ModerationActionDto,
    @Request() req,
  ) {
    return this.moderatorService.returnJob(id, actionDto, req.user.id);
  }

  /**
   * Получить статистику модерации
   */
  @Get('stats')
  async getModerationStats(@Request() req) {
    return this.moderatorService.getModerationStats(req.user.id);
  }

  /**
   * Получить историю модерации
   */
  @Get('history')
  async getModerationHistory(@Query() query: any) {
    return this.moderatorService.getModerationHistory(query);
  }
}
