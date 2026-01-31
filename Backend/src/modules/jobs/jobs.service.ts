import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AutoProfileService } from '../profiles/auto-profile.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto } from '../../dto/job.dto';
import { JobStatus, ModerationStatus, UserRole } from '@prisma/client';
import { JOB_INCLUDE_BASIC } from '../../shared/constants/prisma-fragments';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private autoProfileService: AutoProfileService
  ) {}

  async create(createJobDto: CreateJobDto, userId: string) {
    const { skillIds, deadline, ...jobData } = createJobDto;

    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'HR') {
      throw new ForbiddenException('Только пользователи с ролью HR могут создавать вакансии');
    }

    // Автоматически создаем HR профиль если не существует
    const hrProfileId = await this.autoProfileService.getProfileId(userId, user.role as UserRole);

    // Convert deadline string to DateTime if provided
    const deadlineDate = deadline ? new Date(deadline) : null;

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        deadline: deadlineDate,
        hrId: hrProfileId,
        moderationStatus: ModerationStatus.PENDING, // Новая вакансия попадает на модерацию
        status: JobStatus.DRAFT, // Сначала в черновик, пока не одобрена
        publishedAt: null, // Будет установлена после одобрения
      },
    });

    // Добавляем навыки к вакансии
    if (skillIds && skillIds.length > 0) {
      await this.prisma.jobSkill.createMany({
        data: skillIds.map(skillId => ({
          jobId: job.id,
          skillId,
          required: true,
        })),
      });
    }

    // Создаем запись в аудите
    await this.prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'JOB_CREATED',
        entityType: 'Job',
        entityId: job.id,
        newValues: {
          title: job.title,
          status: JobStatus.DRAFT,
          moderationStatus: ModerationStatus.PENDING,
        },
      },
    });

    return this.findOne(job.id);
  }

  async findAll(query: JobQueryDto, userId?: string) {
    const { search, type, experienceLevel, location, remote, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: JobStatus.ACTIVE,
      moderationStatus: ModerationStatus.APPROVED, // Показываем только одобренные вакансии
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (remote !== undefined) where.remote = remote;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: JOB_INCLUDE_BASIC,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    // Если пользователь аутентифицирован, добавляем информацию о статусе откликов
    let jobsWithApplicationStatus = jobs;
    if (userId) {
      jobsWithApplicationStatus = await this.addApplicationStatusToJobs(jobs, userId);
    }

    return {
      jobs: jobsWithApplicationStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string, ipAddress?: string, userAgent?: string) {
    console.log(`[DEBUG] findOne called with jobId: ${id}, userId: ${userId}`);
    
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        ...JOB_INCLUDE_BASIC,
        applications: {
          include: {
            candidate: {
              select: {
                firstName: true,
                lastName: true,
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
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    console.log(`[DEBUG] Job found: ${job.title}, applications count: ${job.applications.length}`);

    // Увеличиваем счетчик просмотров только для уникальных просмотров
    if (job.status === JobStatus.ACTIVE && job.moderationStatus === ModerationStatus.APPROVED) {
      await this.trackJobView(id, userId, ipAddress, userAgent);
    }

    // Добавляем информацию о статусе отклика, если пользователь аутентифицирован
    if (userId) {
      console.log(`[DEBUG] User is authenticated, adding application status`);
      const jobWithApplicationStatus = await this.addApplicationStatusToJobs([job], userId);
      return jobWithApplicationStatus[0];
    }

    console.log(`[DEBUG] User is not authenticated, returning basic info`);
    // Если пользователь не аутентифицирован, возвращаем базовую информацию без статуса отклика
    return {
      ...job,
      hasApplied: false,
      applicationStatus: null,
      appliedAt: null,
      applicationId: null,
      applicationCoverLetter: null,
      applicationNotes: null
    };
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string) {
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'HR') {
      throw new ForbiddenException('Только пользователи с ролью HR могут редактировать вакансии');
    }

    // Автоматически создаем HR профиль если не существует
    const hrProfileId = await this.autoProfileService.getProfileId(userId, user.role as UserRole);

    const job = await this.findOne(id);

    if (job.hrId !== hrProfileId) {
      throw new ForbiddenException('У вас нет прав для редактирования этой вакансии');
    }

    const { skillIds, deadline, ...jobData } = updateJobDto;

    // Convert deadline string to DateTime if provided
    const deadlineDate = deadline ? new Date(deadline) : undefined;

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        ...jobData,
        ...(deadlineDate !== undefined && { deadline: deadlineDate }),
      },
    });

    // Обновляем навыки, если они указаны
    if (skillIds !== undefined) {
      await this.prisma.jobSkill.deleteMany({
        where: { jobId: id },
      });

      if (skillIds.length > 0) {
        await this.prisma.jobSkill.createMany({
          data: skillIds.map(skillId => ({
            jobId: id,
            skillId,
            required: true,
          })),
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'HR') {
      throw new ForbiddenException('Только пользователи с ролью HR могут удалять вакансии');
    }

    // Автоматически создаем HR профиль если не существует
    const hrProfileId = await this.autoProfileService.getProfileId(userId, user.role as UserRole);

    const job = await this.findOne(id);

    if (job.hrId !== hrProfileId) {
      throw new ForbiddenException('У вас нет прав для удаления этой вакансии');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    return { message: 'Вакансия успешно удалена' };
  }

  async findByHR(userId: string) {
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'HR') {
      throw new ForbiddenException('Только пользователи с ролью HR могут просматривать свои вакансии');
    }

    // Автоматически создаем HR профиль если не существует
    const hrProfileId = await this.autoProfileService.getProfileId(userId, user.role as UserRole);

    return this.prisma.job.findMany({
      where: { hrId: hrProfileId },
      include: {
        ...JOB_INCLUDE_BASIC,
        applications: {
          include: {
            candidate: {
              select: {
                firstName: true,
                lastName: true,
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
    });
  }

  /**
   * Отслеживание просмотра вакансии
   * Увеличивает счетчик просмотров только для уникальных просмотров
   */
  private async trackJobView(jobId: string, userId?: string, ipAddress?: string, userAgent?: string) {
    try {
      // Проверяем, есть ли уже просмотр от этого пользователя
      const existingView = await this.prisma.jobView.findFirst({
        where: {
          jobId,
          OR: [
            // Для авторизованных пользователей
            ...(userId ? [{ userId }] : []),
            // Для анонимных пользователей по IP и User Agent
            ...(ipAddress && userAgent ? [{ 
              userId: null, 
              ipAddress, 
              userAgent 
            }] : []),
            // Только по IP, если нет User Agent
            ...(ipAddress && !userAgent ? [{ 
              userId: null, 
              ipAddress 
            }] : []),
          ],
        },
      });

      // Если просмотр уже существует, не увеличиваем счетчик
      if (existingView) {
        return;
      }

      // Создаем новую запись о просмотре
      await this.prisma.jobView.create({
        data: {
          jobId,
          userId: userId || null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });

      // Увеличиваем счетчик просмотров в таблице jobs
      await this.prisma.job.update({
        where: { id: jobId },
        data: { views: { increment: 1 } },
      });
    } catch (error) {
      // Логируем ошибку, но не прерываем выполнение
      console.error('Error tracking job view:', error);
    }
  }

  /**
   * Добавляет информацию о статусе откликов к списку вакансий
   */
  private async addApplicationStatusToJobs(jobs: any[], userId: string) {
    try {
      console.log(`[DEBUG] addApplicationStatusToJobs called for userId: ${userId}, jobs count: ${jobs.length}`);
      
      // Получаем профиль кандидата
      const candidateProfile = await this.prisma.candidateProfile.findUnique({
        where: { userId },
        select: { id: true }
      });

      console.log(`[DEBUG] Candidate profile found:`, candidateProfile);

      if (!candidateProfile) {
        console.log(`[DEBUG] No candidate profile found for userId: ${userId}`);
        // Если нет профиля кандидата, возвращаем вакансии без статуса отклика
        return jobs.map(job => ({
          ...job,
          hasApplied: false,
          applicationStatus: null,
          appliedAt: null,
          applicationId: null,
          applicationCoverLetter: null,
          applicationNotes: null
        }));
      }

      // Получаем все отклики кандидата на эти вакансии
      const jobIds = jobs.map(job => job.id);
      console.log(`[DEBUG] Looking for applications for jobIds:`, jobIds);
      console.log(`[DEBUG] Candidate ID:`, candidateProfile.id);
      
      const applications = await this.prisma.application.findMany({
        where: {
          candidateId: candidateProfile.id,
          jobId: { in: jobIds }
        },
        select: {
          id: true,
          jobId: true,
          status: true,
          appliedAt: true,
          coverLetter: true,
          notes: true
        }
      });

      console.log(`[DEBUG] Found applications:`, applications);

      // Создаем мапу откликов для быстрого поиска
      const applicationsMap = new Map();
      applications.forEach(app => {
        applicationsMap.set(app.jobId, {
          id: app.id,
          status: app.status,
          appliedAt: app.appliedAt,
          coverLetter: app.coverLetter,
          notes: app.notes
        });
      });

      console.log(`[DEBUG] Applications map:`, Object.fromEntries(applicationsMap));

      // Добавляем информацию о статусе отклика к каждой вакансии
      return jobs.map(job => {
        const application = applicationsMap.get(job.id);
        const result = {
          ...job,
          hasApplied: !!application,
          applicationStatus: application?.status || null,
          appliedAt: application?.appliedAt || null,
          applicationId: application?.id || null,
          applicationCoverLetter: application?.coverLetter || null,
          applicationNotes: application?.notes || null
        };
        console.log(`[DEBUG] Job ${job.id} result:`, { hasApplied: result.hasApplied, applicationStatus: result.applicationStatus });
        return result;
      });

    } catch (error) {
      console.error('Error adding application status to jobs:', error);
      // В случае ошибки возвращаем вакансии без статуса отклика
      return jobs.map(job => ({
        ...job,
        hasApplied: false,
        applicationStatus: null,
        appliedAt: null,
        applicationId: null,
        applicationCoverLetter: null,
        applicationNotes: null
      }));
    }
  }
}
