import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  BadRequestException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

interface ValidationError {
  field: string;
  message: string;
  value: any;
}

@Injectable()
export class ResumeValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResumeValidationInterceptor.name);

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    this.logger.debug(`Validating request body: ${JSON.stringify(body, null, 2)}`);

    // Проверяем, есть ли данные для валидации
    if (!body || Object.keys(body).length === 0) {
      this.logger.warn('Empty request body received');
      throw new BadRequestException('Request body is empty');
    }

    // Логируем каждый ключ в body для отладки
    this.logger.debug(`Request body keys: ${Object.keys(body).join(', ')}`);

    // Проверяем валидацию полей
    const validationErrors: ValidationError[] = [];

    // Проверяем обязательные поля для создания резюме
    if (request.method === 'POST' && request.url.includes('/resumes')) {
      if (!body.title) {
        validationErrors.push({
          field: 'title',
          message: 'Title is required',
          value: body.title
        });
      }

      // Проверяем структуру skills если они есть
      if (body.skills && Array.isArray(body.skills)) {
        body.skills.forEach((skill, index) => {
          if (!skill.name) {
            validationErrors.push({
              field: `skills[${index}].name`,
              message: 'Skill name is required',
              value: skill.name
            });
          }
          if (skill.level && (skill.level < 1 || skill.level > 5)) {
            validationErrors.push({
              field: `skills[${index}].level`,
              message: 'Skill level must be between 1 and 5',
              value: skill.level
            });
          }
        });
      }

      // Проверяем структуру experiences если они есть
      if (body.experiences && Array.isArray(body.experiences)) {
        body.experiences.forEach((exp, index) => {
          if (!exp.company) {
            validationErrors.push({
              field: `experiences[${index}].company`,
              message: 'Company is required',
              value: exp.company
            });
          }
          if (!exp.position) {
            validationErrors.push({
              field: `experiences[${index}].position`,
              message: 'Position is required',
              value: exp.position
            });
          }
          if (!exp.startDate) {
            validationErrors.push({
              field: `experiences[${index}].startDate`,
              message: 'Start date is required',
              value: exp.startDate
            });
          }
        });
      }

      // Проверяем структуру educations если они есть
      if (body.educations && Array.isArray(body.educations)) {
        body.educations.forEach((edu, index) => {
          if (!edu.institution) {
            validationErrors.push({
              field: `educations[${index}].institution`,
              message: 'Institution is required',
              value: edu.institution
            });
          }
          if (!edu.degree) {
            validationErrors.push({
              field: `educations[${index}].degree`,
              message: 'Degree is required',
              value: edu.degree
            });
          }
          if (!edu.startDate) {
            validationErrors.push({
              field: `educations[${index}].startDate`,
              message: 'Start date is required',
              value: edu.startDate
            });
          }
        });
      }
    }

    // Логируем ошибки валидации
    if (validationErrors.length > 0) {
      this.logger.error(`Validation errors found: ${JSON.stringify(validationErrors, null, 2)}`);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    this.logger.debug('Request body validation passed');
    return next.handle();
  }
}
