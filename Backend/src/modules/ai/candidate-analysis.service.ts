import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from './ollama.service';

export interface CandidateAnalysisResult {
  candidateId: string;
  applicationId: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  matchScore: number;
  fitLevel: 'low' | 'medium' | 'high';
  aiNotes: string;
}

export interface JobAnalysisResult {
  jobId: string;
  totalApplications: number;
  topCandidates: CandidateAnalysisResult[];
  analysisSummary: string;
  processingTime: number;
}

@Injectable()
export class CandidateAnalysisService {
  private readonly logger = new Logger(CandidateAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ollamaService: OllamaService,
  ) {}

  /**
   * Получает HR профиль по userId
   */
  async getHrProfile(userId: string): Promise<any> {
    console.log(`🔍 Поиск HR профиля для пользователя: ${userId}`);
    
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
      
      return null;
    }

    console.log(`✅ Найден HR профиль: ${hrProfile.id} (${hrProfile.firstName} ${hrProfile.lastName}) для компании: ${hrProfile.company}`);
    return hrProfile;
  }

  /**
   * Анализирует всех кандидатов на конкретную вакансию
   */
  async analyzeJobCandidates(jobId: string, hrId: string): Promise<JobAnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting analysis for job ${jobId} by HR ${hrId}`);

      // Получаем вакансию с требованиями
      const job = await this.prisma.job.findFirst({
        where: { 
          id: jobId,
          hrId: hrId 
        },
        include: {
          skills: {
            include: {
              skill: true
            }
          }
        }
      });

      if (!job) {
        throw new Error('Job not found or access denied');
      }

      // Получаем все отклики на вакансию
      const applications = await this.prisma.application.findMany({
        where: { 
          jobId: jobId,
          hrId: hrId 
        },
        include: {
          candidate: {
            include: {
              skills: {
                include: {
                  skill: true
                }
              },
              experiences: true,
              educations: true,
              resumes: {
                where: { isDefault: true },
                take: 1
              }
            }
          },
          resume: true
        }
      });

      this.logger.log(`Found ${applications.length} applications for analysis`);

      // Анализируем каждого кандидата
      const candidateAnalyses: CandidateAnalysisResult[] = [];
      
      for (const application of applications) {
        try {
          const analysis = await this.analyzeSingleCandidate(application, job);
          candidateAnalyses.push(analysis);
        } catch (error) {
          this.logger.error(`Failed to analyze candidate ${application.candidateId}:`, error.message);
          // Продолжаем анализ других кандидатов
        }
      }

      // Сортируем кандидатов по общему баллу
      candidateAnalyses.sort((a, b) => b.overallScore - a.overallScore);

      // Генерируем общее резюме анализа
      const analysisSummary = await this.generateAnalysisSummary(candidateAnalyses, job);

      const processingTime = Date.now() - startTime;

      return {
        jobId,
        totalApplications: applications.length,
        topCandidates: candidateAnalyses.slice(0, 10), // Топ 10 кандидатов
        analysisSummary,
        processingTime
      };

    } catch (error) {
      this.logger.error('Job candidates analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Анализирует одного кандидата
   */
  private async analyzeSingleCandidate(application: any, job: any): Promise<CandidateAnalysisResult> {
    // Подготавливаем оптимизированные данные для AI
    const candidateData = this.prepareCandidateData(application);
    const jobData = this.prepareJobData(job);

    // Создаем промпт для анализа
    const prompt = this.createAnalysisPrompt(candidateData, jobData);

    try {
      const response = await this.ollamaService.generateText({
        model: 'gemma3:latest',
        prompt,
        options: {
          temperature: 0.2,
          max_tokens: 1500,
        },
      });

      // Парсим ответ AI
      const analysis = this.parseAnalysisResponse(response.response);

      return {
        candidateId: application.candidateId,
        applicationId: application.id,
        overallScore: analysis.overallScore || 0,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
        matchScore: analysis.matchScore || 0,
        fitLevel: analysis.fitLevel || 'low',
        aiNotes: analysis.aiNotes || 'Анализ не удался'
      };

    } catch (error) {
      this.logger.error(`AI analysis failed for candidate ${application.candidateId}:`, error.message);
      
      // Возвращаем базовый анализ в случае ошибки
      return {
        candidateId: application.candidateId,
        applicationId: application.id,
        overallScore: 5,
        strengths: ['Опыт работы'],
        weaknesses: ['Требуется дополнительная информация'],
        recommendations: ['Провести собеседование'],
        matchScore: 50,
        fitLevel: 'medium',
        aiNotes: 'Анализ не удался - требуется ручная оценка'
      };
    }
  }

  /**
   * Подготавливает оптимизированные данные кандидата для AI
   */
  private prepareCandidateData(application: any): any {
    const candidate = application.candidate;
    const resume = application.resume || candidate.resumes?.[0];

    return {
      // Основная информация
      name: `${candidate.firstName} ${candidate.lastName}`,
      location: candidate.location,
      bio: candidate.bio,
      
      // Навыки (только названия и уровни)
      skills: candidate.skills?.map(cs => ({
        name: cs.skill.name,
        level: cs.level
      })) || [],
      
      // Опыт работы (только ключевая информация)
      experience: candidate.experiences?.map(exp => ({
        company: exp.company,
        position: exp.position,
        duration: this.calculateDuration(exp.startDate, exp.endDate),
        description: exp.description?.substring(0, 200) // Ограничиваем длину
      })) || [],
      
      // Образование
      education: candidate.educations?.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        year: edu.endDate ? new Date(edu.endDate).getFullYear() : 'В процессе'
      })) || [],
      
      // Резюме (только краткое описание)
      resumeSummary: resume?.summary?.substring(0, 300) || 'Резюме не найдено',
      
      // Сопроводительное письмо
      coverLetter: application.coverLetter?.substring(0, 500) || 'Сопроводительное письмо отсутствует'
    };
  }

  /**
   * Подготавливает данные вакансии для AI
   */
  private prepareJobData(job: any): any {
    return {
      title: job.title,
      description: job.description?.substring(0, 500), // Ограничиваем длину
      requirements: job.requirements?.substring(0, 500),
      responsibilities: job.responsibilities?.substring(0, 500),
      location: job.location,
      type: job.type,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      requiredSkills: job.skills?.map(js => ({
        name: js.skill.name,
        required: js.required,
        level: js.level
      })) || []
    };
  }

  /**
   * Создает промпт для анализа кандидата
   */
  private createAnalysisPrompt(candidateData: any, jobData: any): string {
    return `
