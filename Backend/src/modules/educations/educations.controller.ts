import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EducationsService } from './educations.service';
import { CreateEducationDto, UpdateEducationDto } from '../../dto/education.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('educations')
@UseGuards(JwtAuthGuard)
export class EducationsController {
  constructor(private readonly educationsService: EducationsService) {}

  @Post()
  create(@Body() createEducationDto: CreateEducationDto, @Request() req) {
    return this.educationsService.create(createEducationDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.educationsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.educationsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEducationDto: UpdateEducationDto, @Request() req) {
    return this.educationsService.update(id, updateEducationDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.educationsService.remove(id, req.user.id);
  }
}
