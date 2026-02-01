import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { CreateInternshipDto, UpdateInternshipDto, InternshipQueryDto, InternshipApplicationDto } from '../../dto/internship.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  /**
   * Создать стажировку (только для HR)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  create(@Body() createInternshipDto: CreateInternshipDto, @Request() req) {
    return this.internshipsService.create(createInternshipDto, req.user.id);
  }

  /**
   * Получить все стажировки (публичный доступ с опциональной аутентификацией)
   */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() query: InternshipQueryDto, @Request() req) {
    return this.internshipsService.findAll(query, req.user?.id);
  }

  /**
   * Получить мои стажировки (для HR)
   */
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  findMyInternships(@Query() query: InternshipQueryDto, @Request() req) {
    return this.internshipsService.findMyInternships(req.user.id, query);
  }

  /**
   * Получить статистику стажировок (для HR)
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  getStats(@Request() req) {
    return this.internshipsService.getStats(req.user.id);
  }

  /**
   * Получить стажировку по ID (публичный доступ с опциональной аутентификацией)
   */
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.internshipsService.findOne(id, req.user?.id);
  }

  /**
   * Обновить стажировку
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  update(@Param('id') id: string, @Body() updateInternshipDto: UpdateInternshipDto, @Request() req) {
    return this.internshipsService.update(id, updateInternshipDto, req.user.id);
  }

  /**
   * Удалить стажировку
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  remove(@Param('id') id: string, @Request() req) {
    return this.internshipsService.remove(id, req.user.id);
  }

  /**
   * Подать заявку на стажировку
   */
  @Post('apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  applyToInternship(@Body() applicationDto: InternshipApplicationDto, @Request() req) {
    return this.internshipsService.applyToInternship(applicationDto, req.user.id);
  }

  /**
   * Получить мои заявки на стажировки (для кандидатов)
   */
  @Get('applications/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  getMyApplications(@Query() query: InternshipQueryDto, @Request() req) {
    return this.internshipsService.getMyApplications(req.user.id, query);
  }

  /**
   * Получить заявки на мои стажировки (для HR)
   */
  @Get('applications/hr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  getApplicationsForMyInternships(@Query() query: InternshipQueryDto, @Request() req) {
    return this.internshipsService.getApplicationsForMyInternships(req.user.id, query);
  }

  /**
   * Принять заявку на стажировку
   */
  @Post('applications/:applicationId/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  acceptApplication(@Param('applicationId') applicationId: string, @Request() req) {
    return this.internshipsService.acceptApplication(applicationId, req.user.id);
  }

  /**
   * Отклонить заявку на стажировку
   */
  @Post('applications/:applicationId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  rejectApplication(
    @Param('applicationId') applicationId: string, 
    @Body() body: { reason?: string },
    @Request() req
  ) {
    return this.internshipsService.rejectApplication(applicationId, req.user.id, body.reason);
  }

  /**
   * Удалить участника из стажировки
   */
  @Delete('participants/:participantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  removeParticipant(@Param('participantId') participantId: string, @Request() req) {
    return this.internshipsService.removeParticipant(participantId, req.user.id);
  }

  /**
   * Обновить счетчик участников
   */
  @Post(':internshipId/update-participants-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  updateParticipantsCount(@Param('internshipId') internshipId: string) {
    return this.internshipsService.updateParticipantsCount(internshipId);
  }

  /**
   * Получить каталог заявок от университетов (для компаний)
   */
  @Get('university-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  getUniversityRequestsCatalog(@Query() query: InternshipQueryDto) {
    return this.internshipsService.getUniversityRequestsCatalog(query);
  }

  /**
   * Создать заявку на стажировку от университета
   */
  @Post('university-apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UNIVERSITY')
  createUniversityRequest(@Body() requestDto: any, @Request() req) {
    // Перенаправляем на правильный сервис заявок от университетов
    return this.internshipsService.createUniversityRequest(requestDto, req.user.id);
  }
}
