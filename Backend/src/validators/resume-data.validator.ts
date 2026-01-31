import { Logger } from '@nestjs/common';

export class ResumeDataValidator {
  private static readonly logger = new Logger(ResumeDataValidator.name);

  static validateResumeData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    this.logger.debug(`Validating resume data: ${JSON.stringify(data, null, 2)}`);

    // Проверяем title
    if (data.title && typeof data.title !== 'string') {
      errors.push('Title must be a string');
    }

    // Проверяем summary
    if (data.summary && typeof data.summary !== 'string') {
      errors.push('Summary must be a string');
    }

    // Проверяем objective
    if (data.objective && typeof data.objective !== 'string') {
      errors.push('Objective must be a string');
    }

    // Проверяем skills
    if (data.skills) {
      if (!Array.isArray(data.skills)) {
        errors.push('Skills must be an array');
      } else {
        data.skills.forEach((skill: any, index: number) => {
          if (!skill.name || typeof skill.name !== 'string') {
            errors.push(`Skill ${index + 1}: name is required and must be a string`);
          }
          if (skill.level !== undefined && (typeof skill.level !== 'number' || skill.level < 1 || skill.level > 5)) {
            errors.push(`Skill ${index + 1}: level must be a number between 1 and 5`);
          }
          if (skill.category && typeof skill.category !== 'string') {
            errors.push(`Skill ${index + 1}: category must be a string`);
          }
        });
      }
    }

    // Проверяем experiences
    if (data.experiences) {
      if (!Array.isArray(data.experiences)) {
        errors.push('Experiences must be an array');
      } else {
        data.experiences.forEach((exp: any, index: number) => {
          if (!exp.company || typeof exp.company !== 'string') {
            errors.push(`Experience ${index + 1}: company is required and must be a string`);
          }
          if (!exp.position || typeof exp.position !== 'string') {
            errors.push(`Experience ${index + 1}: position is required and must be a string`);
          }
          if (!exp.startDate || typeof exp.startDate !== 'string') {
            errors.push(`Experience ${index + 1}: startDate is required and must be a string`);
          }
          if (exp.endDate && typeof exp.endDate !== 'string') {
            errors.push(`Experience ${index + 1}: endDate must be a string`);
          }
          if (exp.isCurrent !== undefined && typeof exp.isCurrent !== 'boolean') {
            errors.push(`Experience ${index + 1}: isCurrent must be a boolean`);
          }
        });
      }
    }

    // Проверяем educations
    if (data.educations) {
      if (!Array.isArray(data.educations)) {
        errors.push('Educations must be an array');
      } else {
        data.educations.forEach((edu: any, index: number) => {
          if (!edu.institution || typeof edu.institution !== 'string') {
            errors.push(`Education ${index + 1}: institution is required and must be a string`);
          }
          if (!edu.degree || typeof edu.degree !== 'string') {
            errors.push(`Education ${index + 1}: degree is required and must be a string`);
          }
          if (!edu.field || typeof edu.field !== 'string') {
            errors.push(`Education ${index + 1}: field is required and must be a string`);
          }
          if (!edu.startDate || typeof edu.startDate !== 'string') {
            errors.push(`Education ${index + 1}: startDate is required and must be a string`);
          }
          if (edu.endDate && typeof edu.endDate !== 'string') {
            errors.push(`Education ${index + 1}: endDate must be a string`);
          }
          if (edu.isCurrent !== undefined && typeof edu.isCurrent !== 'boolean') {
            errors.push(`Education ${index + 1}: isCurrent must be a boolean`);
          }
        });
      }
    }

    // Проверяем projects
    if (data.projects) {
      if (!Array.isArray(data.projects)) {
        errors.push('Projects must be an array');
      } else {
        data.projects.forEach((project: any, index: number) => {
          if (!project.name || typeof project.name !== 'string') {
            errors.push(`Project ${index + 1}: name is required and must be a string`);
          }
          if (!project.description || typeof project.description !== 'string') {
            errors.push(`Project ${index + 1}: description is required and must be a string`);
          }
          if (!project.startDate || typeof project.startDate !== 'string') {
            errors.push(`Project ${index + 1}: startDate is required and must be a string`);
          }
          if (project.endDate && typeof project.endDate !== 'string') {
            errors.push(`Project ${index + 1}: endDate must be a string`);
          }
          if (project.isCurrent !== undefined && typeof project.isCurrent !== 'boolean') {
            errors.push(`Project ${index + 1}: isCurrent must be a boolean`);
          }
          if (project.technologies && !Array.isArray(project.technologies)) {
            errors.push(`Project ${index + 1}: technologies must be an array`);
          }
        });
      }
    }

    // Проверяем achievements
    if (data.achievements) {
      if (!Array.isArray(data.achievements)) {
        errors.push('Achievements must be an array');
      } else {
        data.achievements.forEach((achievement: any, index: number) => {
          if (!achievement.title || typeof achievement.title !== 'string') {
            errors.push(`Achievement ${index + 1}: title is required and must be a string`);
          }
          if (!achievement.description || typeof achievement.description !== 'string') {
            errors.push(`Achievement ${index + 1}: description is required and must be a string`);
          }
          if (!achievement.date || typeof achievement.date !== 'string') {
            errors.push(`Achievement ${index + 1}: date is required and must be a string`);
          }
        });
      }
    }

    // Проверяем languages
    if (data.languages) {
      if (!Array.isArray(data.languages)) {
        errors.push('Languages must be an array');
      } else {
        const validLevels = ['Native', 'Fluent', 'Intermediate', 'Basic'];
        data.languages.forEach((language: any, index: number) => {
          if (!language.name || typeof language.name !== 'string') {
            errors.push(`Language ${index + 1}: name is required and must be a string`);
          }
          if (!language.level || typeof language.level !== 'string') {
            errors.push(`Language ${index + 1}: level is required and must be a string`);
          } else if (!validLevels.includes(language.level)) {
            errors.push(`Language ${index + 1}: level must be one of: ${validLevels.join(', ')}`);
          }
          if (language.certification && typeof language.certification !== 'string') {
            errors.push(`Language ${index + 1}: certification must be a string`);
          }
        });
      }
    }

    // Проверяем certifications
    if (data.certifications) {
      if (!Array.isArray(data.certifications)) {
        errors.push('Certifications must be an array');
      } else {
        data.certifications.forEach((cert: any, index: number) => {
          if (!cert.name || typeof cert.name !== 'string') {
            errors.push(`Certification ${index + 1}: name is required and must be a string`);
          }
          if (!cert.issuer || typeof cert.issuer !== 'string') {
            errors.push(`Certification ${index + 1}: issuer is required and must be a string`);
          }
          if (!cert.date || typeof cert.date !== 'string') {
            errors.push(`Certification ${index + 1}: date is required and must be a string`);
          }
          if (cert.expiryDate && typeof cert.expiryDate !== 'string') {
            errors.push(`Certification ${index + 1}: expiryDate must be a string`);
          }
        });
      }
    }

    // Проверяем boolean поля
    if (data.isDefault !== undefined && typeof data.isDefault !== 'boolean') {
      errors.push('isDefault must be a boolean');
    }

    if (data.isPublic !== undefined && typeof data.isPublic !== 'boolean') {
      errors.push('isPublic must be a boolean');
    }

    this.logger.debug(`Validation result: ${errors.length} errors found`);
    if (errors.length > 0) {
      this.logger.error(`Validation errors: ${errors.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
