import { Module } from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { InternshipsController } from './internships.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { InternshipRequestsModule } from '../internship-requests/internship-requests.module';

@Module({
  imports: [PrismaModule, InternshipRequestsModule],
  controllers: [InternshipsController],
  providers: [InternshipsService],
  exports: [InternshipsService],
})
export class InternshipsModule {}