Проанализируй кандидата для вакансии и верни ТОЛЬКО JSON без markdown блоков:

КАНДИДАТ:
${JSON.stringify(candidateData, null, 2)}

ВАКАНСИЯ:
${JSON.stringify(jobData, null, 2)}

Верни JSON с полями:
{
  "overallScore": число от 1 до 10 (общая оценка кандидата),
  "matchScore": число от 0 до 100 (соответствие вакансии),
  "fitLevel": "low" | "medium" | "high" (уровень соответствия),
  "strengths": ["сильные стороны кандидата"],
  "weaknesses": ["слабые стороны"],
  "recommendations": ["рекомендации для HR"],
  "aiNotes": "краткий комментарий AI о кандидате"
}

Критерии оценки:
- Соответствие навыков требованиям вакансии
- Релевантный опыт работы
- Образование и квалификация
- Качество сопроводительного письма
- Общее впечатление от кандидата
`;
  }

  /**
   * Парсит ответ AI
   */
  private parseAnalysisResponse(response: string): any {
    try {
      // Убираем markdown блоки если есть
      let jsonText = response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      return JSON.parse(jsonText);
    } catch (error) {
      this.logger.error('Failed to parse AI response:', error.message);
      this.logger.error('Raw response:', response);
      
      // Возвращаем базовые значения в случае ошибки парсинга
      return {
        overallScore: 5,
        matchScore: 50,
        fitLevel: 'medium',
        strengths: ['Требуется ручная оценка'],
        weaknesses: ['Ошибка анализа'],
        recommendations: ['Провести собеседование'],
        aiNotes: 'Ошибка анализа AI'
      };
    }
  }

  /**
   * Генерирует общее резюме анализа
   */
  private async generateAnalysisSummary(analyses: CandidateAnalysisResult[], job: any): Promise<string> {
    try {
      const topCandidates = analyses.slice(0, 3);
      const summaryData = {
        totalCandidates: analyses.length,
        topCandidates: topCandidates.map(c => ({
          name: c.candidateId,
          score: c.overallScore,
          fitLevel: c.fitLevel
        })),
        jobTitle: job.title
      };

      const prompt = `
Создай краткое резюме анализа кандидатов для HR:

ДАННЫЕ:
${JSON.stringify(summaryData, null, 2)}

Верни краткое резюме (2-3 предложения) с основными выводами и рекомендациями.
`;

      const response = await this.ollamaService.generateText({
        model: 'gemma3:latest',
        prompt,
        options: {
          temperature: 0.3,
          max_tokens: 300,
        },
      });

      return response.response;
    } catch (error) {
      this.logger.error('Failed to generate analysis summary:', error.message);
      return `Проанализировано ${analyses.length} кандидатов. Рекомендуется провести собеседования с топ-кандидатами.`;
    }
  }

  /**
   * Вычисляет продолжительность работы
   */
  private calculateDuration(startDate: Date, endDate?: Date): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} г. ${months} мес.`;
    } else {
      return `${months} мес.`;
    }
  }
}
