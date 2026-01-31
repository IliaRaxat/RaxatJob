import { Injectable, Logger } from '@nestjs/common';
import { OllamaService } from './ollama.service';

export interface AiAnalysisResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime?: number;
}

export interface ResumeAnalysisResult {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  summary?: string;
}

export interface JobMatchResult {
  match_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  fit_level: 'low' | 'medium' | 'high';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly ollamaService: OllamaService) {}

  /**
   * Проверяет доступность AI сервиса
   */
  async checkHealth(): Promise<boolean> {
    return await this.ollamaService.checkHealth();
  }


  /**
   * Генерирует описание вакансии
   */
  async generateJobDescription(requirements: string): Promise<AiAnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log('Generating job description');
      
      const description = await this.ollamaService.generateJobDescription(requirements);
      const processingTime = Date.now() - startTime;
      
      this.logger.log(`Job description generated in ${processingTime}ms`);
      
      return {
        success: true,
        data: { description },
        processingTime,
      };
    } catch (error) {
      this.logger.error('Job description generation failed', error.message);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Анализирует соответствие кандидата и вакансии
   */
  async analyzeJobMatch(candidateProfile: any, jobRequirements: any): Promise<AiAnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log('Analyzing job match');
      
      const matchAnalysis = await this.ollamaService.analyzeMatch(candidateProfile, jobRequirements);
      const processingTime = Date.now() - startTime;
      
      this.logger.log(`Job match analysis completed in ${processingTime}ms`);
      
      return {
        success: true,
        data: matchAnalysis,
        processingTime,
      };
    } catch (error) {
      this.logger.error('Job match analysis failed', error.message);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Генерирует рекомендации для кандидата
   */
  async generateRecommendations(candidateProfile: any, targetJob: any): Promise<AiAnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log('Generating recommendations');
      
      const prompt = `
На основе профиля кандидата и целевой вакансии, сгенерируй персональные рекомендации:

ПРОФИЛЬ КАНДИДАТА:
${JSON.stringify(candidateProfile, null, 2)}

ЦЕЛЕВАЯ ВАКАНСИЯ:
${JSON.stringify(targetJob, null, 2)}

Верни JSON с полями:
- skill_gaps: навыки, которые нужно развить
- experience_gaps: опыт, который нужно получить
- learning_path: план обучения
- career_advice: карьерные советы
- interview_tips: советы для собеседования
`;

      const response = await this.ollamaService.generateText({
        model: 'llama2',
        prompt,
        options: {
          temperature: 0.3,
          max_tokens: 1500,
        },
      });

      let recommendations;
      try {
        recommendations = JSON.parse(response.response);
      } catch (parseError) {
        recommendations = { raw_response: response.response };
      }

      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: recommendations,
        processingTime,
      };
    } catch (error) {
      this.logger.error('Recommendations generation failed', error.message);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Анализирует навыки и предлагает улучшения
   */
  async analyzeSkills(skills: string[], targetSkills: string[]): Promise<AiAnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log('Analyzing skills');
      
      const prompt = `
Проанализируй навыки кандидата и предложи улучшения:

ТЕКУЩИЕ НАВЫКИ:
${skills.join(', ')}

ЦЕЛЕВЫЕ НАВЫКИ:
${targetSkills.join(', ')}

Верни JSON с полями:
- current_strengths: сильные стороны
- skill_gaps: недостающие навыки
- learning_priorities: приоритеты в обучении
- skill_combinations: комбинации навыков для развития
- resources: рекомендуемые ресурсы для обучения
`;

      const response = await this.ollamaService.generateText({
        model: 'llama2',
        prompt,
        options: {
          temperature: 0.2,
          max_tokens: 1200,
        },
      });

      let analysis;
      try {
        analysis = JSON.parse(response.response);
      } catch (parseError) {
        analysis = { raw_response: response.response };
      }

      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: analysis,
        processingTime,
      };
    } catch (error) {
      this.logger.error('Skills analysis failed', error.message);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Генерирует персональное сопроводительное письмо
   */
  async generateCoverLetter(candidateProfile: any, jobDescription: string): Promise<AiAnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log('Generating cover letter');
      
      const prompt = `
Создай персональное сопроводительное письмо:

ПРОФИЛЬ КАНДИДАТА:
${JSON.stringify(candidateProfile, null, 2)}

ОПИСАНИЕ ВАКАНСИИ:
${jobDescription}

Создай профессиональное сопроводительное письмо, которое:
- Подчеркивает релевантный опыт
- Показывает мотивацию
- Демонстрирует понимание позиции
- Имеет правильную структуру
`;

      const response = await this.ollamaService.generateText({
        model: 'llama2',
        prompt,
        options: {
          temperature: 0.4,
          max_tokens: 1000,
        },
      });

      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: { cover_letter: response.response },
        processingTime,
      };
    } catch (error) {
      this.logger.error('Cover letter generation failed', error.message);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Анализирует резюме и предлагает улучшения
   */
  async analyzeResume(resumeText: string, model: string = 'gemma3:latest'): Promise<AiAnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log('Analyzing resume');
      
      const analysis = await this.ollamaService.analyzeResume(resumeText, model);
      const processingTime = Date.now() - startTime;
      
      this.logger.log(`Resume analysis completed in ${processingTime}ms`);
      
      return {
        success: true,
        data: analysis,
        processingTime,
      };
    } catch (error) {
      this.logger.error('Resume analysis failed', error.message);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }
}
