import { Module } from '@nestjs/common';
import { HrController } from './hr.controller';
import { HrAiController } from './hr-ai.controller';
import { HrService } from './hr.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [HrController, HrAiController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
