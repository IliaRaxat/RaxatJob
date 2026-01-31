import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInternshipDto, UpdateInternshipDto, InternshipQueryDto, InternshipApplicationDto } from '../../dto/internship.dto';
import { InternshipStatus, ModerationStatus } from '@prisma/client';
import { InternshipRequestsService } from '../internship-requests/internship-requests.service';

@Injectable()
export class InternshipsService {
  constructor(
    private prisma: PrismaService,
    private internshipRequestsService: InternshipRequestsService
  ) {}

  /**
   * Получить ID профиля HR по userId
   */
  private async getHRProfileId(userId: string): Promise<string> {
    const hrProfile = await this.prisma.hRProfile.findUnique({
      where: { userId }
    });

    if (!hrProfile) {
      throw new NotFoundException('Профиль HR не найден');
    }

    return hrProfile.id;
  }

  /**
   * Получить ID профиля кандидата по userId
   */
  private async getCandidateProfileId(userId: string): Promise<string> {
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!candidateProfile) {
      throw new NotFoundException('Профиль кандидата не найден');
    }

    return candidateProfile.id;
  }

  /**
   * Создать стажировку
   */
  async create(createInternshipDto: CreateInternshipDto, userId: string) {
    const hrId = await this.getHRProfileId(userId);
    
    const { skills, tags, ...internshipData } = createInternshipDto;

    // Преобразуем даты в правильный формат
    const processedData: any = {
      ...internshipData,
      startDate: new Date(internshipData.startDate),
      endDate: new Date(internshipData.endDate),
      deadline: internshipData.deadline ? new Date(internshipData.deadline) : undefined,
    };

    const internship = await this.prisma.internship.create({
      data: {
        ...processedData,
        hrId,
        skills: skills ? JSON.stringify(skills) : undefined,
        tags: tags ? JSON.stringify(tags) : undefined,
        moderationStatus: ModerationStatus.PENDING,
        status: InternshipStatus.DRAFT,
      },
      include: {
        hr: {
          include: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // Создаем запись в аудите
    await this.prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'INTERNSHIP_CREATED',
        entityType: 'Internship',
        entityId: internship.id,
        newValues: {
          title: internship.title,
          status: InternshipStatus.DRAFT,
          moderationStatus: ModerationStatus.PENDING,
        },
      },
    });

    return internship;
  }

  /**
   * Добавляет информацию о статусе откликов к списку стажировок
   */
  private async addApplicationStatusToInternships(internships: any[], userId?: string) {
    if (!userId) {
      // Если пользователь не аутентифицирован, возвращаем стажировки без статуса отклика
      return internships.map(internship => ({
        ...internship,
        hasApplied: false,
        applicationStatus: null,
        appliedAt: null,
        applicationId: null,
        applicationCoverLetter: null,
        applicationNotes: null
      }));
    }

    try {
      // Получаем профиль кандидата
      const candidateProfile = await this.prisma.candidateProfile.findUnique({
        where: { userId },
        select: { id: true }
      });

      if (!candidateProfile) {
        // Если нет профиля кандидата, возвращаем стажировки без статуса отклика
        return internships.map(internship => ({
          ...internship,
          hasApplied: false,
          applicationStatus: null,
          appliedAt: null,
          applicationId: null,
          applicationCoverLetter: null,
          applicationNotes: null
        }));
      }

      // Получаем все отклики кандидата на эти стажировки
      const internshipIds = internships.map(internship => internship.id);
      
      const applications = await this.prisma.internshipApplication.findMany({
        where: {
          candidateId: candidateProfile.id,
          internshipId: { in: internshipIds }
        },
        select: {
          id: true,
          internshipId: true,
          status: true,
          appliedAt: true,
          coverLetter: true,
          notes: true
        }
      });

      // Создаем мапу откликов для быстрого поиска
      const applicationsMap = new Map();
      applications.forEach(app => {
        applicationsMap.set(app.internshipId, app);
      });

      // Добавляем информацию о статусе отклика к каждой стажировке
      return internships.map(internship => {
        const application = applicationsMap.get(internship.id);
        
        if (application) {
          return {
            ...internship,
            hasApplied: true,
            applicationStatus: application.status,
            appliedAt: application.appliedAt,
            applicationId: application.id,
            applicationCoverLetter: application.coverLetter,
            applicationNotes: application.notes
          };
        } else {
          return {
            ...internship,
            hasApplied: false,
            applicationStatus: null,
            appliedAt: null,
            applicationId: null,
            applicationCoverLetter: null,
            applicationNotes: null
          };
        }
      });
    } catch (error) {
      console.error('Error adding application status to internships:', error);
      // В случае ошибки возвращаем стажировки без статуса отклика
      return internships.map(internship => ({
        ...internship,
        hasApplied: false,
        applicationStatus: null,
        appliedAt: null,
        applicationId: null,
        applicationCoverLetter: null,
        applicationNotes: null
      }));
    }
  }

  /**
   * Получить все стажировки с фильтрацией
   */
  async findAll(query: InternshipQueryDto, userId?: string) {
    const where: any = {
      status: InternshipStatus.ACTIVE, // Показываем только активные стажировки
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { requirements: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.isRemote !== undefined) {
      where.isRemote = query.isRemote;
    }

    if (query.skill) {
      where.skillsRequired = {
        some: {
          skill: {
            name: { contains: query.skill, mode: 'insensitive' }
          }
        }
      };
    }

    const [internships, total] = await Promise.all([
      this.prisma.internship.findMany({
        where,
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
          skillsRequired: {
            include: {
              skill: true,
            },
          },
          _count: {
            select: {
              applications: true,
              participants: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: ((query.page || 1) - 1) * (query.limit || 10),
        take: query.limit || 10,
      }),
      this.prisma.internship.count({ where }),
    ]);

    // Добавляем информацию о статусе откликов
    const internshipsWithStatus = await this.addApplicationStatusToInternships(internships, userId);

    return {
      internships: internshipsWithStatus,
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Получить мои стажировки (для HR)
   */
  async findMyInternships(userId: string, query: InternshipQueryDto) {
    const hrId = await this.getHRProfileId(userId);
    
    const where: any = {
      hrId,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    const [internships, total] = await Promise.all([
      this.prisma.internship.findMany({
        where,
        include: {
          _count: {
            select: {
              applications: true,
              participants: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: ((query.page || 1) - 1) * (query.limit || 10),
        take: query.limit || 10,
      }),
      this.prisma.internship.count({ where }),
    ]);

    return {
      internships,
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Получить стажировку по ID
   */
  async findOne(id: string, userId?: string) {
    const internship = await this.prisma.internship.findUnique({
      where: { id },
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
        skillsRequired: {
          include: {
            skill: true,
          },
        },
        applications: {
          include: {
            candidate: {
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
        participants: {
          include: {
            candidate: {
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
        _count: {
          select: {
            applications: true,
            participants: true,
          },
        },
      },
    });

    if (!internship) {
      throw new NotFoundException('Стажировка не найдена');
    }

    // Увеличиваем счетчик просмотров
    await this.prisma.internship.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Добавляем информацию о статусе отклика
    const internshipsWithStatus = await this.addApplicationStatusToInternships([internship], userId);
    
    return internshipsWithStatus[0];
  }

  /**
   * Обновить стажировку
   */
  async update(id: string, updateInternshipDto: UpdateInternshipDto, userId: string) {
    const hrId = await this.getHRProfileId(userId);
    
    const existingInternship = await this.prisma.internship.findFirst({
      where: {
        id,
        hrId,
      },
    });

    if (!existingInternship) {
      throw new NotFoundException('Стажировка не найдена');
    }

    const { skills, tags, ...updateData } = updateInternshipDto;

    // Преобразуем даты в правильный формат, если они присутствуют
    const processedData: any = { ...updateData };
    if (updateData.startDate) {
      processedData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      processedData.endDate = new Date(updateData.endDate);
    }
    if (updateData.deadline) {
      processedData.deadline = new Date(updateData.deadline);
    }

    const internship = await this.prisma.internship.update({
      where: { id },
      data: {
        ...processedData,
        skills: skills ? JSON.stringify(skills) : undefined,
        tags: tags ? JSON.stringify(tags) : undefined,
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
        userId: userId,
        action: 'INTERNSHIP_UPDATED',
        entityType: 'Internship',
        entityId: id,
        oldValues: {
          title: existingInternship.title,
          status: existingInternship.status,
        },
        newValues: {
          title: internship.title,
          status: internship.status,
        },
      },
    });

    return internship;
  }

  /**
   * Удалить стажировку
   */
  async remove(id: string, userId: string) {
    const hrId = await this.getHRProfileId(userId);
    
    const existingInternship = await this.prisma.internship.findFirst({
      where: {
        id,
        hrId,
      },
    });

    if (!existingInternship) {
      throw new NotFoundException('Стажировка не найдена');
    }

    await this.prisma.internship.delete({
      where: { id },
    });

    // Создаем запись в аудите
    await this.prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'INTERNSHIP_DELETED',
        entityType: 'Internship',
        entityId: id,
        oldValues: {
          title: existingInternship.title,
          status: existingInternship.status,
        },
      },
    });

    return { message: 'Стажировка успешно удалена' };
  }

  /**
   * Подать заявку на стажировку
   */
  async applyToInternship(applicationDto: InternshipApplicationDto, userId: string) {
    const candidateId = await this.getCandidateProfileId(userId);
    
    const { internshipId, coverLetter } = applicationDto;

    // Проверяем, существует ли стажировка
    const internship = await this.prisma.internship.findUnique({
      where: { id: internshipId },
      include: { hr: true },
    });

    if (!internship) {
      throw new NotFoundException('Стажировка не найдена');
    }

    if (internship.status !== InternshipStatus.ACTIVE) {
      throw new ConflictException('Стажировка не активна');
    }

    // Проверяем, не подавал ли уже кандидат заявку
    const existingApplication = await this.prisma.internshipApplication.findUnique({
      where: {
        internshipId_candidateId: {
          internshipId,
          candidateId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('Вы уже подавали заявку на эту стажировку');
    }

    // Получаем основное резюме кандидата
    const defaultResume = await this.prisma.resume.findFirst({
      where: {
        candidateId,
        isDefault: true,
      },
    });

    const application = await this.prisma.internshipApplication.create({
      data: {
        internshipId,
        candidateId,
        hrId: internship.hrId,
        resumeId: defaultResume?.id,
        coverLetter,
      },
      include: {
        internship: {
          select: {
            title: true,
          },
        },
        candidate: {
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

    // Увеличиваем счетчик заявок
    await this.prisma.internship.update({
      where: { id: internshipId },
      data: { applicationsCount: { increment: 1 } },
    });

    // Создаем запись в аудите
    await this.prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'INTERNSHIP_APPLICATION_CREATED',
        entityType: 'InternshipApplication',
        entityId: application.id,
        newValues: {
          internshipId,
          status: 'PENDING',
        },
      },
    });

    return application;
  }

  /**
   * Получить мои заявки на стажировки (для кандидатов)
   */
  async getMyApplications(userId: string, query: InternshipQueryDto) {
    const candidateId = await this.getCandidateProfileId(userId);
    
    const where: any = {
      candidateId,
    };

    if (query.status) {
      where.status = query.status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.internshipApplication.findMany({
        where,
        include: {
          internship: {
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
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip: ((query.page || 1) - 1) * (query.limit || 10),
        take: query.limit || 10,
      }),
      this.prisma.internshipApplication.count({ where }),
    ]);

    return {
      applications,
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Получить заявки на мои стажировки (для HR)
   */
  async getApplicationsForMyInternships(userId: string, query: InternshipQueryDto) {
    const hrId = await this.getHRProfileId(userId);
    
    const where: any = {
      hrId,
    };

    if (query.status) {
      where.status = query.status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.internshipApplication.findMany({
        where,
        include: {
          internship: {
            select: {
              title: true,
            },
          },
          candidate: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          resume: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip: ((query.page || 1) - 1) * (query.limit || 10),
        take: query.limit || 10,
      }),
      this.prisma.internshipApplication.count({ where }),
    ]);

    return {
      applications,
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Принять заявку и добавить участника
   */
  async acceptApplication(applicationId: string, userId: string) {
    const hrId = await this.getHRProfileId(userId);
    
    // Получаем заявку
    const application = await this.prisma.internshipApplication.findFirst({
      where: {
        id: applicationId,
        hrId,
      },
      include: {
        internship: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (application.status !== 'PENDING') {
      throw new ConflictException('Заявка уже обработана');
    }

    // Проверяем, не превышен ли лимит участников
    if (application.internship.currentParticipants >= application.internship.maxParticipants) {
      throw new ConflictException('Достигнут максимальный лимит участников');
    }

    // Обновляем статус заявки
    await this.prisma.internshipApplication.update({
      where: { id: applicationId },
      data: { status: 'ACCEPTED' },
    });

    // Добавляем участника
    await this.prisma.internshipParticipant.create({
      data: {
        internshipId: application.internshipId,
        candidateId: application.candidateId,
        hrId: application.hrId,
        status: 'ACTIVE',
      },
    });

    // Увеличиваем счетчик участников
    await this.prisma.internship.update({
      where: { id: application.internshipId },
      data: { currentParticipants: { increment: 1 } },
    });

    return { message: 'Заявка принята, участник добавлен' };
  }

  /**
   * Отклонить заявку
   */
  async rejectApplication(applicationId: string, userId: string, reason?: string) {
    const hrId = await this.getHRProfileId(userId);
    
    const application = await this.prisma.internshipApplication.findFirst({
      where: {
        id: applicationId,
        hrId,
      },
    });

    if (!application) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (application.status !== 'PENDING') {
      throw new ConflictException('Заявка уже обработана');
    }

    await this.prisma.internshipApplication.update({
      where: { id: applicationId },
      data: { 
        status: 'REJECTED',
        notes: reason,
      },
    });

    return { message: 'Заявка отклонена' };
  }

  /**
   * Удалить участника из стажировки
   */
  async removeParticipant(participantId: string, userId: string) {
    const hrId = await this.getHRProfileId(userId);
    
    const participant = await this.prisma.internshipParticipant.findFirst({
      where: {
        id: participantId,
        hrId,
      },
    });

    if (!participant) {
      throw new NotFoundException('Участник не найден');
    }

    // Удаляем участника
    await this.prisma.internshipParticipant.delete({
      where: { id: participantId },
    });

    // Уменьшаем счетчик участников
    await this.prisma.internship.update({
      where: { id: participant.internshipId },
      data: { currentParticipants: { decrement: 1 } },
    });

    return { message: 'Участник удален из стажировки' };
  }

  /**
   * Обновить счетчик участников для стажировки
   */
  async updateParticipantsCount(internshipId: string) {
    const activeParticipants = await this.prisma.internshipParticipant.count({
      where: {
        internshipId,
        status: 'ACTIVE',
      },
    });

    await this.prisma.internship.update({
      where: { id: internshipId },
      data: { currentParticipants: activeParticipants },
    });

    return activeParticipants;
  }

  /**
   * Получить каталог заявок от университетов для компаний
   */
  async getUniversityRequestsCatalog(query: InternshipQueryDto) {
    const where: any = {
      status: 'PENDING', // Показываем только ожидающие заявки
    };

    if (query.search) {
      where.OR = [
        { specialty: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { requirements: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.isRemote !== undefined) {
      where.isRemote = query.isRemote;
    }

    const [requests, total] = await Promise.all([
      this.prisma.universityInternshipRequest.findMany({
        where,
        include: {
          university: {
            select: {
              name: true,
              address: true,
              website: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: ((query.page || 1) - 1) * (query.limit || 10),
        take: query.limit || 10,
      }),
      this.prisma.universityInternshipRequest.count({ where }),
    ]);

    return {
      requests,
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Создать заявку на стажировку от университета
   */
  async createUniversityRequest(requestDto: any, userId: string) {
    // Перенаправляем на сервис заявок от университетов
    return this.internshipRequestsService.create(requestDto, userId);
  }

  /**
   * Получить статистику стажировок
   */
  async getStats(userId: string) {
    const hrId = await this.getHRProfileId(userId);
    
    const stats = await this.prisma.internship.groupBy({
      by: ['status'],
      where: { hrId },
      _count: { status: true },
    });

    const totalInternships = await this.prisma.internship.count({
      where: { hrId },
    });

    const totalApplications = await this.prisma.internshipApplication.count({
      where: { hrId },
    });

    const totalParticipants = await this.prisma.internshipParticipant.count({
      where: { hrId },
    });

    return {
      totalInternships,
      totalApplications,
      totalParticipants,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
