import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiTestController } from './ai.controller.test';
import { AiPublicController } from './ai-public.controller';
import { AiService } from './ai.service';
import { OllamaService } from './ollama.service';
import { CandidateAnalysisService } from './candidate-analysis.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController, AiTestController, AiPublicController],
  providers: [AiService, OllamaService, CandidateAnalysisService],
  exports: [AiService, OllamaService, CandidateAnalysisService],
})
export class AiModule {}
