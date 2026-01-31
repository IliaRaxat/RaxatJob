import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationQueryDto } from '../../dto/application.dto';
import { ApplicationStatus } from '@prisma/client';
import { APPLICATION_INCLUDE_FULL } from '../../shared/constants/prisma-fragments';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto, userId: string) {
    const { jobId } = createApplicationDto;

    // Проверяем, существует ли вакансия
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { hr: true },
    });

    if (!job) {
      throw new NotFoundException('Вакансия не найдена');
    }

    // Получаем профиль кандидата по userId
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        resumes: {
          where: { isDefault: true },
          take: 1
        },
      },
    });

    if (!candidateProfile) {
      throw new NotFoundException('Профиль кандидата не найден. Пожалуйста, заполните профиль перед откликом на вакансию');
    }

    // Проверяем, есть ли основное резюме
    const defaultResume = candidateProfile.resumes[0];
    if (!defaultResume) {
      throw new ConflictException('Для отклика на вакансию необходимо создать основное резюме');
    }

    // Проверяем, не откликался ли уже кандидат на эту вакансию
    const existingApplication = await this.prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: candidateProfile.id,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('Вы уже откликались на эту вакансию');
    }

    const application = await this.prisma.application.create({
      data: {
        jobId,
        candidateId: candidateProfile.id,
        hrId: job.hrId,
        resumeId: defaultResume.id, // Автоматически используем основное резюме
      },
    });

    return this.findOne(application.id);
  }

  async findAll(query: ApplicationQueryDto) {
    const { status, jobId, candidateId } = query;

    const where: any = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    if (candidateId) where.candidateId = candidateId;

    return this.prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
            hr: {
              select: {
                company: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        hr: {
          select: {
            firstName: true,
            lastName: true,
            company: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: APPLICATION_INCLUDE_FULL,
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto, userId: string) {
    console.log(`🔍 Обновление отклика ${id} пользователем ${userId}`);
    
    const application = await this.findOne(id);
    console.log(`📋 Отклик найден: HR ID = ${application.hrId}`);

    // Получаем HR профиль по userId
    const hrProfile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      select: { id: true, company: true, firstName: true, lastName: true }
    });

    if (!hrProfile) {
      console.log(`❌ HR профиль не найден для userId: ${userId}`);
      throw new ForbiddenException('HR профиль не найден');
    }

    console.log(`✅ Найден HR профиль: ${hrProfile.id} (${hrProfile.firstName} ${hrProfile.lastName})`);

    if (application.hrId !== hrProfile.id) {
      console.log(`❌ Отклик принадлежит HR ID: ${application.hrId}, а текущий HR ID: ${hrProfile.id}`);
      throw new ForbiddenException('У вас нет прав для редактирования этого отклика');
    }

    console.log(`✅ Права подтверждены, обновляем отклик`);

    const updatedApplication = await this.prisma.application.update({
      where: { id },
      data: {
        status: updateApplicationDto.status as any,
        notes: updateApplicationDto.notes,
      },
    });

    console.log(`✅ Отклик успешно обновлен`);
    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    console.log(`🗑️ Удаление отклика ${id} пользователем ${userId}`);
    
    const application = await this.findOne(id);
    console.log(`📋 Отклик найден: HR ID = ${application.hrId}, Candidate ID = ${application.candidateId}`);

    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new ForbiddenException('Пользователь не найден');
    }

    let hasPermission = false;

    if (user.role === 'HR') {
      // Для HR - проверяем, что отклик на его вакансию
      const hrProfile = await this.prisma.hRProfile.findUnique({
        where: { userId },
        select: { id: true }
      });

      if (hrProfile && application.hrId === hrProfile.id) {
        hasPermission = true;
        console.log(`✅ HR имеет права на удаление отклика`);
      }
    } else if (user.role === 'CANDIDATE') {
      // Для кандидата - проверяем, что это его отклик
      const candidateProfile = await this.prisma.candidateProfile.findUnique({
        where: { userId },
        select: { id: true }
      });

      if (candidateProfile && application.candidateId === candidateProfile.id) {
        hasPermission = true;
        console.log(`✅ Кандидат имеет права на удаление своего отклика`);
      }
    }

    if (!hasPermission) {
      console.log(`❌ Пользователь не имеет прав для удаления отклика`);
      throw new ForbiddenException('У вас нет прав для удаления этого отклика');
    }

    await this.prisma.application.delete({
      where: { id },
    });

    console.log(`✅ Отклик успешно удален`);
    return { message: 'Отклик успешно удален' };
  }

  async findByCandidate(userId: string) {
    // Получаем профиль кандидата по userId
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidateProfile) {
      throw new NotFoundException('Профиль кандидата не найден');
    }

    return this.prisma.application.findMany({
      where: { candidateId: candidateProfile.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
            status: true,
            hr: {
              select: {
                company: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findByHR(userId: string) {
    console.log(`🔍 Поиск откликов для HR пользователя: ${userId}`);
    
    // Получаем HR профиль по userId
    const hrProfile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      select: { id: true, company: true, firstName: true, lastName: true }
    });

    if (!hrProfile) {
      console.log(`❌ HR профиль не найден для userId: ${userId}`);
      throw new NotFoundException('HR профиль не найден');
    }

    console.log(`✅ Найден HR профиль: ${hrProfile.id} (${hrProfile.firstName} ${hrProfile.lastName}) для компании: ${hrProfile.company}`);

    const applications = await this.prisma.application.findMany({
      where: { hrId: hrProfile.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
            status: true,
            hr: {
              select: {
                company: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            title: true,
            summary: true,
            isDefault: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    console.log(`📊 Найдено откликов для HR: ${applications.length}`);
    
    // Дополнительная диагностика
    const allApplications = await this.prisma.application.findMany({
      select: { 
        id: true, 
        hrId: true, 
        status: true,
        appliedAt: true,
        job: { 
          select: { 
            id: true,
            title: true,
            hrId: true 
          } 
        },
        hr: { 
          select: { 
            id: true,
            company: true,
            firstName: true,
            lastName: true 
          } 
        },
        candidate: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    console.log('📋 Все отклики в системе:');
    allApplications.forEach(app => {
      console.log(`  - ID: ${app.id}, HR: ${app.hr.company} (${app.hr.firstName} ${app.hr.lastName}), HR ID: ${app.hrId}, Статус: ${app.status}, Кандидат: ${app.candidate.firstName} ${app.candidate.lastName}, Вакансия: ${app.job.title}`);
    });
    
    // Проверим, есть ли отклики именно для этого HR
    const hrApplications = allApplications.filter(app => app.hrId === hrProfile.id);
    console.log(`🎯 Отклики именно для этого HR (${hrProfile.id}): ${hrApplications.length}`);
    
    return applications;
  }

  async debugMyApplications(userId: string, userRole: string) {
    console.log(`🔍 Диагностика для пользователя: ${userId}, роль: ${userRole}`);
    
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });

    let profile: any = null;
    let applications: any[] = [];

    if (userRole === 'HR') {
      // Получаем HR профиль
      profile = await this.prisma.hRProfile.findUnique({
        where: { userId },
        select: { id: true, company: true, firstName: true, lastName: true }
      });

      if (profile) {
        applications = await this.prisma.application.findMany({
          where: { hrId: profile.id },
          select: { 
            id: true, 
            status: true, 
            appliedAt: true,
            job: { select: { title: true } },
            candidate: { select: { firstName: true, lastName: true } }
          }
        });
      }
    } else if (userRole === 'CANDIDATE') {
      // Получаем профиль кандидата
      profile = await this.prisma.candidateProfile.findUnique({
        where: { userId },
        select: { id: true, firstName: true, lastName: true }
      });

      if (profile) {
        applications = await this.prisma.application.findMany({
          where: { candidateId: profile.id },
          select: { 
            id: true, 
            status: true, 
            appliedAt: true,
            job: { select: { title: true } }
          }
        });
      }
    }

    // Получаем все отклики в системе для сравнения
    const allApplications = await this.prisma.application.findMany({
      select: { 
        id: true, 
        hrId: true, 
        candidateId: true,
        status: true,
        appliedAt: true,
        job: { 
          select: { 
            id: true,
            title: true,
            hrId: true 
          } 
        },
        hr: { 
          select: { 
            id: true,
            company: true,
            firstName: true,
            lastName: true,
            userId: true
          } 
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userId: true
          }
        }
      }
    });

    return {
      user,
      profile,
      applications,
      allApplications,
      totalApplications: allApplications.length,
      myApplicationsCount: applications.length,
      userRole
    };
  }

  async debugPermissions(applicationId: string, userId: string, userRole: string) {
    console.log(`🔍 Диагностика прав для отклика ${applicationId}, пользователь: ${userId}, роль: ${userRole}`);
    
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });

    // Получаем отклик
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            hrId: true
          }
        },
        hr: {
          select: {
            id: true,
            company: true,
            firstName: true,
            lastName: true,
            userId: true
          }
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userId: true
          }
        }
      }
    });

    if (!application) {
      return {
        error: 'Отклик не найден',
        user,
        application: null
      };
    }

    let profile: any = null;
    let hasUpdatePermission = false;
    let hasDeletePermission = false;

    if (userRole === 'HR') {
      // Получаем HR профиль
      profile = await this.prisma.hRProfile.findUnique({
        where: { userId },
        select: { id: true, company: true, firstName: true, lastName: true }
      });

      if (profile && application.hrId === profile.id) {
        hasUpdatePermission = true;
        hasDeletePermission = true;
      }
    } else if (userRole === 'CANDIDATE') {
      // Получаем профиль кандидата
      profile = await this.prisma.candidateProfile.findUnique({
        where: { userId },
        select: { id: true, firstName: true, lastName: true }
      });

      if (profile && application.candidateId === profile.id) {
        hasDeletePermission = true; // Кандидат может удалить свой отклик
        // Кандидат не может обновлять статус отклика
      }
    }

    return {
      user,
      profile,
      application,
      permissions: {
        canUpdate: hasUpdatePermission,
        canDelete: hasDeletePermission
      },
      analysis: {
        userRole,
        applicationHrId: application.hrId,
        applicationCandidateId: application.candidateId,
        profileId: profile?.id,
        hrMatch: profile && application.hrId === profile.id,
        candidateMatch: profile && application.candidateId === profile.id
      }
    };
  }
}
