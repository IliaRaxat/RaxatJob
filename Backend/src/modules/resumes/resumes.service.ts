import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { Resume, ResumeCreateData, ResumeUpdateData, ResumeFilters, ResumePaginationOptions, ResumeListResult } from '../../interfaces/resume.interface';
import { ResumeDataValidator } from '../../validators/resume-data.validator';

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  constructor(private prisma: PrismaService) {}

  async createResume(candidateId: string, createResumeDto: CreateResumeDto): Promise<ResumeResponseDto> {
    this.logger.log(`Creating resume for candidate: ${candidateId}`);
    this.logger.debug(`CreateResumeDto received: ${JSON.stringify(createResumeDto, null, 2)}`);
    
    return await this.prisma.safeExecute(async () => {
      // Проверяем, что пользователь существует и является кандидатом
      this.logger.debug(`Looking up candidate profile for userId: ${candidateId}`);
      const candidate = await this.prisma.candidateProfile.findUnique({
        where: { userId: candidateId },
        include: { user: true }
      });

      if (!candidate) {
        this.logger.error(`Candidate profile not found for userId: ${candidateId}`);
        throw new NotFoundException('Candidate profile not found');
      }

      this.logger.debug(`Found candidate: ${candidate.id}, user role: ${candidate.user.role}`);
      if (candidate.user.role !== 'CANDIDATE') {
        this.logger.error(`User ${candidateId} is not a candidate, role: ${candidate.user.role}`);
        throw new ForbiddenException('Only candidates can create resumes');
      }

      // Если это первое резюме или помечено как основное, делаем его основным
      this.logger.debug(`Checking existing resumes for candidate: ${candidate.id}`);
      const existingResumes = await this.prisma.resume.count({
        where: { candidateId: candidate.id }
      });

      this.logger.debug(`Found ${existingResumes} existing resumes`);
      const isDefault = createResumeDto.isDefault || existingResumes === 0;
      this.logger.debug(`Resume will be default: ${isDefault}`);

      // Валидируем данные перед созданием
      this.logger.debug(`Validating create data before processing`);
      const validationResult = ResumeDataValidator.validateResumeData(createResumeDto);
      
      if (!validationResult.isValid) {
        this.logger.error(`Validation failed: ${validationResult.errors.join(', ')}`);
        throw new BadRequestException({
          message: 'Validation failed',
          errors: validationResult.errors
        });
      }
      
      this.logger.debug(`Data validation passed`);

      // Если делаем это резюме основным, снимаем флаг с других
      if (isDefault) {
        this.logger.debug(`Setting other resumes as non-default for candidate: ${candidate.id}`);
        await this.prisma.resume.updateMany({
          where: { 
            candidateId: candidate.id,
            isDefault: true 
          },
          data: { isDefault: false }
        });
      }

      this.logger.debug(`Preparing resume data for creation`);
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

      this.logger.debug(`Resume data prepared: ${JSON.stringify(resumeData, null, 2)}`);
      this.logger.log(`Creating resume in database`);
      
      const resume = await this.prisma.resume.create({
        data: resumeData
      });

      this.logger.log(`Resume created successfully with ID: ${resume.id}`);
      return this.mapToResponseDto(resume);
    });
  }

  async getResumes(
    candidateId: string,
    filters: ResumeFilters = {},
    pagination: ResumePaginationOptions = {}
  ): Promise<ResumeListResult> {
    return await this.prisma.safeExecute(async () => {
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
    });
  }

  async getResumeById(candidateId: string, resumeId: string): Promise<ResumeResponseDto> {
    return await this.prisma.safeExecute(async () => {
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
    });
  }

  async updateResume(
    candidateId: string,
    resumeId: string,
    updateResumeDto: UpdateResumeDto
  ): Promise<ResumeResponseDto> {
    this.logger.log(`Updating resume ${resumeId} for candidate: ${candidateId}`);
    this.logger.debug(`UpdateResumeDto received: ${JSON.stringify(updateResumeDto, null, 2)}`);
    
    return await this.prisma.safeExecute(async () => {
      this.logger.debug(`Looking up candidate profile for userId: ${candidateId}`);
      const candidate = await this.prisma.candidateProfile.findUnique({
        where: { userId: candidateId }
      });

      if (!candidate) {
        this.logger.error(`Candidate profile not found for userId: ${candidateId}`);
        throw new NotFoundException('Candidate profile not found');
      }

      this.logger.debug(`Found candidate: ${candidate.id}, looking for resume: ${resumeId}`);
      const existingResume = await this.prisma.resume.findFirst({
        where: {
          id: resumeId,
          candidateId: candidate.id
        }
      });

      if (!existingResume) {
        this.logger.error(`Resume ${resumeId} not found for candidate ${candidate.id}`);
        throw new NotFoundException('Resume not found');
      }

      this.logger.debug(`Found existing resume: ${existingResume.id}, title: ${existingResume.title}`);

      // Валидируем данные перед обновлением
      this.logger.debug(`Validating update data before processing`);
      const validationResult = ResumeDataValidator.validateResumeData(updateResumeDto);
      
      if (!validationResult.isValid) {
        this.logger.error(`Validation failed: ${validationResult.errors.join(', ')}`);
        throw new BadRequestException({
          message: 'Validation failed',
          errors: validationResult.errors
        });
      }
      
      this.logger.debug(`Data validation passed`);

      // Если делаем это резюме основным, снимаем флаг с других
      if (updateResumeDto.isDefault) {
        this.logger.debug(`Setting resume ${resumeId} as default, updating other resumes`);
        await this.prisma.resume.updateMany({
          where: { 
            candidateId: candidate.id,
            isDefault: true,
            id: { not: resumeId }
          },
          data: { isDefault: false }
        });
      }

      this.logger.debug(`Preparing update data for resume ${resumeId}`);
      
      // Детальная проверка каждого поля перед обновлением
      this.logger.debug(`Raw updateResumeDto: ${JSON.stringify(updateResumeDto, null, 2)}`);
      
      // Проверяем skills отдельно
      if (updateResumeDto.skills) {
        this.logger.debug(`Skills validation: ${JSON.stringify(updateResumeDto.skills, null, 2)}`);
        updateResumeDto.skills.forEach((skill, index) => {
          this.logger.debug(`Skill ${index}: name=${skill.name}, level=${skill.level}, category=${skill.category}`);
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

      this.logger.debug(`Update data prepared: ${JSON.stringify(updateData, null, 2)}`);
      this.logger.log(`Updating resume ${resumeId} in database`);
      
      const updatedResume = await this.prisma.resume.update({
        where: { id: resumeId },
        data: updateData
      });

      this.logger.log(`Resume ${resumeId} updated successfully`);
      return this.mapToResponseDto(updatedResume);
    });
  }

  async deleteResume(candidateId: string, resumeId: string): Promise<void> {
    return await this.prisma.safeExecute(async () => {
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
    });
  }

  async setDefaultResume(candidateId: string, resumeId: string): Promise<ResumeResponseDto> {
    return await this.prisma.safeExecute(async () => {
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
    });
  }

  async getDefaultResume(candidateId: string): Promise<ResumeResponseDto | null> {
    return await this.prisma.safeExecute(async () => {
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
    });
  }

  async duplicateResume(candidateId: string, resumeId: string, newTitle: string): Promise<ResumeResponseDto> {
    return await this.prisma.safeExecute(async () => {
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
    });
  }

  async getPublicResumes(
    filters: ResumeFilters = {},
    pagination: ResumePaginationOptions = {}
  ): Promise<ResumeListResult> {
    return await this.prisma.safeExecute(async () => {
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
    });
  }

  async getResumeStats(candidateId: string): Promise<any> {
    return await this.prisma.safeExecute(async () => {
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
    });
  }

  async bulkUpdateResumes(
    candidateId: string,
    resumeIds: string[],
    updates: ResumeUpdateData
  ): Promise<{ updated: number; resumes: ResumeResponseDto[] }> {
    return await this.prisma.safeExecute(async () => {
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
    });
  }

  async exportResume(
    candidateId: string,
    resumeId: string,
    format: 'json' | 'pdf' | 'docx' = 'json'
  ): Promise<any> {
    return await this.prisma.safeExecute(async () => {
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
    });
  }

  async importResume(
    candidateId: string,
    resumeData: any,
    title: string
  ): Promise<ResumeResponseDto> {
    return await this.prisma.safeExecute(async () => {
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
    });
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
    return await this.prisma.safeExecute(async () => {
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
    });
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
