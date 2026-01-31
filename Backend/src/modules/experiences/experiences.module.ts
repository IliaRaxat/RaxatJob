import { Module } from '@nestjs/common';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesService } from './experiences.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ExperiencesController],
  providers: [ExperiencesService, PrismaService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
