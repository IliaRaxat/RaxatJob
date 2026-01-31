import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Общая статистика для дашборда
   */
  @Get('overview')
  async getOverview(@Request() req, @Query() filters: DashboardStatsDto) {
    return this.dashboardService.getOverview(req.user.id, req.user.role, filters);
  }

  /**
   * Статистика для HR
   */
  @Get('hr')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR)
  async getHRDashboard(@Request() req, @Query() filters: DashboardStatsDto) {
    return this.dashboardService.getHRDashboard(req.user.id, filters);
  }

  /**
   * Статистика для кандидата
   */
  @Get('candidate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CANDIDATE)
  async getCandidateDashboard(@Request() req, @Query() filters: DashboardStatsDto) {
    return this.dashboardService.getCandidateDashboard(req.user.id, filters);
  }

  /**
   * Статистика для университета
   */
  @Get('university')
  @UseGuards(RolesGuard)
  @Roles(UserRole.UNIVERSITY)
  async getUniversityDashboard(@Request() req, @Query() filters: DashboardStatsDto) {
    return this.dashboardService.getUniversityDashboard(req.user.id, filters);
  }

  /**
   * Популярные навыки
   */
  @Get('skills/popular')
  async getPopularSkills(@Query() filters: DashboardStatsDto) {
    return this.dashboardService.getPopularSkills(filters);
  }

  /**
   * Статистика по вакансиям
   */
  @Get('jobs/stats')
  async getJobsStats(@Query() filters: DashboardStatsDto) {
    return this.dashboardService.getJobsStats(filters);
  }

  /**
   * Статистика по откликам
   */
  @Get('applications/stats')
  async getApplicationsStats(@Query() filters: DashboardStatsDto) {
    return this.dashboardService.getApplicationsStats(filters);
  }

  /**
   * Активность пользователей
   */
  @Get('activity')
  async getActivity(@Request() req, @Query() filters: DashboardStatsDto) {
    return this.dashboardService.getActivity(req.user.id, filters);
  }

  /**
   * Тренды и аналитика
   */
  @Get('trends')
  async getTrends(@Query() filters: DashboardStatsDto) {
    return this.dashboardService.getTrends(filters);
  }

  /**
   * Рекомендации для пользователя
   */
  @Get('recommendations')
  async getRecommendations(@Request() req, @Query() filters: DashboardStatsDto) {
    return this.dashboardService.getRecommendations(req.user.id, req.user.role, filters);
  }

  /**
   * Уведомления для дашборда
   */
  @Get('notifications')
  async getNotifications(@Request() req, @Query() filters: DashboardStatsDto) {
    return this.dashboardService.getNotifications(req.user.id, filters);
  }
}
