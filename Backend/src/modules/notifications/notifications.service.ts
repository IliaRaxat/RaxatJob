import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, NotificationPriority, NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Создать уведомление
   */
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    priority?: NotificationPriority;
    title: string;
    message: string;
    data?: any;
    scheduledAt?: Date;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        priority: data.priority || NotificationPriority.MEDIUM,
        title: data.title,
        message: data.message,
        data: data.data || undefined,
        scheduledAt: data.scheduledAt,
        status: NotificationStatus.PENDING,
      },
    });
  }

  /**
   * Создать уведомление о новой заявке на стажировку
   */
  async createInternshipRequestNotification(data: {
    requestId: string;
    hrId: string;
    universityName: string;
    specialty: string;
    studentCount: number;
    period: string;
  }) {
    return this.prisma.internshipNotification.create({
      data: {
        requestId: data.requestId,
        hrId: data.hrId,
        type: NotificationType.IN_APP,
        priority: NotificationPriority.MEDIUM,
        title: 'Новая заявка на стажировку',
        message: `Университет ${data.universityName} подал заявку на стажировку по специальности "${data.specialty}" для ${data.studentCount} студентов на период ${data.period}`,
        data: {
          specialty: data.specialty,
          studentCount: data.studentCount,
          period: data.period,
          universityName: data.universityName,
        },
        status: NotificationStatus.PENDING,
      },
    });
  }

  /**
   * Получить уведомления пользователя
   */
  async getUserNotifications(userId: string, options: {
    page?: number;
    limit?: number;
    status?: NotificationStatus;
    type?: NotificationType;
  } = {}) {
    const where: any = { userId };

    if (options.status) {
      where.status = options.status;
    }

    if (options.type) {
      where.type = options.type;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: ((options.page || 1) - 1) * (options.limit || 10),
        take: options.limit || 10,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      page: options.page || 1,
      limit: options.limit || 10,
      totalPages: Math.ceil(total / (options.limit || 10)),
    };
  }

  /**
   * Получить уведомления о стажировках для HR
   */
  async getInternshipNotifications(hrId: string, options: {
    page?: number;
    limit?: number;
    status?: NotificationStatus;
  } = {}) {
    const where: any = { hrId };

    if (options.status) {
      where.status = options.status;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.internshipNotification.findMany({
        where,
        include: {
          request: {
            include: {
              university: {
                include: {
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: ((options.page || 1) - 1) * (options.limit || 10),
        take: options.limit || 10,
      }),
      this.prisma.internshipNotification.count({ where }),
    ]);

    return {
      notifications,
      total,
      page: options.page || 1,
      limit: options.limit || 10,
      totalPages: Math.ceil(total / (options.limit || 10)),
    };
  }

  /**
   * Отметить уведомление как прочитанное
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  /**
   * Отметить уведомление о стажировке как прочитанное
   */
  async markInternshipNotificationAsRead(notificationId: string, hrId: string) {
    return this.prisma.internshipNotification.updateMany({
      where: {
        id: notificationId,
        hrId,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  /**
   * Отправить уведомления всем HR о новой заявке
   */
  async notifyAllHRAboutNewRequest(requestData: {
    requestId: string;
    universityName: string;
    specialty: string;
    studentCount: number;
    period: string;
  }) {
    // Находим всех HR, которые могут быть заинтересованы в стажировках
    const interestedHRs = await this.prisma.hRProfile.findMany({
      where: {
        jobs: {
          some: {
            type: 'INTERNSHIP',
            status: 'ACTIVE',
          },
        },
      },
      include: {
        user: true,
      },
    });

    // Создаем уведомления для всех заинтересованных HR
    const notifications = interestedHRs.map(hr => ({
      requestId: requestData.requestId,
      hrId: hr.id,
      type: NotificationType.IN_APP,
      priority: NotificationPriority.MEDIUM,
      title: 'Новая заявка на стажировку',
      message: `Университет ${requestData.universityName} подал заявку на стажировку по специальности "${requestData.specialty}" для ${requestData.studentCount} студентов на период ${requestData.period}`,
      data: {
        specialty: requestData.specialty,
        studentCount: requestData.studentCount,
        period: requestData.period,
        universityName: requestData.universityName,
      },
      status: NotificationStatus.PENDING,
    }));

    if (notifications.length > 0) {
      await this.prisma.internshipNotification.createMany({
        data: notifications,
      });
    }

    return notifications.length;
  }

  /**
   * Получить статистику уведомлений
   */
  async getNotificationStats(userId: string) {
    const [total, unread, byType] = await Promise.all([
      this.prisma.notification.count({
        where: { userId },
      }),
      this.prisma.notification.count({
        where: {
          userId,
          status: NotificationStatus.PENDING,
        },
      }),
      this.prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),
    ]);

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Удалить старые уведомления
   */
  async cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        status: NotificationStatus.READ,
      },
    });
  }
}
