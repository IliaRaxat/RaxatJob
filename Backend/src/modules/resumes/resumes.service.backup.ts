import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { Resume, ResumeCreateData, ResumeUpdateData, ResumeFilters, ResumePaginationOptions, ResumeListResult } from '../../interfaces/resume.interface';

@Injectable()
export class ResumesService {
  constructor(private prisma: PrismaService) {}

  async createResume(candidateId: string, createResumeDto: CreateResumeDto): Promise<ResumeResponseDto> {
    // Проверяем, что пользователь существует и является кандидатом
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
      include: { user: true }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    if (candidate.user.role !== 'CANDIDATE') {
      throw new ForbiddenException('Only candidates can create resumes');
    }

    // Если это первое резюме или помечено как основное, делаем его основным
    const existingResumes = await this.prisma.resume.count({
      where: { candidateId: candidate.id }
    });

    const isDefault = createResumeDto.isDefault || existingResumes === 0;

    // Если делаем это резюме основным, снимаем флаг с других
    if (isDefault) {
      await this.prisma.resume.updateMany({
        where: { 
          candidateId: candidate.id,
          isDefault: true 
        },
        data: { isDefault: false }
      });
    }

    const resumeData = {
      candidateId: candidate.id,
      title: createResumeDto.title,
      summary: createResumeDto.summary,
      objective: createResumeDto.objective,
      skills: createResumeDto.skills as any,
      experiences: createResumeDto.experiences as any,
      educations: createResumeDto.educations as any,
      projects: createResumeDto.projects as any,
      achievements: createResumeDto.achievements as any,
      languages: createResumeDto.languages as any,
      certifications: createResumeDto.certifications as any,
      isDefault,
      isPublic: createResumeDto.isPublic ?? true
    };

    const resume = await this.prisma.resume.create({
      data: resumeData
    });

    return this.mapToResponseDto(resume);
  }

  async getResumes(
    candidateId: string,
    filters: ResumeFilters = {},
    pagination: ResumePaginationOptions = {}
  ): Promise<ResumeListResult> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    // Проверяем, что пользователь существует
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const where: any = {
      candidateId: candidate.id,
      ...filters
    };

    // Добавляем поиск по названию и описанию
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [resumes, total] = await Promise.all([
      this.prisma.resume.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      this.prisma.resume.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      resumes: resumes.map(resume => this.mapToResponseDto(resume)),
      total,
      page,
      limit,
      totalPages
    };
  }

