import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ValidationLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ValidationLoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Логируем только запросы к резюме
    if (req.url.includes('/resumes') && (req.method === 'POST' || req.method === 'PUT')) {
      this.logger.log(`Processing ${req.method} request to ${req.url}`);
      this.logger.debug(`Request body: ${JSON.stringify(req.body, null, 2)}`);
      this.logger.debug(`Request headers: ${JSON.stringify(req.headers, null, 2)}`);
      
      // Проверяем Content-Type
      const contentType = req.headers['content-type'];
      this.logger.debug(`Content-Type: ${contentType}`);
      
      if (!contentType || !contentType.includes('application/json')) {
        this.logger.warn(`Unexpected Content-Type: ${contentType}. Expected application/json`);
      }
      
      // Проверяем наличие обязательных полей
      if (req.method === 'POST') {
        this.validateCreateResumeData(req.body);
      } else if (req.method === 'PUT') {
        this.validateUpdateResumeData(req.body);
      }
    }
    
    next();
  }

  private validateCreateResumeData(body: any) {
    this.logger.debug('Validating create resume data');
    
    const requiredFields = ['title'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      this.logger.error(`Missing required fields for resume creation: ${missingFields.join(', ')}`);
    }
    
    // Проверяем типы данных
    if (body.title && typeof body.title !== 'string') {
      this.logger.error(`Invalid type for title: expected string, got ${typeof body.title}`);
    }
    
    if (body.skills && !Array.isArray(body.skills)) {
      this.logger.error(`Invalid type for skills: expected array, got ${typeof body.skills}`);
    }
    
    if (body.experiences && !Array.isArray(body.experiences)) {
      this.logger.error(`Invalid type for experiences: expected array, got ${typeof body.experiences}`);
    }
    
    if (body.educations && !Array.isArray(body.educations)) {
      this.logger.error(`Invalid type for educations: expected array, got ${typeof body.educations}`);
    }
    
    // Проверяем структуру skills
    if (body.skills && Array.isArray(body.skills)) {
      body.skills.forEach((skill: any, index: number) => {
        if (!skill.name) {
          this.logger.error(`Skill at index ${index} is missing name field`);
        }
        if (skill.level && (typeof skill.level !== 'number' || skill.level < 1 || skill.level > 5)) {
          this.logger.error(`Invalid skill level at index ${index}: ${skill.level}. Expected number between 1-5`);
        }
      });
    }
    
    // Проверяем структуру experiences
    if (body.experiences && Array.isArray(body.experiences)) {
      body.experiences.forEach((exp: any, index: number) => {
        if (!exp.company) {
          this.logger.error(`Experience at index ${index} is missing company field`);
        }
        if (!exp.position) {
          this.logger.error(`Experience at index ${index} is missing position field`);
        }
        if (!exp.startDate) {
          this.logger.error(`Experience at index ${index} is missing startDate field`);
        }
        if (exp.isCurrent && typeof exp.isCurrent !== 'boolean') {
          this.logger.error(`Invalid isCurrent type at experience index ${index}: expected boolean, got ${typeof exp.isCurrent}`);
        }
      });
    }
    
    // Проверяем структуру educations
    if (body.educations && Array.isArray(body.educations)) {
      body.educations.forEach((edu: any, index: number) => {
        if (!edu.institution) {
          this.logger.error(`Education at index ${index} is missing institution field`);
        }
        if (!edu.degree) {
          this.logger.error(`Education at index ${index} is missing degree field`);
        }
        if (!edu.startDate) {
          this.logger.error(`Education at index ${index} is missing startDate field`);
        }
        if (edu.isCurrent && typeof edu.isCurrent !== 'boolean') {
          this.logger.error(`Invalid isCurrent type at education index ${index}: expected boolean, got ${typeof edu.isCurrent}`);
        }
      });
    }
  }

  private validateUpdateResumeData(body: any) {
    this.logger.debug('Validating update resume data');
    
    // Для обновления все поля опциональны, но если они есть, проверяем их типы
    if (body.title && typeof body.title !== 'string') {
      this.logger.error(`Invalid type for title: expected string, got ${typeof body.title}`);
    }
    
    if (body.skills && !Array.isArray(body.skills)) {
      this.logger.error(`Invalid type for skills: expected array, got ${typeof body.skills}`);
    }
    
    if (body.experiences && !Array.isArray(body.experiences)) {
      this.logger.error(`Invalid type for experiences: expected array, got ${typeof body.experiences}`);
    }
    
    if (body.educations && !Array.isArray(body.educations)) {
      this.logger.error(`Invalid type for educations: expected array, got ${typeof body.educations}`);
    }
    
    if (body.isDefault !== undefined && typeof body.isDefault !== 'boolean') {
      this.logger.error(`Invalid type for isDefault: expected boolean, got ${typeof body.isDefault}`);
    }
    
    if (body.isPublic !== undefined && typeof body.isPublic !== 'boolean') {
      this.logger.error(`Invalid type for isPublic: expected boolean, got ${typeof body.isPublic}`);
    }
  }
}
