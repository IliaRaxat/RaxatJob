import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { AdminStatsDto } from './dto/admin-stats.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Панель модерации - список вакансий на модерацию
   */
  @Get('moderation/jobs')
  async getJobsForModeration(@Query() filters: any) {
    return this.adminService.getJobsForModeration(filters);
  }

  /**
   * Одобрить вакансию
   */
  @Patch('moderation/jobs/:id/approve')
  async approveJob(
    @Param('id') id: string,
    @Body() actionDto: ModerationActionDto,
  ) {
    return this.adminService.approveJob(id, actionDto);
  }

  /**
   * Отклонить вакансию
   */
  @Patch('moderation/jobs/:id/reject')
  async rejectJob(
    @Param('id') id: string,
    @Body() actionDto: ModerationActionDto,
  ) {
    return this.adminService.rejectJob(id, actionDto);
  }

  /**
   * Вернуть вакансию на доработку
   */
  @Patch('moderation/jobs/:id/return')
  async returnJob(
    @Param('id') id: string,
    @Body() actionDto: ModerationActionDto,
  ) {
    return this.adminService.returnJob(id, actionDto);
  }

  /**
   * Общая статистика ОЭЗ
   */
  @Get('analytics/overview')
  async getAdminOverview(@Query() filters: AdminStatsDto) {
    return this.adminService.getAdminOverview(filters);
  }

  /**
   * Статистика по компаниям
   */
  @Get('analytics/companies')
  async getCompaniesStats(@Query() filters: AdminStatsDto) {
    return this.adminService.getCompaniesStats(filters);
  }

  /**
   * Статистика по университетам
   */
  @Get('analytics/universities')
  async getUniversitiesStats(@Query() filters: AdminStatsDto) {
    return this.adminService.getUniversitiesStats(filters);
  }

  /**
   * Статистика по навыкам
   */
  @Get('analytics/skills')
  async getSkillsStats(@Query() filters: AdminStatsDto) {
    return this.adminService.getSkillsStats(filters);
  }

  /**
   * Получить общее количество пользователей
   */
  @Get('users/count')
  async getUsersCount(@Query() filters: any) {
    return this.adminService.getUsersCount(filters);
  }

  /**
   * Управление пользователями
   */
  @Get('users')
  async getUsers(@Query() filters: any) {
    return this.adminService.getUsers(filters);
  }

  /**
   * Деактивировать пользователя
   */
  @Patch('users/:id/deactivate')
  async deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  /**
   * Активировать пользователя
   */
  @Patch('users/:id/activate')
  async activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }

  /**
   * Системные настройки
   */
  @Get('settings')
  async getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  /**
   * Обновить системные настройки
   */
  @Patch('settings')
  async updateSystemSettings(@Body() settings: any) {
    return this.adminService.updateSystemSettings(settings);
  }

  /**
   * Назначить роль пользователю
   */
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() roleData: { role: UserRole },
  ) {
    return this.adminService.updateUserRole(id, roleData.role);
  }

  /**
   * Получить статистику модерации
   */
  @Get('moderation/stats')
  async getModerationStats() {
    return this.adminService.getModerationStats();
  }

  /**
   * Получить историю модерации
   */
  @Get('moderation/history')
  async getModerationHistory(@Query() filters: any) {
    return this.adminService.getModerationHistory(filters);
  }

  /**
   * Массовые действия с вакансиями
   */
  @Patch('moderation/bulk-approve')
  async bulkApproveJobs(@Body() data: { jobIds: string[] }) {
    return this.adminService.bulkApproveJobs(data.jobIds);
  }

  @Patch('moderation/bulk-reject')
  async bulkRejectJobs(@Body() data: { jobIds: string[] }) {
    return this.adminService.bulkRejectJobs(data.jobIds);
  }

  /**
   * Получить детальную статистику по вакансиям
   */
  @Get('analytics/jobs')
  async getJobsAnalytics(@Query() filters: AdminStatsDto) {
    return this.adminService.getJobsAnalytics(filters);
  }

  /**
   * Получить статистику по откликам
   */
  @Get('analytics/applications')
  async getApplicationsAnalytics(@Query() filters: AdminStatsDto) {
    return this.adminService.getApplicationsAnalytics(filters);
  }

  /**
   * Получить статистику по пользователям
   */
  @Get('analytics/users')
  async getUsersAnalytics(@Query() filters: AdminStatsDto) {
    return this.adminService.getUsersAnalytics(filters);
  }

  /**
   * Получить статистику по активности
   */
  @Get('analytics/activity')
  async getActivityAnalytics(@Query() filters: AdminStatsDto) {
    return this.adminService.getActivityAnalytics(filters);
  }

  /**
   * Получить отчеты по системе
   */
  @Get('reports/system')
  async getSystemReport(@Query() filters: AdminStatsDto) {
    return this.adminService.getSystemReport(filters);
  }

  /**
   * Получить отчеты по модерации
   */
  @Get('reports/moderation')
  async getModerationReport(@Query() filters: AdminStatsDto) {
    return this.adminService.getModerationReport(filters);
  }

  /**
   * Получить отчеты по найму
   */
  @Get('reports/hiring')
  async getHiringReport(@Query() filters: AdminStatsDto) {
    return this.adminService.getHiringReport(filters);
  }

  /**
   * Экспорт данных
   */
  @Get('export/users')
  async exportUsers(@Query() filters: AdminStatsDto) {
    return this.adminService.exportUsers(filters);
  }

  @Get('export/jobs')
  async exportJobs(@Query() filters: AdminStatsDto) {
    return this.adminService.exportJobs(filters);
  }

  @Get('export/applications')
  async exportApplications(@Query() filters: AdminStatsDto) {
    return this.adminService.exportApplications(filters);
  }

  /**
   * Управление системой
   */
  @Get('system/health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('system/logs')
  async getSystemLogs(@Query() filters: any) {
    return this.adminService.getSystemLogs(filters);
  }

  @Post('system/backup')
  async createBackup() {
    return this.adminService.createBackup();
  }

  @Post('system/maintenance')
  async startMaintenance(@Body() data: { reason: string }) {
    return this.adminService.startMaintenance(data.reason);
  }

  /**
   * Управление контентом
   */
  @Get('content/jobs')
  async getContentJobs(@Query() filters: any) {
    return this.adminService.getContentJobs(filters);
  }

  @Get('content/profiles')
  async getContentProfiles(@Query() filters: any) {
    return this.adminService.getContentProfiles(filters);
  }

  @Patch('content/jobs/:id/feature')
  async featureJob(@Param('id') id: string) {
    return this.adminService.featureJob(id);
  }

  @Patch('content/jobs/:id/unfeature')
  async unfeatureJob(@Param('id') id: string) {
    return this.adminService.unfeatureJob(id);
  }

  /**
   * Управление уведомлениями
   */
  @Get('notifications')
  async getNotifications(@Query() filters: any) {
    return this.adminService.getNotifications(filters);
  }

  @Post('notifications/broadcast')
  async broadcastNotification(@Body() data: any) {
    return this.adminService.broadcastNotification(data);
  }

  @Delete('notifications/:id')
  async deleteNotification(@Param('id') id: string) {
    return this.adminService.deleteNotification(id);
  }

  /**
   * Управление навыками
   */
  @Get('skills/management')
  async getSkillsManagement(@Query() filters: any) {
    return this.adminService.getSkillsManagement(filters);
  }

  @Post('skills/merge')
  async mergeSkills(@Body() data: { fromSkillId: string; toSkillId: string }) {
    return this.adminService.mergeSkills(data.fromSkillId, data.toSkillId);
  }

  @Post('skills/cleanup')
  async cleanupSkills() {
    return this.adminService.cleanupSkills();
  }

  /**
   * AI и аналитика
   */
  @Get('ai/status')
  async getAIStatus() {
    return this.adminService.getAIStatus();
  }

  @Post('ai/retrain')
  async retrainAI() {
    return this.adminService.retrainAI();
  }

  @Get('ai/logs')
  async getAILogs(@Query() filters: any) {
    return this.adminService.getAILogs(filters);
  }

  /**
   * Интеграции
   */
  @Get('integrations')
  async getIntegrations() {
    return this.adminService.getIntegrations();
  }

  @Post('integrations/sync')
  async syncIntegrations() {
    return this.adminService.syncIntegrations();
  }
}
