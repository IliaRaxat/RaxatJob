import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto, UpdateSkillDto, AddCandidateSkillDto, UpdateCandidateSkillDto, AddStudentSkillDto, UpdateStudentSkillDto } from '../../dto/skill.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Get()
  findAll() {
    return this.skillsService.findAll();
  }

  @Get('popular')
  getPopularSkills() {
    return this.skillsService.getPopularSkills();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }

  // Навыки кандидата
  @Post('candidate/:candidateId')
  @UseGuards(JwtAuthGuard)
  addCandidateSkill(@Param('candidateId') candidateId: string, @Body() addSkillDto: AddCandidateSkillDto) {
    return this.skillsService.addCandidateSkill(candidateId, addSkillDto);
  }

  @Get('candidate/:candidateId')
  getCandidateSkills(@Param('candidateId') candidateId: string) {
    return this.skillsService.getCandidateSkills(candidateId);
  }

  @Patch('candidate/:candidateId/:skillId')
  @UseGuards(JwtAuthGuard)
  updateCandidateSkill(
    @Param('candidateId') candidateId: string,
    @Param('skillId') skillId: string,
    @Body() updateDto: UpdateCandidateSkillDto,
  ) {
    return this.skillsService.updateCandidateSkill(candidateId, skillId, updateDto);
  }

  @Delete('candidate/:candidateId/:skillId')
  @UseGuards(JwtAuthGuard)
  removeCandidateSkill(@Param('candidateId') candidateId: string, @Param('skillId') skillId: string) {
    return this.skillsService.removeCandidateSkill(candidateId, skillId);
  }

  // Навыки студента
  @Post('student/:studentId')
  @UseGuards(JwtAuthGuard)
  addStudentSkill(@Param('studentId') studentId: string, @Body() addSkillDto: AddStudentSkillDto) {
    return this.skillsService.addStudentSkill(studentId, addSkillDto);
  }

  @Get('student/:studentId')
  getStudentSkills(@Param('studentId') studentId: string) {
    return this.skillsService.getStudentSkills(studentId);
  }

  @Patch('student/:studentId/:skillId')
  @UseGuards(JwtAuthGuard)
  updateStudentSkill(
    @Param('studentId') studentId: string,
    @Param('skillId') skillId: string,
    @Body() updateDto: UpdateStudentSkillDto,
  ) {
    return this.skillsService.updateStudentSkill(studentId, skillId, updateDto);
  }

  @Delete('student/:studentId/:skillId')
  @UseGuards(JwtAuthGuard)
  removeStudentSkill(@Param('studentId') studentId: string, @Param('skillId') skillId: string) {
    return this.skillsService.removeStudentSkill(studentId, skillId);
  }
}
