import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationQueryDto } from '../../dto/application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createApplicationDto: CreateApplicationDto, @Request() req) {
    return this.applicationsService.create(createApplicationDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: ApplicationQueryDto, @Request() req) {
    // Фильтруем по роли пользователя
    if (req.user.role === 'HR') {
      query.candidateId = undefined; // HR видит все отклики на свои вакансии
    } else if (req.user.role === 'CANDIDATE') {
      query.candidateId = req.user.id; // Кандидат видит только свои отклики
    }
    return this.applicationsService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyApplications(@Request() req) {
    console.log(`🔍 Запрос /applications/my для пользователя: ${req.user.id}, роль: ${req.user.role}`);
    
    if (req.user.role === 'HR') {
      console.log('👔 Обработка как HR');
      return this.applicationsService.findByHR(req.user.id);
    } else if (req.user.role === 'CANDIDATE') {
      console.log('👤 Обработка как кандидат');
      return this.applicationsService.findByCandidate(req.user.id);
    } else {
      console.log(`❌ Неизвестная роль: ${req.user.role}`);
      return [];
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto, @Request() req) {
    return this.applicationsService.update(id, updateApplicationDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.applicationsService.remove(id, req.user.id);
  }

  @Get('debug/my')
  @UseGuards(JwtAuthGuard)
  debugMyApplications(@Request() req) {
    return this.applicationsService.debugMyApplications(req.user.id, req.user.role);
  }

  @Get('debug/permissions/:id')
  @UseGuards(JwtAuthGuard)
  debugPermissions(@Param('id') id: string, @Request() req) {
    return this.applicationsService.debugPermissions(id, req.user.id, req.user.role);
  }
}
