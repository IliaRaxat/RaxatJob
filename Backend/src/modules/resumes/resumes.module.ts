import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ValidationLoggingMiddleware } from '../../middleware/validation-logging.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService]
})
export class ResumesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidationLoggingMiddleware)
      .forRoutes('resumes');
  }
}
