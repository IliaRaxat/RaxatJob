import { Controller, Get, Post, Body, Patch, UseGuards, Request, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { CreateHRProfileDto, UpdateHRProfileDto, CreateCandidateProfileDto, UpdateCandidateProfileDto, CreateUniversityProfileDto, UpdateUniversityProfileDto, UpdateProfileDto } from '../../dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { multerConfig, resumeMulterConfig } from '../../config/multer.config';
import { Response } from 'express';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @Post('hr')
  createHRProfile(@Body() createHRProfileDto: CreateHRProfileDto, @Request() req) {
    return this.profilesService.createHRProfile(createHRProfileDto, req.user.id);
  }

  @Get('hr')
  getHRProfile(@Request() req) {
    return this.profilesService.getHRProfile(req.user.id);
  }

  @Patch('hr')
  updateHRProfile(@Body() updateHRProfileDto: UpdateHRProfileDto, @Request() req) {
    return this.profilesService.updateHRProfile(updateHRProfileDto, req.user.id);
  }

  @Post('candidate')
  createCandidateProfile(@Body() createCandidateProfileDto: CreateCandidateProfileDto, @Request() req) {
    return this.profilesService.createCandidateProfile(createCandidateProfileDto, req.user.id);
  }

  @Get('candidate')
  getCandidateProfile(@Request() req) {
    return this.profilesService.getCandidateProfile(req.user.id);
  }

  @Patch('candidate')
  updateCandidateProfile(@Body() updateCandidateProfileDto: UpdateCandidateProfileDto, @Request() req) {
    return this.profilesService.updateCandidateProfile(updateCandidateProfileDto, req.user.id);
  }

  @Post('university')
  createUniversityProfile(@Body() createUniversityProfileDto: CreateUniversityProfileDto, @Request() req) {
    return this.profilesService.createUniversityProfile(createUniversityProfileDto, req.user.id);
  }

  @Get('university')
  getUniversityProfile(@Request() req) {
    return this.profilesService.getUniversityProfile(req.user.id);
  }

  @Patch('university')
  updateUniversityProfile(@Body() updateUniversityProfileDto: UpdateUniversityProfileDto, @Request() req) {
    return this.profilesService.updateUniversityProfile(updateUniversityProfileDto, req.user.id);
  }

  @Patch()
  @UsePipes(new ValidationPipe({ skipMissingProperties: true, whitelist: false, forbidNonWhitelisted: false }))
  updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Request() req) {
    return this.profilesService.updateProfile(updateProfileDto, req.user.id);
  }

  @Post('avatar/upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new Error('No file provided. Please ensure you are sending a file with the field name "file" and Content-Type: multipart/form-data');
    }
    return this.profilesService.uploadAvatar(file, req.user.id);
  }

  @Get('avatar')
  async getAvatar(@Request() req, @Res() res: Response) {
    return this.profilesService.getAvatar(req.user.id, res);
  }

  @Get('avatar/url')
  async getAvatarUrl(@Request() req) {
    return this.profilesService.getAvatarUrl(req.user.id);
  }

  @Post('avatar/delete')
  async deleteAvatar(@Request() req) {
    return this.profilesService.deleteAvatar(req.user.id);
  }

  @Post('candidate/resume')
  @UseInterceptors(FileInterceptor('file', resumeMulterConfig))
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new Error('No file provided. Please ensure you are sending a file with the field name "file" and Content-Type: multipart/form-data');
    }
    return this.profilesService.uploadResume(file, req.user.id);
  }

  @Get('candidate/resume')
  async getResume(@Request() req, @Res() res: Response) {
    return this.profilesService.getResume(req.user.id, res);
  }

  @Get('candidate/resume/url')
  async getResumeUrl(@Request() req) {
    return this.profilesService.getResumeUrl(req.user.id);
  }

  @Post('candidate/resume/delete')
  async deleteResume(@Request() req) {
    return this.profilesService.deleteResume(req.user.id);
  }

  // Admin Profile endpoints
  @Get('admin')
  getAdminProfile(@Request() req) {
    return this.profilesService.getAdminProfile(req.user.id);
  }

  @Patch('admin')
  updateAdminProfile(@Body() updateProfileDto: UpdateProfileDto, @Request() req) {
    return this.profilesService.updateProfile(updateProfileDto, req.user.id);
  }

  // Moderator Profile endpoints
  @Get('moderator')
  getModeratorProfile(@Request() req) {
    return this.profilesService.getModeratorProfile(req.user.id);
  }

  @Patch('moderator')
  updateModeratorProfile(@Body() updateProfileDto: UpdateProfileDto, @Request() req) {
    return this.profilesService.updateProfile(updateProfileDto, req.user.id);
  }

}
