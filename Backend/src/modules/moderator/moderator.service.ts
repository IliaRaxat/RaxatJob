import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { JobModerationQueryDto } from './dto/job-moderation-query.dto';
import { ModerationStatus } from '@prisma/client';

@Injectable()
export class ModeratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить список вакансий на модерацию
   */
  async getJobsForModeration(query: JobModerationQueryDto) {
    const {
      status = ModerationStatus.PENDING,
      search,
      company,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      moderationStatus: status,
    };

    // Поиск по названию вакансии или описанию
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Фильтр по компании
    if (company) {
      where.hr = {
        company: { contains: company, mode: 'insensitive' },
      };
    }

    // Фильтр по дате
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          hr: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
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
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить детали вакансии для модерации
   */
  async getJobDetails(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        hr: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
            candidate: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
            matches: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Вакансия не найдена');
    }

    return job;
  }

  /**
   * Одобрить вакансию
   */
  async approveJob(id: string, actionDto: ModerationActionDto, moderatorId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Вакансия не найдена');
    }

    if (job.moderationStatus !== ModerationStatus.PENDING) {
      throw new BadRequestException('Вакансия уже была обработана');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        moderationStatus: ModerationStatus.APPROVED,
        moderatedAt: new Date(),
        moderatorId,
        moderationNotes: actionDto.notes,
        status: 'ACTIVE', // Активируем вакансию
        publishedAt: new Date(), // Устанавливаем дату публикации
      },
      include: {
        hr: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Создаем запись в аудите
    await this.prisma.auditLog.create({
      data: {
        userId: moderatorId,
        action: 'JOB_APPROVED',
        entityType: 'Job',
        entityId: id,
        newValues: {
          moderationStatus: ModerationStatus.APPROVED,
          status: 'ACTIVE',
          notes: actionDto.notes,
        },
      },
    });

    return {
      message: 'Вакансия успешно одобрена',
      job: updatedJob,
    };
  }

  /**
   * Отклонить вакансию
   */
  async rejectJob(id: string, actionDto: ModerationActionDto, moderatorId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Вакансия не найдена');
    }

    if (job.moderationStatus !== ModerationStatus.PENDING) {
      throw new BadRequestException('Вакансия уже была обработана');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        moderationStatus: ModerationStatus.REJECTED,
        moderatedAt: new Date(),
        moderatorId,
        moderationNotes: actionDto.notes,
        status: 'CLOSED', // Закрываем вакансию
      },
      include: {
        hr: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Создаем запись в аудите
    await this.prisma.auditLog.create({
      data: {
        userId: moderatorId,
        action: 'JOB_REJECTED',
        entityType: 'Job',
        entityId: id,
        newValues: {
          moderationStatus: ModerationStatus.REJECTED,
          status: 'CLOSED',
          notes: actionDto.notes,
          reason: actionDto.reason,
        },
      },
    });

    return {
      message: 'Вакансия отклонена',
      job: updatedJob,
    };
  }

  /**
   * Вернуть вакансию на доработку
   */
  async returnJob(id: string, actionDto: ModerationActionDto, moderatorId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Вакансия не найдена');
    }

    if (job.moderationStatus !== ModerationStatus.PENDING) {
      throw new BadRequestException('Вакансия уже была обработана');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        moderationStatus: ModerationStatus.DRAFT,
        moderatedAt: new Date(),
        moderatorId,
        moderationNotes: actionDto.notes,
        status: 'DRAFT', // Возвращаем в черновик
      },
      include: {
        hr: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Создаем запись в аудите
    await this.prisma.auditLog.create({
      data: {
        userId: moderatorId,
        action: 'JOB_RETURNED',
        entityType: 'Job',
        entityId: id,
        newValues: {
          moderationStatus: ModerationStatus.DRAFT,
          status: 'DRAFT',
          notes: actionDto.notes,
          reason: actionDto.reason,
        },
      },
    });

    return {
      message: 'Вакансия возвращена на доработку',
      job: updatedJob,
    };
  }

  /**
   * Получить статистику модерации
   */
  async getModerationStats(moderatorId: string) {
    const [
      totalPending,
      totalApproved,
      totalRejected,
      totalReturned,
      myApproved,
      myRejected,
      myReturned,
      todayStats,
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
          moderationStatus: ModerationStatus.APPROVED,
          moderatorId,
        },
      }),
      this.prisma.job.count({
        where: {
          moderationStatus: ModerationStatus.REJECTED,
          moderatorId,
        },
      }),
      this.prisma.job.count({
        where: {
          moderationStatus: ModerationStatus.DRAFT,
          moderatorId,
        },
      }),
      this.prisma.job.count({
        where: {
          moderationStatus: ModerationStatus.PENDING,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
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
      my: {
        approved: myApproved,
        rejected: myRejected,
        returned: myReturned,
      },
      today: {
        newJobs: todayStats,
      },
    };
  }

  /**
   * Получить историю модерации
   */
  async getModerationHistory(query: any) {
    const { page = 1, limit = 20, moderatorId } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      moderationStatus: {
        in: [ModerationStatus.APPROVED, ModerationStatus.REJECTED, ModerationStatus.DRAFT],
      },
    };

    if (moderatorId) {
      where.moderatorId = moderatorId;
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
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
