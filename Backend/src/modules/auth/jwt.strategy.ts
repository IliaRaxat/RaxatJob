import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Сначала пробуем извлечь из заголовка Authorization (приоритет для cross-origin)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Затем из куки
        (request: Request) => {
          const token = request?.cookies?.access_token;
          console.log('JWT Strategy: Extracting token from cookies:', token ? 'Token found' : 'No token');
          console.log('JWT Strategy: Available cookies:', Object.keys(request?.cookies || {}));
          console.log('JWT Strategy: Authorization header:', request?.headers?.authorization);
          return token || null;
        },
        // Также пробуем из query параметра (для отладки)
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key',
      issuer: 'smartmatch',
      audience: 'smartmatch-users',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy: Validating payload:', { sub: payload.sub, email: payload.email, role: payload.role });
    
    try {
      // First try to debug the user
      await this.prisma.debugUser(payload.sub);
      
      const user = await this.authService.validateUser(payload.sub);
      if (!user) {
        console.log('JWT Strategy: User not found for ID:', payload.sub);
        console.log('JWT Strategy: Payload details:', payload);
        throw new UnauthorizedException('User not found');
      }
      
      // Check if user is active
      if (!user.isActive) {
        console.log('JWT Strategy: User account is inactive for ID:', payload.sub);
        throw new UnauthorizedException('Account is inactive');
      }
      
      console.log('JWT Strategy: User validated successfully:', { id: user.id, email: user.email, role: user.role });
      return user;
    } catch (error) {
      console.error('JWT Strategy: Validation error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
