import { Module } from '@nestjs/common';
import { ModeratorController } from './moderator.controller';
import { ModeratorService } from './moderator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModeratorController],
  providers: [ModeratorService],
  exports: [ModeratorService],
})
export class ModeratorModule {}
