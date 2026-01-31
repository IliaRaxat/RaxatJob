import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Res, Get, Request } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from '../../dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto);

    // Устанавливаем HTTP-only куку с JWT токеном
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true для production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // none для cross-origin в production
      maxAge: 60 * 60 * 1000, // 1 час
      path: '/',
      domain: undefined, // Не устанавливаем домен
    });

    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);

    // Устанавливаем HTTP-only куку с JWT токеном
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true для production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // none для cross-origin в production
      maxAge: 60 * 60 * 1000, // 1 час
      path: '/',
      domain: undefined, // Не устанавливаем домен
    });

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Очищаем куку
    res.clearCookie('access_token');

    return { message: 'Успешный выход из системы' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return {
      user: req.user,
      message: 'Аутентификация работает корректно'
    };
  }

  @Get('token')
  @UseGuards(JwtAuthGuard)
  async getToken(@Request() req) {
    // Возвращаем токен для использования в заголовке Authorization
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.access_token;
    
    return {
      token,
      user: req.user,
      message: 'Используйте этот токен в заголовке Authorization: Bearer <token>'
    };
  }

  @Get('cors-test')
  async corsTest(@Request() req) {
    return {
      message: 'CORS работает корректно',
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      cookies: Object.keys(req.cookies || {}),
      timestamp: new Date().toISOString()
    };
  }
}
