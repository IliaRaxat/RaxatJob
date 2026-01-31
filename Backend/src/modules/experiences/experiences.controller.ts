import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto, UpdateExperienceDto } from '../../dto/experience.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('experiences')
@UseGuards(JwtAuthGuard)
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Post()
  create(@Body() createExperienceDto: CreateExperienceDto, @Request() req) {
    return this.experiencesService.create(createExperienceDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.experiencesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.experiencesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExperienceDto: UpdateExperienceDto, @Request() req) {
    return this.experiencesService.update(id, updateExperienceDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.experiencesService.remove(id, req.user.id);
  }
}