  async getResumeById(candidateId: string, resumeId: string): Promise<ResumeResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const resume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidateId: candidate.id
      }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return this.mapToResponseDto(resume);
  }

  async updateResume(
    candidateId: string,
    resumeId: string,
    updateResumeDto: UpdateResumeDto
  ): Promise<ResumeResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const existingResume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidateId: candidate.id
      }
    });

    if (!existingResume) {
      throw new NotFoundException('Resume not found');
    }

    // Если делаем это резюме основным, снимаем флаг с других
    if (updateResumeDto.isDefault) {
      await this.prisma.resume.updateMany({
        where: { 
          candidateId: candidate.id,
          isDefault: true,
          id: { not: resumeId }
        },
        data: { isDefault: false }
      });
    }

    const updateData = {
      ...updateResumeDto,
      skills: updateResumeDto.skills as any,
      experiences: updateResumeDto.experiences as any,
      educations: updateResumeDto.educations as any,
      projects: updateResumeDto.projects as any,
      achievements: updateResumeDto.achievements as any,
      languages: updateResumeDto.languages as any,
      certifications: updateResumeDto.certifications as any
    };

    const updatedResume = await this.prisma.resume.update({
      where: { id: resumeId },
      data: updateData
    });

    return this.mapToResponseDto(updatedResume);
  }

  async deleteResume(candidateId: string, resumeId: string): Promise<void> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const resume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidateId: candidate.id
      }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Проверяем, не является ли это единственным резюме
    const resumeCount = await this.prisma.resume.count({
      where: { candidateId: candidate.id }
    });

    if (resumeCount <= 1) {
      throw new BadRequestException('Cannot delete the last resume');
    }

    await this.prisma.resume.delete({
      where: { id: resumeId }
    });
  }

  async setDefaultResume(candidateId: string, resumeId: string): Promise<ResumeResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const resume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidateId: candidate.id
      }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Снимаем флаг с других резюме
    await this.prisma.resume.updateMany({
      where: { 
        candidateId: candidate.id,
        isDefault: true 
      },
      data: { isDefault: false }
    });

    // Устанавливаем новое основное резюме
    const updatedResume = await this.prisma.resume.update({
      where: { id: resumeId },
      data: { isDefault: true }
    });

    return this.mapToResponseDto(updatedResume);
  }

  async getDefaultResume(candidateId: string): Promise<ResumeResponseDto | null> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const resume = await this.prisma.resume.findFirst({
      where: {
        candidateId: candidate.id,
        isDefault: true
      }
    });

    return resume ? this.mapToResponseDto(resume) : null;
  }

  async duplicateResume(candidateId: string, resumeId: string, newTitle: string): Promise<ResumeResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const originalResume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidateId: candidate.id
      }
    });

    if (!originalResume) {
      throw new NotFoundException('Resume not found');
    }

    const duplicateData = {
      candidateId: candidate.id,
      title: newTitle,
      summary: originalResume.summary,
      objective: originalResume.objective,
      skills: originalResume.skills as any,
      experiences: originalResume.experiences as any,
      educations: originalResume.educations as any,
      projects: originalResume.projects as any,
      achievements: originalResume.achievements as any,
      languages: originalResume.languages as any,
      certifications: originalResume.certifications as any,
      isDefault: false,
      isPublic: originalResume.isPublic
    };

    const duplicatedResume = await this.prisma.resume.create({
      data: duplicateData
    });

    return this.mapToResponseDto(duplicatedResume);
  }

  async getPublicResumes(
    filters: ResumeFilters = {},
    pagination: ResumePaginationOptions = {}
  ): Promise<ResumeListResult> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
      ...filters
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [resumes, total] = await Promise.all([
      this.prisma.resume.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      this.prisma.resume.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      resumes: resumes.map(resume => this.mapToResponseDto(resume)),
      total,
      page,
      limit,
      totalPages
    };
  }

  async getResumeStats(candidateId: string): Promise<any> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const [
      totalResumes,
      publicResumes,
      defaultResume,
      recentResumes
    ] = await Promise.all([
      this.prisma.resume.count({
        where: { candidateId: candidate.id }
      }),
      this.prisma.resume.count({
        where: { 
          candidateId: candidate.id,
          isPublic: true 
        }
      }),
      this.prisma.resume.findFirst({
        where: { 
          candidateId: candidate.id,
          isDefault: true 
        }
      }),
      this.prisma.resume.findMany({
        where: { candidateId: candidate.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return {
      totalResumes,
      publicResumes,
      privateResumes: totalResumes - publicResumes,
      hasDefault: !!defaultResume,
      defaultResumeTitle: defaultResume?.title,
      recentResumes: recentResumes.map(r => ({
        id: r.id,
        title: r.title,
        createdAt: r.createdAt,
        isDefault: r.isDefault
      }))
    };
  }

  async bulkUpdateResumes(
    candidateId: string,
    resumeIds: string[],
    updates: ResumeUpdateData
  ): Promise<{ updated: number; resumes: ResumeResponseDto[] }> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const updatedResumes: ResumeResponseDto[] = [];

    for (const resumeId of resumeIds) {
      const resume = await this.prisma.resume.findFirst({
        where: {
          id: resumeId,
          candidateId: candidate.id
        }
      });

      if (resume) {
        const updateData = {
          ...updates,
          skills: updates.skills as any,
          experiences: updates.experiences as any,
          educations: updates.educations as any,
          projects: updates.projects as any,
          achievements: updates.achievements as any,
          languages: updates.languages as any,
          certifications: updates.certifications as any
        };
        
        const updatedResume = await this.prisma.resume.update({
          where: { id: resumeId },
          data: updateData
        });
        updatedResumes.push(this.mapToResponseDto(updatedResume));
      }
    }

    return {
      updated: updatedResumes.length,
      resumes: updatedResumes
    };
  }

  async exportResume(
    candidateId: string,
    resumeId: string,
    format: 'json' | 'pdf' | 'docx' = 'json'
  ): Promise<any> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const resume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidateId: candidate.id
      }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    switch (format) {
      case 'json':
        return {
          format: 'json',
          data: this.mapToResponseDto(resume),
          exportedAt: new Date().toISOString()
        };
      
      case 'pdf':
        // Здесь можно интегрировать с библиотекой для генерации PDF
        return {
          format: 'pdf',
          message: 'PDF export not implemented yet',
          data: this.mapToResponseDto(resume)
        };
      
      case 'docx':
        // Здесь можно интегрировать с библиотекой для генерации DOCX
        return {
          format: 'docx',
          message: 'DOCX export not implemented yet',
          data: this.mapToResponseDto(resume)
        };
      
      default:
        throw new BadRequestException('Unsupported export format');
    }
  }

  async importResume(
    candidateId: string,
    resumeData: any,
    title: string
  ): Promise<ResumeResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const resumeDataToCreate = {
      candidateId: candidate.id,
      title,
      summary: resumeData.summary,
      objective: resumeData.objective,
      skills: resumeData.skills as any,
      experiences: resumeData.experiences as any,
      educations: resumeData.educations as any,
      projects: resumeData.projects as any,
      achievements: resumeData.achievements as any,
      languages: resumeData.languages as any,
      certifications: resumeData.certifications as any,
      isDefault: false,
      isPublic: resumeData.isPublic ?? true
    };

    const resume = await this.prisma.resume.create({
      data: resumeDataToCreate
    });

    return this.mapToResponseDto(resume);
  }

  async getResumeTemplates(): Promise<any> {
    // Предустановленные шаблоны резюме
    return {
      templates: [
        {
          id: 'frontend-developer',
          name: 'Frontend Developer',
          description: 'Шаблон для frontend разработчиков',
          skills: [
            { name: 'JavaScript', level: 5, category: 'Programming' },
            { name: 'React', level: 4, category: 'Framework' },
            { name: 'TypeScript', level: 4, category: 'Programming' }
          ],
          experiences: [
            {
              company: 'Your Company',
              position: 'Frontend Developer',
              startDate: '2020-01-01',
              endDate: '2023-12-31',
              isCurrent: false,
              description: 'Разработка веб-приложений',
              technologies: ['React', 'TypeScript', 'Node.js']
            }
          ]
        },
        {
          id: 'data-scientist',
          name: 'Data Scientist',
          description: 'Шаблон для data scientists',
          skills: [
            { name: 'Python', level: 5, category: 'Programming' },
            { name: 'Machine Learning', level: 4, category: 'AI/ML' },
            { name: 'SQL', level: 4, category: 'Database' }
          ],
          experiences: [
            {
              company: 'Your Company',
              position: 'Data Scientist',
              startDate: '2020-01-01',
              endDate: '2023-12-31',
              isCurrent: false,
              description: 'Анализ данных и машинное обучение',
              technologies: ['Python', 'TensorFlow', 'Pandas']
            }
          ]
        },
        {
          id: 'backend-developer',
          name: 'Backend Developer',
          description: 'Шаблон для backend разработчиков',
          skills: [
            { name: 'Node.js', level: 5, category: 'Backend' },
            { name: 'Python', level: 4, category: 'Programming' },
            { name: 'PostgreSQL', level: 4, category: 'Database' }
          ],
          experiences: [
            {
              company: 'Your Company',
              position: 'Backend Developer',
              startDate: '2020-01-01',
              endDate: '2023-12-31',
              isCurrent: false,
              description: 'Разработка серверных приложений',
              technologies: ['Node.js', 'Express', 'MongoDB']
            }
          ]
        }
      ]
    };
  }

  async createResumeFromTemplate(
    candidateId: string,
    templateId: string,
    title: string
  ): Promise<ResumeResponseDto> {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const templates = await this.getResumeTemplates();
    const template = templates.templates.find(t => t.id === templateId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const resumeData = {
      candidateId: candidate.id,
      title,
      summary: `Резюме создано на основе шаблона "${template.name}"`,
      skills: template.skills as any,
      experiences: template.experiences as any,
      isDefault: false,
      isPublic: true
    };

    const resume = await this.prisma.resume.create({
      data: resumeData
    });

    return this.mapToResponseDto(resume);
  }

  private mapToResponseDto(resume: any): ResumeResponseDto {
    return {
      id: resume.id,
      candidateId: resume.candidateId,
      title: resume.title,
      summary: resume.summary,
      objective: resume.objective,
      skills: resume.skills,
      experiences: resume.experiences,
      educations: resume.educations,
      projects: resume.projects,
      achievements: resume.achievements,
      languages: resume.languages,
      certifications: resume.certifications,
      isDefault: resume.isDefault,
      isPublic: resume.isPublic,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    };
  }
}
