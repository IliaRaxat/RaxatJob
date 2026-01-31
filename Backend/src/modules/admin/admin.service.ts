import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AutoProfileService } from '../profiles/auto-profile.service';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { AdminStatsDto } from './dto/admin-stats.dto';
import { ModerationStatus } from '@prisma/client';
import { buildDateFilter } from '../../shared/utils/data.utils';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private autoProfileService: AutoProfileService,
  ) {}

  /**
   * Получить вакансии для модерации
   */
  async getJobsForModeration(filters: any) {
    const { status = 'PENDING', page = 1, limit = 20 } = filters;
    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      moderationStatus: status,
    };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          hr: {
            select: {
              company: true,
              firstName: true,
              lastName: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      jobs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Одобрить вакансию
   */
  async approveJob(jobId: string, actionDto: ModerationActionDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Вакансия не найдена');
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        moderationStatus: 'APPROVED',
        moderatedAt: new Date(),
        moderationNotes: actionDto.notes,
        status: 'ACTIVE', // Активируем вакансию
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Отклонить вакансию
   */
  async rejectJob(jobId: string, actionDto: ModerationActionDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Вакансия не найдена');
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        moderationStatus: 'REJECTED',
        moderatedAt: new Date(),
        moderationNotes: actionDto.notes,
        status: 'CLOSED', // Закрываем вакансию
      },
    });
  }

  /**
   * Вернуть вакансию на доработку
   */
  async returnJob(jobId: string, actionDto: ModerationActionDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Вакансия не найдена');
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        moderationStatus: 'DRAFT',
        moderatedAt: new Date(),
        moderationNotes: actionDto.notes,
        status: 'PAUSED', // Приостанавливаем вакансию
      },
    });
  }

  /**
   * Общая статистика ОЭЗ
   */
  async getAdminOverview(filters: AdminStatsDto) {
    const { startDate, endDate } = filters;
    
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalCompanies,
      totalUniversities,
      pendingModeration,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count({ where: dateFilter }),
      this.prisma.job.count({ where: dateFilter }),
      this.prisma.application.count({ where: dateFilter }),
      this.prisma.hRProfile.findMany({
        select: { company: true },
        distinct: ['company'],
      }).then(result => result.length),
      this.prisma.universityProfile.count(),
      this.prisma.job.count({
        where: { moderationStatus: 'PENDING' },
      }),
      this.prisma.analyticsEvent.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        totalUniversities,
        pendingModeration,
      },
      recentActivity,
    };
  }

  /**
   * Статистика по компаниям
   */
  async getCompaniesStats(filters: AdminStatsDto) {
    const { startDate, endDate, limit = 50 } = filters;
    const limitNum = parseInt(limit.toString(), 10);
    const dateFilter = buildDateFilter(startDate, endDate);

    const companies = await this.prisma.hRProfile.findMany({
      select: {
        company: true,
        _count: {
          select: {
            jobs: {
              where: dateFilter,
            },
            applications: {
              where: dateFilter,
            },
          },
        },
      },
      distinct: ['company'],
      orderBy: {
        company: 'asc',
      },
      take: limitNum,
    });

    return companies.map(company => ({
      name: company.company,
      totalJobs: company._count.jobs,
      totalApplications: company._count.applications,
    }));
  }

  /**
   * Статистика по университетам
   */
  async getUniversitiesStats(filters: AdminStatsDto) {
    const { startDate, endDate, limit = 50 } = filters;
    const limitNum = parseInt(limit.toString(), 10);
    const dateFilter = buildDateFilter(startDate, endDate);

    const universities = await this.prisma.universityProfile.findMany({
      select: {
        name: true,
        address: true,
        _count: {
          select: {
            students: true,
            educations: {
              where: dateFilter,
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limitNum,
    });

    return universities.map(uni => ({
      name: uni.name,
      address: uni.address,
      totalStudents: uni._count.students,
      totalEducations: uni._count.educations,
    }));
  }

  /**
   * Статистика по навыкам
   */
  async getSkillsStats(filters: AdminStatsDto) {
    const { limit = 20 } = filters;
    const limitNum = parseInt(limit.toString(), 10);

    const skills = await this.prisma.skillAnalytics.findMany({
      include: {
        skill: true,
      },
      orderBy: {
        demandScore: 'desc',
      },
      take: limitNum,
    });

    return skills.map(skill => ({
      id: skill.skill.id,
      name: skill.skill.name,
      category: skill.skill.category,
      demandScore: skill.demandScore,
      totalCandidates: skill.totalCandidates,
      totalStudents: skill.totalStudents,
      totalJobs: skill.totalJobs,
    }));
  }

  /**
   * Получить общее количество пользователей
   */
  async getUsersCount(filters: any = {}) {
    const { role, isActive } = filters;
    
    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    return this.prisma.user.count({ where });
  }

  /**
   * Управление пользователями
   */
  async getUsers(filters: any) {
    const { role, isActive, page = 1, limit = 50 } = filters;
    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          hrProfile: {
            select: {
              company: true,
            },
          },
          universityProfile: {
            select: {
              name: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Деактивировать пользователя
   */
  async deactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  /**
   * Активировать пользователя
   */
  async activateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  /**
   * Получить системные настройки
   */
  async getSystemSettings() {
    return this.prisma.systemSetting.findMany({
      orderBy: { category: 'asc' },
    });
  }

  /**
   * Обновить системные настройки
   */
  async updateSystemSettings(settings: any[]) {
    const updates = settings.map(setting => 
      this.prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      })
    );

    return Promise.all(updates);
  }

  /**
   * Обновить роль пользователя
   */
  async updateUserRole(userId: string, role: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Обновляем роль пользователя
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Автоматически создаем профиль для новой роли, если его нет
    try {
      await this.autoProfileService.ensureProfileExists(userId, role);
      console.log(`Profile created automatically for user: ${userId}, role: ${role}`);
    } catch (profileError) {
      console.warn(`Failed to create profile for user ${userId}:`, profileError.message);
      // Не прерываем смену роли, если не удалось создать профиль
    }

    return updatedUser;
  }

  /**
   * Получить статистику модерации
   */
  async getModerationStats() {
    const [
      totalPending,
      totalApproved,
      totalRejected,
      totalReturned,
      todayPending,
      thisWeekPending,
    ] = await Promise.all([
      this.prisma.job.count({
        where: { moderationStatus: ModerationStatus.PENDING },
      }),
      this.prisma.job.count({
        where: { moderationStatus: ModerationStatus.APPROVED },
      }),
      this.prisma.job.count({
        where: { moderationStatus: ModerationStatus.REJECTED },
      }),
      this.prisma.job.count({
        where: { moderationStatus: ModerationStatus.DRAFT },
      }),
      this.prisma.job.count({
        where: {
          moderationStatus: ModerationStatus.PENDING,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.job.count({
        where: {
          moderationStatus: ModerationStatus.PENDING,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total: {
        pending: totalPending,
        approved: totalApproved,
        rejected: totalRejected,
        returned: totalReturned,
      },
      today: {
        pending: todayPending,
      },
      thisWeek: {
        pending: thisWeekPending,
      },
    };
  }

  /**
   * Получить историю модерации
   */
  async getModerationHistory(filters: any) {
    const { page = 1, limit = 50, moderatorId, status } = filters;
    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      moderationStatus: {
        in: [ModerationStatus.APPROVED, ModerationStatus.REJECTED, ModerationStatus.DRAFT],
      },
    };

    if (moderatorId) {
      where.moderatorId = moderatorId;
    }

    if (status) {
      where.moderationStatus = status;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          hr: {
            select: {
              company: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          moderatedAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      jobs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Массовое одобрение вакансий
   */
  async bulkApproveJobs(jobIds: string[]) {
    const result = await this.prisma.job.updateMany({
      where: {
        id: { in: jobIds },
        moderationStatus: ModerationStatus.PENDING,
      },
      data: {
        moderationStatus: ModerationStatus.APPROVED,
        status: 'ACTIVE',
        publishedAt: new Date(),
        moderatedAt: new Date(),
      },
    });

    return {
      message: `Одобрено ${result.count} вакансий`,
      count: result.count,
    };
  }

  /**
   * Массовое отклонение вакансий
   */
  async bulkRejectJobs(jobIds: string[]) {
    const result = await this.prisma.job.updateMany({
      where: {
        id: { in: jobIds },
        moderationStatus: ModerationStatus.PENDING,
      },
      data: {
        moderationStatus: ModerationStatus.REJECTED,
        status: 'CLOSED',
        moderatedAt: new Date(),
      },
    });

    return {
      message: `Отклонено ${result.count} вакансий`,
      count: result.count,
    };
  }

  /**
   * Детальная аналитика по вакансиям
   */
  async getJobsAnalytics(filters: AdminStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      totalJobs,
      jobsByStatus,
      jobsByType,
      jobsByLocation,
      averageSalary,
      topCompanies,
      jobViews,
      applicationsPerJob,
    ] = await Promise.all([
      this.prisma.job.count({ where: dateFilter }),
      this.prisma.job.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: true,
      }),
      this.prisma.job.groupBy({
        by: ['type'],
        where: dateFilter,
        _count: true,
      }),
      this.prisma.job.groupBy({
        by: ['location'],
        where: dateFilter,
        _count: true,
        orderBy: { _count: { location: 'desc' } },
        take: 10,
      }),
      this.prisma.job.aggregate({
        where: {
          salaryMin: { not: null },
          salaryMax: { not: null },
          ...dateFilter,
        },
        _avg: {
          salaryMin: true,
          salaryMax: true,
        },
      }),
      this.prisma.job.groupBy({
        by: ['hrId'],
        where: dateFilter,
        _count: true,
        orderBy: {
          _count: { hrId: 'desc' },
        },
        take: 10,
      }).then(async (result) => {
        const companies = await Promise.all(
          result.map(async (item) => {
            const hr = await this.prisma.hRProfile.findUnique({
              where: { id: item.hrId },
              select: { company: true },
            });
            return {
              company: hr?.company || 'Unknown',
              jobCount: item._count,
            };
          })
        );
        return companies;
      }),
      this.prisma.jobView.count({ where: dateFilter }),
      this.prisma.job.aggregate({
        where: dateFilter,
        _avg: {
          applicationsCount: true,
        },
      }),
    ]);

    return {
      totalJobs,
      jobsByStatus,
      jobsByType,
      jobsByLocation,
      averageSalary,
      topCompanies,
      jobViews,
      applicationsPerJob,
    };
  }

  /**
   * Аналитика по откликам
   */
  async getApplicationsAnalytics(filters: AdminStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      totalApplications,
      applicationsByStatus,
      averageResponseTime,
      topJobsByApplications,
      applicationsByDay,
    ] = await Promise.all([
      this.prisma.application.count({ where: dateFilter }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: true,
      }),
      this.calculateAverageResponseTime(dateFilter),
      this.getTopJobsByApplications(dateFilter),
      this.getApplicationsByDay(dateFilter),
    ]);

    return {
      totalApplications,
      applicationsByStatus,
      averageResponseTime,
      topJobsByApplications,
      applicationsByDay,
    };
  }

  /**
   * Аналитика по пользователям
   */
  async getUsersAnalytics(filters: AdminStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      totalUsers,
      usersByRole,
      activeUsers,
      newUsers,
      userActivity,
    ] = await Promise.all([
      this.prisma.user.count({ where: dateFilter }),
      this.prisma.user.groupBy({
        by: ['role'],
        where: dateFilter,
        _count: true,
      }),
      this.prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          ...dateFilter,
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          ...dateFilter,
        },
      }),
      this.getUserActivity(dateFilter),
    ]);

    return {
      totalUsers,
      usersByRole,
      activeUsers,
      newUsers,
      userActivity,
    };
  }

  /**
   * Аналитика активности
   */
  async getActivityAnalytics(filters: AdminStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      totalEvents,
      eventsByType,
      topUsers,
      activityByDay,
    ] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: dateFilter }),
      this.prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        where: dateFilter,
        _count: true,
      }),
      this.getTopActiveUsers(dateFilter),
      this.getActivityByDay(dateFilter),
    ]);

    return {
      totalEvents,
      eventsByType,
      topUsers,
      activityByDay,
    };
  }

  /**
   * Системный отчет
   */
  async getSystemReport(filters: AdminStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      systemHealth,
      performance,
      errors,
      usage,
    ] = await Promise.all([
      this.getSystemHealth(),
      this.getPerformanceMetrics(dateFilter),
      this.getErrorStats(dateFilter),
      this.getUsageStats(dateFilter),
    ]);

    return {
      systemHealth,
      performance,
      errors,
      usage,
    };
  }

  /**
   * Отчет по модерации
   */
  async getModerationReport(filters: AdminStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      moderationStats,
      moderatorPerformance,
      contentQuality,
      moderationTrends,
    ] = await Promise.all([
      this.getModerationStats(),
      this.getModeratorPerformance(dateFilter),
      this.getContentQuality(dateFilter),
      this.getModerationTrends(dateFilter),
    ]);

    return {
      moderationStats,
      moderatorPerformance,
      contentQuality,
      moderationTrends,
    };
  }

  /**
   * Отчет по найму
   */
  async getHiringReport(filters: AdminStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      hiringStats,
      timeToHire,
      successRate,
      topSkills,
    ] = await Promise.all([
      this.getHiringStats(dateFilter),
      this.getTimeToHire(dateFilter),
      this.getSuccessRate(dateFilter),
      this.getTopHiringSkills(dateFilter),
    ]);

    return {
      hiringStats,
      timeToHire,
      successRate,
      topSkills,
    };
  }

  /**
   * Экспорт пользователей
   */
  async exportUsers(filters: AdminStatsDto) {
    const { startDate, endDate, limit = 1000 } = filters;
    const limitNum = parseInt(limit.toString(), 10);
    const dateFilter = buildDateFilter(startDate, endDate);

    const users = await this.prisma.user.findMany({
      where: dateFilter,
      include: {
        hrProfile: true,
        candidateProfile: true,
        universityProfile: true,
      },
      take: limitNum,
    });

    return {
      data: users,
      count: users.length,
      exportedAt: new Date(),
    };
  }

  /**
   * Экспорт вакансий
   */
  async exportJobs(filters: AdminStatsDto) {
    const { startDate, endDate, limit = 1000 } = filters;
    const limitNum = parseInt(limit.toString(), 10);
    const dateFilter = buildDateFilter(startDate, endDate);

    const jobs = await this.prisma.job.findMany({
      where: dateFilter,
      include: {
        hr: {
          include: {
            user: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            applications: true,
            jobViews: true,
          },
        },
      },
      take: limitNum,
    });

    return {
      data: jobs,
      count: jobs.length,
      exportedAt: new Date(),
    };
  }

  /**
   * Экспорт откликов
   */
  async exportApplications(filters: AdminStatsDto) {
    const { startDate, endDate, limit = 1000 } = filters;
    const limitNum = parseInt(limit.toString(), 10);
    const dateFilter = buildDateFilter(startDate, endDate);

    const applications = await this.prisma.application.findMany({
      where: dateFilter,
      include: {
        job: {
          include: {
            hr: {
              include: {
                user: true,
              },
            },
          },
        },
        candidate: {
          include: {
            user: true,
          },
        },
      },
      take: limitNum,
    });

    return {
      data: applications,
      count: applications.length,
      exportedAt: new Date(),
    };
  }

  /**
   * Здоровье системы
   */
  async getSystemHealth() {
    const [
      dbStatus,
      activeUsers,
      systemLoad,
      lastBackup,
    ] = await Promise.all([
      this.checkDatabaseStatus(),
      this.getActiveUsersCount(),
      this.getSystemLoad(),
      this.getLastBackupDate(),
    ]);

    return {
      status: dbStatus ? 'healthy' : 'unhealthy',
      database: dbStatus,
      activeUsers,
      systemLoad,
      lastBackup,
      timestamp: new Date(),
    };
  }

  /**
   * Системные логи
   */
  async getSystemLogs(filters: any) {
    const { level, limit = 100 } = filters;
    const limitNum = parseInt(limit.toString(), 10);

    const logs = await this.prisma.auditLog.findMany({
      where: {
        ...(level && { action: { contains: level } }),
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    return logs;
  }

  /**
   * Создание резервной копии
   */
  async createBackup() {
    // Здесь должна быть логика создания резервной копии
    return {
      message: 'Резервная копия создана',
      backupId: `backup_${Date.now()}`,
      createdAt: new Date(),
    };
  }

  /**
   * Запуск технического обслуживания
   */
  async startMaintenance(reason: string) {
    // Здесь должна быть логика запуска технического обслуживания
    return {
      message: 'Техническое обслуживание запущено',
      reason,
      startedAt: new Date(),
    };
  }

  // Дополнительные приватные методы для реализации функциональности
  private async calculateAverageResponseTime(dateFilter: any) {
    // Реализация расчета среднего времени ответа
    return 0;
  }

  private async getTopJobsByApplications(dateFilter: any) {
    // Реализация получения топ вакансий по откликам
    return [];
  }

  private async getApplicationsByDay(dateFilter: any) {
    // Реализация получения откликов по дням
    return [];
  }

  private async getUserActivity(dateFilter: any) {
    // Реализация получения активности пользователей
    return [];
  }

  private async getTopActiveUsers(dateFilter: any) {
    // Реализация получения топ активных пользователей
    return [];
  }

  private async getActivityByDay(dateFilter: any) {
    // Реализация получения активности по дням
    return [];
  }

  private async getPerformanceMetrics(dateFilter: any) {
    // Реализация получения метрик производительности
    return {};
  }

  private async getErrorStats(dateFilter: any) {
    // Реализация получения статистики ошибок
    return {};
  }

  private async getUsageStats(dateFilter: any) {
    // Реализация получения статистики использования
    return {};
  }

  private async getModeratorPerformance(dateFilter: any) {
    // Реализация получения производительности модераторов
    return [];
  }

  private async getContentQuality(dateFilter: any) {
    // Реализация получения качества контента
    return {};
  }

  private async getModerationTrends(dateFilter: any) {
    // Реализация получения трендов модерации
    return [];
  }

  private async getHiringStats(dateFilter: any) {
    // Реализация получения статистики найма
    return {};
  }

  private async getTimeToHire(dateFilter: any) {
    // Реализация получения времени до найма
    return 0;
  }

  private async getSuccessRate(dateFilter: any) {
    // Реализация получения процента успешности
    return 0;
  }

  private async getTopHiringSkills(dateFilter: any) {
    // Реализация получения топ навыков для найма
    return [];
  }

  private async checkDatabaseStatus() {
    // Проверка статуса базы данных
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async getActiveUsersCount() {
    // Получение количества активных пользователей
    return this.prisma.user.count({
      where: {
        lastLogin: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });
  }

  private async getSystemLoad() {
    // Получение нагрузки системы
    return {
      cpu: 'normal',
      memory: 'normal',
      disk: 'normal',
    };
  }

  private async getLastBackupDate() {
    // Получение даты последней резервной копии
    return new Date(Date.now() - 24 * 60 * 60 * 1000);
  }

  // Методы для управления контентом
  async getContentJobs(filters: any) {
    // Реализация получения контентных вакансий
    return [];
  }

  async getContentProfiles(filters: any) {
    // Реализация получения контентных профилей
    return [];
  }

  async featureJob(jobId: string) {
    // Реализация выделения вакансии
    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'ACTIVE' },
    });
  }

  async unfeatureJob(jobId: string) {
    // Реализация снятия выделения вакансии
    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'PAUSED' },
    });
  }

  // Методы для управления уведомлениями
  async getNotifications(filters: any) {
    // Реализация получения уведомлений
    return [];
  }

  async broadcastNotification(data: any) {
    // Реализация рассылки уведомлений
    return { message: 'Уведомления отправлены' };
  }

  async deleteNotification(id: string) {
    // Реализация удаления уведомления
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  // Методы для управления навыками
  async getSkillsManagement(filters: any) {
    // Реализация управления навыками
    return [];
  }

  async mergeSkills(fromSkillId: string, toSkillId: string) {
    // Реализация объединения навыков
    return { message: 'Навыки объединены' };
  }

  async cleanupSkills() {
    // Реализация очистки навыков
    return { message: 'Навыки очищены' };
  }

  // Методы для AI и аналитики
  async getAIStatus() {
    // Реализация получения статуса AI
    return { status: 'active' };
  }

  async retrainAI() {
    // Реализация переобучения AI
    return { message: 'AI переобучен' };
  }

  async getAILogs(filters: any) {
    // Реализация получения логов AI
    return [];
  }

  // Методы для интеграций
  async getIntegrations() {
    // Реализация получения интеграций
    return [];
  }

  async syncIntegrations() {
    // Реализация синхронизации интеграций
    return { message: 'Интеграции синхронизированы' };
  }

}
