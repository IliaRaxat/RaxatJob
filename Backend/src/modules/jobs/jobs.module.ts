import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { AutoProfileService } from '../profiles/auto-profile.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, PrismaService, AutoProfileService],
})
export class JobsModule {}
