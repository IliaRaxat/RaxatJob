import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { HrService } from './hr.service';
import { ApplicationQueryDto } from '../../dto/application.dto';

@ApiTags('HR')
@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HR', 'ADMIN')
@ApiBearerAuth()
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('company-responses')
  @ApiOperation({ summary: 'Получить все отклики на вакансии компании HR' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список откликов на вакансии компании',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'INTERVIEW_SCHEDULED', 'HIRED', 'WITHDRAWN'] },
          coverLetter: { type: 'string' },
          resume: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              summary: { type: 'string' },
              isDefault: { type: 'boolean' }
            }
          },
          appliedAt: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
          job: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              location: { type: 'string' },
              type: { type: 'string' },
              hr: {
                type: 'object',
                properties: {
                  company: { type: 'string' }
                }
              }
            }
          },
          candidate: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              phone: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  email: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getCompanyResponses(@Request() req, @Query() query: ApplicationQueryDto) {
    return this.hrService.getCompanyResponses(req.user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику по откликам компании' })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика по откликам',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        pending: { type: 'number' },
        reviewed: { type: 'number' },
        accepted: { type: 'number' },
        rejected: { type: 'number' },
        interviewScheduled: { type: 'number' },
        hired: { type: 'number' },
        withdrawn: { type: 'number' }
      }
    }
  })
  async getCompanyStats(@Request() req) {
    return this.hrService.getCompanyStats(req.user.id);
  }

  @Get('debug')
  @ApiOperation({ summary: 'Диагностика HR системы' })
  @ApiResponse({ status: 200, description: 'Диагностическая информация' })
  async debugHrSystem(@Request() req) {
    return this.hrService.debugHrSystem(req.user.id);
  }

  @Get('company-responses-via-jobs')
  @ApiOperation({ summary: 'Получить отклики через вакансии HR (альтернативный метод)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список откликов на вакансии HR через поиск по вакансиям',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string' },
          coverLetter: { type: 'string' },
          resume: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              summary: { type: 'string' },
              isDefault: { type: 'boolean' }
            }
          },
          appliedAt: { type: 'string', format: 'date-time' },
          job: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              location: { type: 'string' },
              type: { type: 'string' }
            }
          },
          candidate: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async getCompanyResponsesViaJobs(@Request() req, @Query() query: ApplicationQueryDto) {
    return this.hrService.getCompanyResponsesViaJobs(req.user.id, query);
  }
}
