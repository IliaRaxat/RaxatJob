import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { InternshipRequestsService } from './internship-requests.service';
import { CreateInternshipRequestDto, UpdateInternshipRequestDto, InternshipRequestQueryDto, InternshipRequestActionDto } from '../../dto/internship-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('internship-requests')
export class InternshipRequestsController {
  constructor(private readonly internshipRequestsService: InternshipRequestsService) {}

  /**
   * Создать заявку на стажировку (только для университетов)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UNIVERSITY')
  create(@Body() createInternshipRequestDto: CreateInternshipRequestDto, @Request() req) {
    return this.internshipRequestsService.create(createInternshipRequestDto, req.user.id);
  }

  /**
   * Получить все заявки университета
   */
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UNIVERSITY')
  findMyRequests(@Query() query: InternshipRequestQueryDto, @Request() req) {
    return this.internshipRequestsService.findAll(req.user.id, query);
  }

  /**
   * Получить каталог заявок для компаний
   */
  @Get('catalog')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN', 'MODERATOR')
  getCatalog(@Query() query: InternshipRequestQueryDto) {
    return this.internshipRequestsService.getCatalogForCompanies(query);
  }

  /**
   * Получить статистику заявок университета
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UNIVERSITY')
  getStats(@Request() req) {
    return this.internshipRequestsService.getStats(req.user.id);
  }

  /**
   * Получить заявку по ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UNIVERSITY', 'HR', 'ADMIN', 'MODERATOR')
  findOne(@Param('id') id: string, @Request() req) {
    return this.internshipRequestsService.findOne(id, req.user.id);
  }

  /**
   * Обновить заявку
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UNIVERSITY')
  update(@Param('id') id: string, @Body() updateInternshipRequestDto: UpdateInternshipRequestDto, @Request() req) {
    return this.internshipRequestsService.update(id, updateInternshipRequestDto, req.user.id);
  }

  /**
   * Удалить заявку
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UNIVERSITY')
  remove(@Param('id') id: string, @Request() req) {
    return this.internshipRequestsService.remove(id, req.user.id);
  }

  /**
   * Одобрить заявку (для HR)
   */
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  approveRequest(@Param('id') id: string, @Body() actionDto: InternshipRequestActionDto, @Request() req) {
    return this.internshipRequestsService.approveRequest(id, actionDto, req.user.id);
  }

  /**
   * Отклонить заявку (для HR)
   */
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  rejectRequest(@Param('id') id: string, @Body() actionDto: InternshipRequestActionDto, @Request() req) {
    return this.internshipRequestsService.rejectRequest(id, actionDto, req.user.id);
  }
}
