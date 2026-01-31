import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInternshipRequestDto, UpdateInternshipRequestDto, InternshipRequestQueryDto, InternshipRequestActionDto } from '../../dto/internship-request.dto';
import { InternshipRequestStatus } from '@prisma/client';

@Injectable()
export class InternshipRequestsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить ID профиля университета по userId
   */
  private async getUniversityProfileId(userId: string): Promise<string> {
    const universityProfile = await this.prisma.universityProfile.findUnique({
      where: { userId }
    });

    if (!universityProfile) {
      throw new NotFoundException('Профиль университета не найден');
    }

    return universityProfile.id;
  }

  /**
   * Создать заявку на стажировку
   */
  async create(createInternshipRequestDto: CreateInternshipRequestDto, userId: string) {
    const universityId = await this.getUniversityProfileId(userId);
    
    const { skills, ...requestData } = createInternshipRequestDto;

    const request = await this.prisma.universityInternshipRequest.create({
      data: {
        ...requestData,
        universityId,
        skills: skills || undefined,
      },
      include: {
        university: {
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
        action: 'INTERNSHIP_REQUEST_CREATED',
        entityType: 'UniversityInternshipRequest',
        entityId: request.id,
        newValues: {
          specialty: request.specialty,
          studentCount: request.studentCount,
          status: InternshipRequestStatus.PENDING,
        },
      },
    });

    // Отправляем уведомления компаниям
    await this.notifyCompanies(request.id);

    return request;
  }

  /**
   * Получить все заявки университета
   */
  async findAll(userId: string, query: InternshipRequestQueryDto) {
    const universityId = await this.getUniversityProfileId(userId);
    
    const where: any = {
      universityId,
    };

    if (query.search) {
      where.OR = [
        { specialty: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { requirements: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.specialty) {
      where.specialty = { contains: query.specialty, mode: 'insensitive' };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.isRemote !== undefined) {
      where.isRemote = query.isRemote;
    }

    const [requests, total] = await Promise.all([
      this.prisma.universityInternshipRequest.findMany({
        where,
        include: {
          university: {
            include: {
              user: {
                select: {
                  email: true,
                  role: true,
                },
              },
            },
          },
          approvedByHR: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
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
   * Получить заявку по ID
   */
  async findOne(id: string, userId: string) {
    const universityId = await this.getUniversityProfileId(userId);
    
    const request = await this.prisma.universityInternshipRequest.findFirst({
      where: {
        id,
        universityId,
      },
      include: {
        university: {
          include: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
        approvedByHR: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        notifications: {
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
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    return request;
  }

  /**
   * Обновить заявку
   */
  async update(id: string, updateInternshipRequestDto: UpdateInternshipRequestDto, userId: string) {
    const universityId = await this.getUniversityProfileId(userId);
    
    const existingRequest = await this.prisma.universityInternshipRequest.findFirst({
      where: {
        id,
        universityId,
      },
    });

    if (!existingRequest) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (existingRequest.status !== InternshipRequestStatus.PENDING) {
      throw new ConflictException('Можно редактировать только заявки со статусом PENDING');
    }

    const { skills, ...updateData } = updateInternshipRequestDto;

    const request = await this.prisma.universityInternshipRequest.update({
      where: { id },
      data: {
        ...updateData,
        skills: skills || undefined,
      },
      include: {
        university: {
          include: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
        approvedByHR: {
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
        action: 'INTERNSHIP_REQUEST_UPDATED',
        entityType: 'UniversityInternshipRequest',
        entityId: id,
        oldValues: {
          specialty: existingRequest.specialty,
          studentCount: existingRequest.studentCount,
        },
        newValues: {
          specialty: request.specialty,
          studentCount: request.studentCount,
        },
      },
    });

    return request;
  }

  /**
   * Удалить заявку
   */
  async remove(id: string, userId: string) {
    const universityId = await this.getUniversityProfileId(userId);
    
    const existingRequest = await this.prisma.universityInternshipRequest.findFirst({
      where: {
        id,
        universityId,
      },
    });

    if (!existingRequest) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (existingRequest.status !== InternshipRequestStatus.PENDING) {
      throw new ConflictException('Можно удалять только заявки со статусом PENDING');
    }

    await this.prisma.universityInternshipRequest.delete({
      where: { id },
    });

    // Создаем запись в аудите
    await this.prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'INTERNSHIP_REQUEST_DELETED',
        entityType: 'UniversityInternshipRequest',
        entityId: id,
        oldValues: {
          specialty: existingRequest.specialty,
          studentCount: existingRequest.studentCount,
        },
      },
    });

    return { message: 'Заявка успешно удалена' };
  }

  /**
   * Получить каталог заявок для компаний
   */
  async getCatalogForCompanies(query: InternshipRequestQueryDto) {
    const where: any = {
      status: InternshipRequestStatus.PENDING,
    };

    if (query.search) {
      where.OR = [
        { specialty: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { requirements: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.specialty) {
      where.specialty = { contains: query.specialty, mode: 'insensitive' };
    }

    if (query.isRemote !== undefined) {
      where.isRemote = query.isRemote;
    }

    const [requests, total] = await Promise.all([
      this.prisma.universityInternshipRequest.findMany({
        where,
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
   * Одобрить заявку (для HR)
   */
  async approveRequest(id: string, actionDto: InternshipRequestActionDto, hrId: string) {
    const request = await this.prisma.universityInternshipRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (request.status !== InternshipRequestStatus.PENDING) {
      throw new ConflictException('Заявка уже была обработана');
    }

    const updatedRequest = await this.prisma.universityInternshipRequest.update({
      where: { id },
      data: {
        status: InternshipRequestStatus.APPROVED,
        approvedBy: hrId,
        approvedAt: new Date(),
        notes: actionDto.notes,
      },
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
        approvedByHR: {
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
        userId: hrId,
        action: 'INTERNSHIP_REQUEST_APPROVED',
        entityType: 'UniversityInternshipRequest',
        entityId: id,
        newValues: {
          status: InternshipRequestStatus.APPROVED,
          notes: actionDto.notes,
        },
      },
    });

    return updatedRequest;
  }

  /**
   * Отклонить заявку (для HR)
   */
  async rejectRequest(id: string, actionDto: InternshipRequestActionDto, hrId: string) {
    const request = await this.prisma.universityInternshipRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (request.status !== InternshipRequestStatus.PENDING) {
      throw new ConflictException('Заявка уже была обработана');
    }

    const updatedRequest = await this.prisma.universityInternshipRequest.update({
      where: { id },
      data: {
        status: InternshipRequestStatus.REJECTED,
        approvedBy: hrId,
        approvedAt: new Date(),
        rejectionReason: actionDto.notes,
      },
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
        approvedByHR: {
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
        userId: hrId,
        action: 'INTERNSHIP_REQUEST_REJECTED',
        entityType: 'UniversityInternshipRequest',
        entityId: id,
        newValues: {
          status: InternshipRequestStatus.REJECTED,
          rejectionReason: actionDto.notes,
        },
      },
    });

    return updatedRequest;
  }

  /**
   * Отправить уведомления компаниям о новой заявке
   */
  private async notifyCompanies(requestId: string) {
    // Получаем заявку с информацией о специальности
    const request = await this.prisma.universityInternshipRequest.findUnique({
      where: { id: requestId },
      include: {
        university: true,
      },
    });

    if (!request) return;

    // Находим HR профили, которые могут быть заинтересованы в этой специальности
    const interestedHRs = await this.prisma.hRProfile.findMany({
      where: {
        jobs: {
          some: {
            type: 'INTERNSHIP',
            status: 'ACTIVE',
            // Здесь можно добавить логику поиска по навыкам или специальности
          },
        },
      },
      include: {
        user: true,
      },
    });

    // Создаем уведомления для заинтересованных HR
    const notifications = interestedHRs.map(hr => ({
      requestId,
      hrId: hr.id,
      type: 'IN_APP' as const,
      priority: 'MEDIUM' as const,
      title: 'Новая заявка на стажировку',
      message: `Университет ${request.university.name} подал заявку на стажировку по специальности "${request.specialty}" для ${request.studentCount} студентов`,
      data: {
        specialty: request.specialty,
        studentCount: request.studentCount,
        period: request.period,
        universityName: request.university.name,
      },
    }));

    if (notifications.length > 0) {
      await this.prisma.internshipNotification.createMany({
        data: notifications,
      });
    }
  }

  /**
   * Получить статистику заявок университета
   */
  async getStats(userId: string) {
    const universityId = await this.getUniversityProfileId(userId);
    
    const stats = await this.prisma.universityInternshipRequest.groupBy({
      by: ['status'],
      where: { universityId },
      _count: { status: true },
    });

    const totalRequests = await this.prisma.universityInternshipRequest.count({
      where: { universityId },
    });

    const approvedRequests = await this.prisma.universityInternshipRequest.count({
      where: {
        universityId,
        status: InternshipRequestStatus.APPROVED,
      },
    });

    return {
      totalRequests,
      approvedRequests,
      approvalRate: totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
