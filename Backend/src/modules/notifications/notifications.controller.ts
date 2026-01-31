import { Controller, Get, Post, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Получить уведомления пользователя
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  getUserNotifications(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Request() req?: any
  ) {
    return this.notificationsService.getUserNotifications(req.user.id, {
      page,
      limit,
      status: status as any,
      type: type as any,
    });
  }

  /**
   * Получить уведомления о стажировках для HR
   */
  @Get('internship')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  getInternshipNotifications(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Request() req?: any
  ) {
    return this.notificationsService.getInternshipNotifications(req.user.id, {
      page,
      limit,
      status: status as any,
    });
  }

  /**
   * Получить статистику уведомлений
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getNotificationStats(@Request() req) {
    return this.notificationsService.getNotificationStats(req.user.id);
  }

  /**
   * Отметить уведомление как прочитанное
   */
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  /**
   * Отметить уведомление о стажировке как прочитанное
   */
  @Patch('internship/:id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  markInternshipNotificationAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markInternshipNotificationAsRead(id, req.user.id);
  }
}
