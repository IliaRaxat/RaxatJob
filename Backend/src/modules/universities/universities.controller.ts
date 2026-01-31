import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { CreateStudentDto, UpdateStudentDto } from '../../dto/student.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  // Студенты
  @Post('students')
  @UseGuards(JwtAuthGuard)
  createStudent(@Body() createStudentDto: CreateStudentDto, @Request() req) {
    return this.universitiesService.createStudent(createStudentDto, req.user.id);
  }

  @Get('students')
  @UseGuards(JwtAuthGuard)
  findAllStudents(@Request() req) {
    return this.universitiesService.findAllStudents(req.user.id);
  }

  @Get('students/search')
  @UseGuards(JwtAuthGuard)
  findStudentsBySkills(@Query('skillIds') skillIds: string, @Request() req) {
    const skillIdsArray = skillIds ? skillIds.split(',') : [];
    return this.universitiesService.findStudentsBySkills(req.user.id, skillIdsArray);
  }

  @Get('students/stats')
  @UseGuards(JwtAuthGuard)
  getStudentStats(@Request() req) {
    return this.universitiesService.getStudentStats(req.user.id);
  }

  @Get('students/:id')
  @UseGuards(JwtAuthGuard)
  findStudent(@Param('id') id: string, @Request() req) {
    return this.universitiesService.findStudent(id, req.user.id);
  }

  @Patch('students/:id')
  @UseGuards(JwtAuthGuard)
  updateStudent(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto, @Request() req) {
    return this.universitiesService.updateStudent(id, updateStudentDto, req.user.id);
  }

  @Delete('students/:id')
  @UseGuards(JwtAuthGuard)
  removeStudent(@Param('id') id: string, @Request() req) {
    return this.universitiesService.removeStudent(id, req.user.id);
  }
}
