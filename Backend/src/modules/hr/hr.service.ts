import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationQueryDto } from '../../dto/application.dto';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async getCompanyResponses(userId: string, query: ApplicationQueryDto) {
    console.log(`🔍 Поиск откликов для пользователя: ${userId}`);
    
    // Получаем HR профиль пользователя
    const hrProfile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      select: { id: true, company: true, firstName: true, lastName: true }
    });

    if (!hrProfile) {
      console.log(`❌ HR профиль не найден для userId: ${userId}`);
      
      // Покажем все HR профили для отладки
      const allHrProfiles = await this.prisma.hRProfile.findMany({
        select: { id: true, userId: true, company: true, firstName: true, lastName: true }
      });
      console.log('📋 Все HR профили в системе:', allHrProfiles);
      
      // Покажем информацию о пользователе
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });
      console.log('👤 Информация о пользователе:', user);
      
      throw new Error(`HR профиль не найден для пользователя ${userId}. Создайте HR профиль через /profiles/hr`);
    }

    console.log(`✅ Найден HR профиль: ${hrProfile.id} (${hrProfile.firstName} ${hrProfile.lastName}) для компании: ${hrProfile.company}`);

    const { status, jobId, candidateId } = query;

    // Строим условие поиска
    const where: any = { hrId: hrProfile.id };
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    if (candidateId) where.candidateId = candidateId;

    console.log(`🔍 Условие поиска откликов:`, where);

    // Ищем отклики на вакансии этого HR
    const applications = await this.prisma.application.findMany({
      where,
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
                firstName: true,
                lastName: true,
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

    console.log(`📊 Найдено откликов: ${applications.length} для HR профиля: ${hrProfile.id}`);
    
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

  // Альтернативный метод - поиск откликов через вакансии HR
  async getCompanyResponsesViaJobs(userId: string, query: ApplicationQueryDto) {
    console.log(`🔍 Альтернативный поиск откликов через вакансии для пользователя: ${userId}`);
    
    // Получаем HR профиль
    const hrProfile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      select: { id: true, company: true, firstName: true, lastName: true }
    });

    if (!hrProfile) {
      throw new Error('HR профиль не найден');
    }

    console.log(`✅ HR профиль найден: ${hrProfile.id} (${hrProfile.firstName} ${hrProfile.lastName})`);

    // Получаем все вакансии этого HR
    const hrJobs = await this.prisma.job.findMany({
      where: { hrId: hrProfile.id },
      select: { id: true, title: true, status: true }
    });

    console.log(`📋 Вакансии HR: ${hrJobs.length}`);
    hrJobs.forEach(job => {
      console.log(`  - ${job.title} (${job.id}) - ${job.status}`);
    });

    if (hrJobs.length === 0) {
      console.log('⚠️ У HR нет вакансий');
      return [];
    }

    // Получаем отклики на эти вакансии
    const jobIds = hrJobs.map(job => job.id);
    const { status, candidateId } = query;

    const where: any = { jobId: { in: jobIds } };
    if (status) where.status = status;
    if (candidateId) where.candidateId = candidateId;

    console.log(`🔍 Поиск откликов на вакансии:`, jobIds);
    console.log(`🔍 Условие поиска:`, where);

    const applications = await this.prisma.application.findMany({
      where,
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
                firstName: true,
                lastName: true,
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

    console.log(`📊 Найдено откликов через вакансии: ${applications.length}`);
    
    return applications;
  }

  async getCompanyStats(userId: string) {
    console.log(`📊 Получение статистики для пользователя: ${userId}`);
    
    // Получаем HR профиль пользователя
    const hrProfile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      select: { id: true, company: true, firstName: true, lastName: true }
    });

    if (!hrProfile) {
      console.log(`❌ HR профиль не найден для userId: ${userId} в статистике`);
      throw new Error('HR профиль не найден');
    }

    console.log(`✅ Статистика для HR профиля: ${hrProfile.id} (${hrProfile.firstName} ${hrProfile.lastName}) компании: ${hrProfile.company}`);

    // Получаем все отклики для этого HR
    const applications = await this.prisma.application.findMany({
      where: { hrId: hrProfile.id },
      select: { 
        id: true,
        status: true, 
        appliedAt: true,
        job: {
          select: {
            title: true
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

    console.log(`📈 Найдено откликов для статистики: ${applications.length}`);
    
    if (applications.length > 0) {
      console.log('📋 Детали откликов:');
      applications.forEach(app => {
        console.log(`  - ${app.candidate.firstName} ${app.candidate.lastName} на "${app.job.title}" - ${app.status} (${app.appliedAt})`);
      });
    }

    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'PENDING').length,
      reviewed: applications.filter(app => app.status === 'REVIEWED').length,
      accepted: applications.filter(app => app.status === 'ACCEPTED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
      interviewScheduled: applications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length,
      hired: applications.filter(app => app.status === 'HIRED').length,
      withdrawn: applications.filter(app => app.status === 'WITHDRAWN').length
    };

    console.log('📊 Итоговая статистика:', stats);

    return {
      company: hrProfile.company,
      hrProfile: {
        id: hrProfile.id,
        name: `${hrProfile.firstName} ${hrProfile.lastName}`
      },
      stats
    };
  }

  async debugHrSystem(userId: string) {
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });

    // Получаем HR профиль
    const hrProfile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      select: { id: true, company: true, firstName: true, lastName: true }
    });

    // Получаем все HR профили
    const allHrProfiles = await this.prisma.hRProfile.findMany({
      select: { id: true, userId: true, company: true, firstName: true, lastName: true }
    });

    // Получаем все заявки
    const allApplications = await this.prisma.application.findMany({
      select: { 
        id: true, 
        hrId: true, 
        status: true,
        appliedAt: true,
        job: { select: { title: true } },
        hr: { select: { company: true } },
        candidate: { select: { firstName: true, lastName: true } }
      }
    });

    // Получаем заявки конкретно для этого HR
    const hrApplications = hrProfile ? await this.prisma.application.findMany({
      where: { hrId: hrProfile.id },
      select: { id: true, status: true, appliedAt: true }
    }) : [];

    return {
      user,
      hrProfile,
      allHrProfiles,
      allApplications,
      hrApplications,
      totalApplications: allApplications.length,
      hrApplicationsCount: hrApplications.length
    };
  }
}
