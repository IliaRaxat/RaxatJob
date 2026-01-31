import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AutoProfileService } from '../profiles/auto-profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, AutoProfileService],
  exports: [AdminService],
})
export class AdminModule {}
