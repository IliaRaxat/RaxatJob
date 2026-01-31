import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AutoProfileService } from '../profiles/auto-profile.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || (() => {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('JWT_SECRET must be set in production environment');
        }
        return 'fallback-secret-key';
      })(),
      signOptions: { 
        expiresIn: '1h',
        issuer: 'smartmatch',
        audience: 'smartmatch-users'
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, AutoProfileService],
  exports: [AuthService],
})
export class AuthModule {}
