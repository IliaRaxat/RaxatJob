import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('OLLAMA_BASE_URL', 'http://109.73.193.10:11434');
  }

  /**
   * Проверяет доступность Ollama сервера
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      this.logger.log('Ollama server is healthy');
      return true;
    } catch (error) {
      this.logger.error('Ollama server is not available', error.message);
      return false;
    }
  }

  /**
   * Получает список доступных моделей
   */
  async getModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return (response.data as any).models?.map((model: any) => model.name) || [];
    } catch (error) {
      this.logger.error('Failed to get models', error.message);
      return [];
    }
  }

  /**
   * Отправляет запрос к Ollama для генерации текста
   */
  async generateText(request: OllamaRequest): Promise<OllamaResponse> {
    try {
      this.logger.log(`Generating text with model: ${request.model}`);
      
      const response = await axios.post<OllamaResponse>(
        `${this.baseUrl}/api/generate`,
        {
          model: request.model,
          prompt: request.prompt,
          stream: request.stream || false,
          options: request.options || {},
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 секунд таймаут
        }
      );

      this.logger.log('Text generation completed');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to generate text', error.message);
      throw new Error(`Ollama generation failed: ${error.message}`);
    }
  }

  /**
   * Создает чат с контекстом
   */
  async chat(messages: Array<{ role: string; content: string }>, model: string = 'gemma3:latest'): Promise<string> {
    try {
      this.logger.log(`Starting chat with model: ${model}`);
      
      // Преобразуем сообщения в промпт для /api/generate
      const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model,
          prompt,
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return (response.data as OllamaResponse).response || '';
    } catch (error) {
      this.logger.error('Chat failed', error.message);
      throw new Error(`Ollama chat failed: ${error.message}`);
    }
  }


  /**
   * Генерирует описание вакансии на основе требований
   */
  async generateJobDescription(requirements: string, model: string = 'gemma3:latest'): Promise<string> {
    const prompt = `
Создай профессиональное описание вакансии на основе следующих требований:

${requirements}

Включи:
- Название позиции
- Описание компании
- Обязанности
- Требования
- Условия работы
- Зарплата (если указана)
`;

    const response = await this.generateText({
      model,
      prompt,
      options: {
        temperature: 0.3,
        max_tokens: 1500,
      },
    });

    return response.response;
  }

  /**
   * Анализирует соответствие кандидата и вакансии
   */
  async analyzeMatch(candidateProfile: any, jobRequirements: any, model: string = 'gemma3:latest'): Promise<any> {
    const prompt = `
Проанализируй соответствие кандидата и вакансии:

КАНДИДАТ:
${JSON.stringify(candidateProfile, null, 2)}

ВАКАНСИЯ:
${JSON.stringify(jobRequirements, null, 2)}

Верни JSON с полями:
- match_score: оценка соответствия от 0 до 100
- strengths: сильные стороны кандидата
- weaknesses: слабые стороны
- recommendations: рекомендации для улучшения
- fit_level: уровень соответствия (low/medium/high)
`;

    const response = await this.generateText({
      model,
      prompt,
      options: {
        temperature: 0.2,
        max_tokens: 1000,
      },
    });

    try {
      return JSON.parse(response.response);
    } catch (error) {
      this.logger.error('Failed to parse match analysis', error.message);
      return { error: 'Failed to parse match analysis' };
    }
  }

  /**
   * Анализирует резюме и предлагает улучшения
   */
  async analyzeResume(resumeText: string, model: string = 'gemma3:latest'): Promise<any> {
    const prompt = `Анализ резюме:

${resumeText}

Верни ТОЛЬКО JSON без markdown блоков:
{"overall_score": 7, "strengths": ["сильные стороны"], "weaknesses": ["слабые стороны"], "improvements": ["улучшения"], "keywords_to_add": ["ключевые слова"], "unnecessary": ["лишнее/ненужное"]}`;

    const response = await this.generateText({
      model,
      prompt,
      options: {
        temperature: 0.2,
        max_tokens: 800,
      },
    });

    try {
      // Убираем markdown блоки кода если есть
      let jsonText = response.response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      return JSON.parse(jsonText);
    } catch (error) {
      this.logger.error('Failed to parse resume analysis', error.message);
      this.logger.error('Raw response:', response.response);
      return { 
        error: 'Failed to parse resume analysis',
        raw_response: response.response 
      };
    }
  }


}
