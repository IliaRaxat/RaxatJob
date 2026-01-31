import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  Logger
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  private readonly logger = new Logger(ResumesController.name);

  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  async createResume(
    @Request() req: any,
    @Body() createResumeDto: CreateResumeDto
  ): Promise<ResumeResponseDto> {
    this.logger.log(`Creating resume for user: ${req.user.id}`);
    this.logger.debug(`CreateResumeDto validation: ${JSON.stringify(createResumeDto, null, 2)}`);
    
    try {
      const result = await this.resumesService.createResume(req.user.id, createResumeDto);
      this.logger.log(`Resume created successfully with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create resume for user ${req.user.id}: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to create resume',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async getResumes(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isDefault') isDefault?: string,
    @Query('isPublic') isPublic?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ): Promise<ResumeListResponseDto> {
    try {
      const filters = {
        search,
        isDefault: isDefault === 'true' ? true : isDefault === 'false' ? false : undefined,
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined
      };

      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
      };

      const result = await this.resumesService.getResumes(req.user.id, filters, pagination);

      return {
        resumes: result.resumes,
        total: result.total,
        page: result.page,
        limit: result.limit
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get resumes',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('default')
  async getDefaultResume(@Request() req: any): Promise<ResumeResponseDto | null> {
    try {
      return await this.resumesService.getDefaultResume(req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get default resume',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async getResumeById(
    @Request() req: any,
    @Param('id') resumeId: string
  ): Promise<ResumeResponseDto> {
    try {
      return await this.resumesService.getResumeById(req.user.id, resumeId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get resume',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async updateResume(
    @Request() req: any,
    @Param('id') resumeId: string,
    @Body() updateResumeDto: UpdateResumeDto
  ): Promise<ResumeResponseDto> {
    this.logger.log(`Updating resume ${resumeId} for user: ${req.user.id}`);
    this.logger.debug(`UpdateResumeDto validation: ${JSON.stringify(updateResumeDto, null, 2)}`);
    
    // Детальная проверка каждого поля
    this.logger.debug(`Title: ${updateResumeDto.title}`);
    this.logger.debug(`Summary: ${updateResumeDto.summary}`);
    this.logger.debug(`Objective: ${updateResumeDto.objective}`);
    this.logger.debug(`Skills count: ${updateResumeDto.skills?.length || 0}`);
    this.logger.debug(`Experiences count: ${updateResumeDto.experiences?.length || 0}`);
    this.logger.debug(`Educations count: ${updateResumeDto.educations?.length || 0}`);
    this.logger.debug(`Projects count: ${updateResumeDto.projects?.length || 0}`);
    this.logger.debug(`Achievements count: ${updateResumeDto.achievements?.length || 0}`);
    this.logger.debug(`Languages count: ${updateResumeDto.languages?.length || 0}`);
    this.logger.debug(`Certifications count: ${updateResumeDto.certifications?.length || 0}`);
    this.logger.debug(`IsDefault: ${updateResumeDto.isDefault}`);
    this.logger.debug(`IsPublic: ${updateResumeDto.isPublic}`);
    
    try {
      const result = await this.resumesService.updateResume(req.user.id, resumeId, updateResumeDto);
      this.logger.log(`Resume ${resumeId} updated successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update resume ${resumeId} for user ${req.user.id}: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to update resume',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async deleteResume(
    @Request() req: any,
    @Param('id') resumeId: string
  ): Promise<{ message: string }> {
    try {
      await this.resumesService.deleteResume(req.user.id, resumeId);
      return { message: 'Resume deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete resume',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/set-default')
  async setDefaultResume(
    @Request() req: any,
    @Param('id') resumeId: string
  ): Promise<ResumeResponseDto> {
    try {
      return await this.resumesService.setDefaultResume(req.user.id, resumeId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to set default resume',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/duplicate')
  async duplicateResume(
    @Request() req: any,
    @Param('id') resumeId: string,
    @Body() body: { title: string }
  ): Promise<ResumeResponseDto> {
    try {
      if (!body.title) {
        throw new HttpException('Title is required for duplicate', HttpStatus.BAD_REQUEST);
      }

      return await this.resumesService.duplicateResume(req.user.id, resumeId, body.title);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to duplicate resume',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Дополнительные удобные эндпоинты

  @Get('search')
  async searchResumes(
    @Request() req: any,
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<ResumeListResponseDto> {
    try {
      if (!query) {
        throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
      }

      const filters = { search: query };
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10
      };

      const result = await this.resumesService.getResumes(req.user.id, filters, pagination);

      return {
        resumes: result.resumes,
        total: result.total,
        page: result.page,
        limit: result.limit
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search resumes',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('public')
  async getPublicResumes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ): Promise<ResumeListResponseDto> {
    try {
      const filters = { 
        isPublic: true,
        search 
      };
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10
      };

      // Для публичных резюме не нужна аутентификация
      const result = await this.resumesService.getPublicResumes(filters, pagination);

      return {
        resumes: result.resumes,
        total: result.total,
        page: result.page,
        limit: result.limit
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get public resumes',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  async getResumeStats(@Request() req: any): Promise<any> {
    try {
      return await this.resumesService.getResumeStats(req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get resume stats',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('bulk-update')
  async bulkUpdateResumes(
    @Request() req: any,
    @Body() body: { resumeIds: string[], updates: UpdateResumeDto }
  ): Promise<{ updated: number; resumes: ResumeResponseDto[] }> {
    try {
      if (!body.resumeIds || !Array.isArray(body.resumeIds) || body.resumeIds.length === 0) {
        throw new HttpException('Resume IDs array is required', HttpStatus.BAD_REQUEST);
      }

      return await this.resumesService.bulkUpdateResumes(req.user.id, body.resumeIds, body.updates);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to bulk update resumes',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('export/:id')
  async exportResume(
    @Request() req: any,
    @Param('id') resumeId: string,
    @Body() body: { format: 'json' | 'pdf' | 'docx' } = { format: 'json' }
  ): Promise<any> {
    try {
      return await this.resumesService.exportResume(req.user.id, resumeId, body.format);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to export resume',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('import')
  async importResume(
    @Request() req: any,
    @Body() body: { resumeData: any, title: string }
  ): Promise<ResumeResponseDto> {
    try {
      if (!body.resumeData || !body.title) {
        throw new HttpException('Resume data and title are required', HttpStatus.BAD_REQUEST);
      }

      return await this.resumesService.importResume(req.user.id, body.resumeData, body.title);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to import resume',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('templates')
  async getResumeTemplates(): Promise<any> {
    try {
      return await this.resumesService.getResumeTemplates();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get resume templates',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('from-template')
  async createResumeFromTemplate(
    @Request() req: any,
    @Body() body: { templateId: string, title: string }
  ): Promise<ResumeResponseDto> {
    try {
      if (!body.templateId || !body.title) {
        throw new HttpException('Template ID and title are required', HttpStatus.BAD_REQUEST);
      }

      return await this.resumesService.createResumeFromTemplate(req.user.id, body.templateId, body.title);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create resume from template',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
