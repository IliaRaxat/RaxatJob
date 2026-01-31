import { Module } from '@nestjs/common';
import { InternshipRequestsService } from './internship-requests.service';
import { InternshipRequestsController } from './internship-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InternshipRequestsController],
  providers: [InternshipRequestsService],
  exports: [InternshipRequestsService],
})
export class InternshipRequestsModule {}
