import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { UserRole } from '@prisma/client';
import { buildDateFilter } from '../../shared/utils/data.utils';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Общая статистика для дашборда
   */
  async getOverview(userId: string, userRole: UserRole, filters: DashboardStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const baseStats = await this.getBaseStats(dateFilter);
    
    // Добавляем специфичную статистику в зависимости от роли
    let roleSpecificStats = {};
    
    switch (userRole) {
      case UserRole.HR:
        roleSpecificStats = await this.getHRSpecificStats(userId, dateFilter);
        break;
      case UserRole.CANDIDATE:
        roleSpecificStats = await this.getCandidateSpecificStats(userId, dateFilter);
        break;
      case UserRole.UNIVERSITY:
        roleSpecificStats = await this.getUniversitySpecificStats(userId, dateFilter);
        break;
      case UserRole.ADMIN:
        roleSpecificStats = await this.getAdminSpecificStats(dateFilter);
        break;
    }

    return {
      ...baseStats,
      ...roleSpecificStats,
    };
  }

  /**
   * Статистика для HR
   */
  async getHRDashboard(userId: string, filters: DashboardStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const hrProfile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            lastLogin: true,
          },
        },
      },
    });

    if (!hrProfile) {
      throw new Error('HR профиль не найден');
    }

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      recentApplications,
      jobViews,
      topSkills,
      companyStats,
    ] = await Promise.all([
      this.prisma.job.count({
        where: {
          hrId: hrProfile.id,
          ...dateFilter,
        },
      }),
      this.prisma.job.count({
        where: {
          hrId: hrProfile.id,
          status: 'ACTIVE',
          ...dateFilter,
        },
      }),
      this.prisma.application.count({
        where: {
          hrId: hrProfile.id,
          ...dateFilter,
        },
      }),
      this.prisma.application.findMany({
        where: {
          hrId: hrProfile.id,
          ...dateFilter,
        },
        include: {
          job: {
            select: {
              title: true,
              hr: {
                select: {
                  company: true,
                },
              },
            },
          },
          candidate: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: 10,
      }),
      this.prisma.jobView.count({
        where: {
          job: {
            hrId: hrProfile.id,
          },
          ...dateFilter,
        },
      }),
      this.getTopSkillsForHR(hrProfile.id, dateFilter),
      this.getCompanyStats(hrProfile.company, dateFilter),
    ]);

    return {
      profile: hrProfile,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        jobViews,
      },
      recentApplications,
      topSkills,
      companyStats,
    };
  }

  /**
   * Статистика для кандидата
   */
  async getCandidateDashboard(userId: string, filters: DashboardStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            lastLogin: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!candidateProfile) {
      throw new Error('Профиль кандидата не найден');
    }

    const [
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      recentApplications,
      recommendedJobs,
      skillMatches,
    ] = await Promise.all([
      this.prisma.application.count({
        where: {
          candidateId: candidateProfile.id,
          ...dateFilter,
        },
      }),
      this.prisma.application.count({
        where: {
          candidateId: candidateProfile.id,
          status: 'PENDING',
          ...dateFilter,
        },
      }),
      this.prisma.application.count({
        where: {
          candidateId: candidateProfile.id,
          status: 'ACCEPTED',
          ...dateFilter,
        },
      }),
      this.prisma.application.count({
        where: {
          candidateId: candidateProfile.id,
          status: 'REJECTED',
          ...dateFilter,
        },
      }),
      this.prisma.application.findMany({
        where: {
          candidateId: candidateProfile.id,
          ...dateFilter,
        },
        include: {
          job: {
            select: {
              title: true,
              location: true,
              hr: {
                select: {
                  company: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: 10,
      }),
      this.getRecommendedJobs(candidateProfile.id),
      this.getSkillMatches(candidateProfile.id),
    ]);

    return {
      profile: candidateProfile,
      stats: {
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
      },
      recentApplications,
      recommendedJobs,
      skillMatches,
    };
  }

  /**
   * Статистика для университета
   */
  async getUniversityDashboard(userId: string, filters: DashboardStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const universityProfile = await this.prisma.universityProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            lastLogin: true,
          },
        },
        students: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    if (!universityProfile) {
      throw new Error('Профиль университета не найден');
    }

    const [
      totalStudents,
      studentsWithSkills,
      totalEducations,
      skillDistribution,
      employmentStats,
    ] = await Promise.all([
      this.prisma.student.count({
        where: {
          universityId: universityProfile.id,
          ...dateFilter,
        },
      }),
      this.prisma.student.count({
        where: {
          universityId: universityProfile.id,
          skills: {
            some: {},
          },
          ...dateFilter,
        },
      }),
      this.prisma.education.count({
        where: {
          universityId: universityProfile.id,
          ...dateFilter,
        },
      }),
      this.getSkillDistribution(universityProfile.id),
      this.getEmploymentStats(universityProfile.id, dateFilter),
    ]);

    return {
      profile: universityProfile,
      stats: {
        totalStudents,
        studentsWithSkills,
        totalEducations,
      },
      skillDistribution,
      employmentStats,
    };
  }

  /**
   * Популярные навыки
   */
  async getPopularSkills(filters: DashboardStatsDto) {
    const { limit = 20 } = filters;

    const skills = await this.prisma.skillAnalytics.findMany({
      include: {
        skill: true,
      },
      orderBy: {
        demandScore: 'desc',
      },
      take: limit,
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
   * Статистика по вакансиям
   */
  async getJobsStats(filters: DashboardStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      totalJobs,
      activeJobs,
      pendingModeration,
      jobsByType,
      jobsByLocation,
      averageSalary,
    ] = await Promise.all([
      this.prisma.job.count({ where: dateFilter }),
      this.prisma.job.count({
        where: {
          status: 'ACTIVE',
          ...dateFilter,
        },
      }),
      this.prisma.job.count({
        where: {
          moderationStatus: 'PENDING',
          ...dateFilter,
        },
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
        orderBy: {
          _count: {
            location: 'desc',
          },
        },
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
    ]);

    return {
      totalJobs,
      activeJobs,
      pendingModeration,
      jobsByType,
      jobsByLocation,
      averageSalary,
    };
  }

  /**
   * Статистика по откликам
   */
  async getApplicationsStats(filters: DashboardStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      totalApplications,
      applicationsByStatus,
      averageResponseTime,
      topJobsByApplications,
    ] = await Promise.all([
      this.prisma.application.count({ where: dateFilter }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: true,
      }),
      this.calculateAverageResponseTime(dateFilter),
      this.getTopJobsByApplications(dateFilter),
    ]);

    return {
      totalApplications,
      applicationsByStatus,
      averageResponseTime,
      topJobsByApplications,
    };
  }

  /**
   * Активность пользователей
   */
  async getActivity(userId: string, filters: DashboardStatsDto) {
    const { startDate, endDate, limit = 20 } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const activities = await this.prisma.analyticsEvent.findMany({
      where: {
        userId,
        ...dateFilter,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities;
  }

  /**
   * Тренды и аналитика
   */
  async getTrends(filters: DashboardStatsDto) {
    const { startDate, endDate } = filters;
    const dateFilter = buildDateFilter(startDate, endDate);

    const [
      jobTrends,
      applicationTrends,
      skillTrends,
      userTrends,
    ] = await Promise.all([
      this.getJobTrends(dateFilter),
      this.getApplicationTrends(dateFilter),
      this.getSkillTrends(dateFilter),
      this.getUserTrends(dateFilter),
    ]);

    return {
      jobTrends,
      applicationTrends,
      skillTrends,
      userTrends,
    };
  }

  /**
   * Рекомендации для пользователя
   */
  async getRecommendations(userId: string, userRole: UserRole, filters: DashboardStatsDto) {
    switch (userRole) {
      case UserRole.CANDIDATE:
        return this.getCandidateRecommendations(userId, filters);
      case UserRole.HR:
        return this.getHRRecommendations(userId, filters);
      case UserRole.UNIVERSITY:
        return this.getUniversityRecommendations(userId, filters);
      default:
        return [];
    }
  }

  /**
   * Уведомления для дашборда
   */
  async getNotifications(userId: string, filters: DashboardStatsDto) {
    const { limit = 10 } = filters;

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'SENT'] },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications;
  }

  // Приватные методы для базовой статистики
  private async getBaseStats(dateFilter: any) {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalCompanies,
    ] = await Promise.all([
      this.prisma.user.count({ where: dateFilter }),
      this.prisma.job.count({ where: dateFilter }),
      this.prisma.application.count({ where: dateFilter }),
      this.prisma.hRProfile.findMany({
        select: { company: true },
        distinct: ['company'],
      }).then(result => result.length),
    ]);

    return {
      totalUsers,
      totalJobs,
      totalApplications,
      totalCompanies,
    };
  }

  private async getHRSpecificStats(userId: string, dateFilter: any) {
    const hrProfile = await this.prisma.hRProfile.findUnique({
      where: { userId },
    });

    if (!hrProfile) return {};

    const [myJobs, myApplications] = await Promise.all([
      this.prisma.job.count({
        where: {
          hrId: hrProfile.id,
          ...dateFilter,
        },
      }),
      this.prisma.application.count({
        where: {
          hrId: hrProfile.id,
          ...dateFilter,
        },
      }),
    ]);

    return {
      myJobs,
      myApplications,
    };
  }

  private async getCandidateSpecificStats(userId: string, dateFilter: any) {
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidateProfile) return {};

    const [myApplications, myMatches] = await Promise.all([
      this.prisma.application.count({
        where: {
          candidateId: candidateProfile.id,
          ...dateFilter,
        },
      }),
      this.prisma.jobMatch.count({
        where: {
          candidateId: candidateProfile.id,
          ...dateFilter,
        },
      }),
    ]);

    return {
      myApplications,
      myMatches,
    };
  }

  private async getUniversitySpecificStats(userId: string, dateFilter: any) {
    const universityProfile = await this.prisma.universityProfile.findUnique({
      where: { userId },
    });

    if (!universityProfile) return {};

    const [myStudents, myEducations] = await Promise.all([
      this.prisma.student.count({
        where: {
          universityId: universityProfile.id,
          ...dateFilter,
        },
      }),
      this.prisma.education.count({
        where: {
          universityId: universityProfile.id,
          ...dateFilter,
        },
      }),
    ]);

    return {
      myStudents,
      myEducations,
    };
  }

  private async getAdminSpecificStats(dateFilter: any) {
    const [
      pendingModeration,
      totalUniversities,
      systemHealth,
    ] = await Promise.all([
      this.prisma.job.count({
        where: {
          moderationStatus: 'PENDING',
          ...dateFilter,
        },
      }),
      this.prisma.universityProfile.count(),
      this.getSystemHealth(),
    ]);

    return {
      pendingModeration,
      totalUniversities,
      systemHealth,
    };
  }

  // Дополнительные приватные методы
  private async getTopSkillsForHR(hrId: string, dateFilter: any) {
    // Реализация получения топ навыков для HR
    return [];
  }

  private async getCompanyStats(company: string, dateFilter: any) {
    // Реализация получения статистики компании
    return {};
  }

  private async getRecommendedJobs(candidateId: string) {
    // Реализация получения рекомендованных вакансий
    return [];
  }

  private async getSkillMatches(candidateId: string) {
    // Реализация получения совпадений навыков
    return [];
  }

  private async getSkillDistribution(universityId: string) {
    // Реализация получения распределения навыков
    return {};
  }

  private async getEmploymentStats(universityId: string, dateFilter: any) {
    // Реализация получения статистики трудоустройства
    return {};
  }

  private async calculateAverageResponseTime(dateFilter: any) {
    // Реализация расчета среднего времени ответа
    return 0;
  }

  private async getTopJobsByApplications(dateFilter: any) {
    // Реализация получения топ вакансий по откликам
    return [];
  }

  private async getJobTrends(dateFilter: any) {
    // Реализация получения трендов вакансий
    return [];
  }

  private async getApplicationTrends(dateFilter: any) {
    // Реализация получения трендов откликов
    return [];
  }

  private async getSkillTrends(dateFilter: any) {
    // Реализация получения трендов навыков
    return [];
  }

  private async getUserTrends(dateFilter: any) {
    // Реализация получения трендов пользователей
    return [];
  }

  private async getCandidateRecommendations(userId: string, filters: DashboardStatsDto) {
    // Реализация рекомендаций для кандидата
    return [];
  }

  private async getHRRecommendations(userId: string, filters: DashboardStatsDto) {
    // Реализация рекомендаций для HR
    return [];
  }

  private async getUniversityRecommendations(userId: string, filters: DashboardStatsDto) {
    // Реализация рекомендаций для университета
    return [];
  }

  private async getSystemHealth() {
    // Реализация проверки здоровья системы
    return {
      status: 'healthy',
      uptime: '99.9%',
      lastCheck: new Date(),
    };
  }
}
