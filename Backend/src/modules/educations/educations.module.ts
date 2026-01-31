import { Module } from '@nestjs/common';
import { EducationsController } from './educations.controller';
import { EducationsService } from './educations.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EducationsController],
  providers: [EducationsService, PrismaService],
  exports: [EducationsService],
})
export class EducationsModule {}
