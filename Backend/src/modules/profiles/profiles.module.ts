import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { AutoProfileService } from './auto-profile.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageService } from '../storage/storage.service';
import { HRProfileStrategy } from './strategies/hr-profile.strategy';
import { CandidateProfileStrategy } from './strategies/candidate-profile.strategy';
import { UniversityProfileStrategy } from './strategies/university-profile.strategy';
import { AdminProfileStrategy } from './strategies/admin-profile.strategy';
import { ModeratorProfileStrategy } from './strategies/moderator-profile.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [ProfilesController],
  providers: [ProfilesService, AutoProfileService, StorageService, HRProfileStrategy, CandidateProfileStrategy, UniversityProfileStrategy, AdminProfileStrategy, ModeratorProfileStrategy],
  exports: [ProfilesService, AutoProfileService],
})
export class ProfilesModule {}
