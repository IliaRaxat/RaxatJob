import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AutoProfileService } from '../profiles/auto-profile.service';
import { RegisterDto, LoginDto, AuthResponseDto, UserRole } from '../../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private autoProfileService: AutoProfileService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, role } = registerDto;

    try {
      console.log(`Registration attempt for email: ${email}, role: ${role}`);
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log(`Registration failed: User already exists for email: ${email}`);
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });

      // Автоматически создаем профиль для пользователя
      try {
        await this.autoProfileService.ensureProfileExists(user.id, role as any);
        console.log(`Profile created automatically for user: ${user.id}, role: ${role}`);
      } catch (profileError) {
        console.warn(`Failed to create profile for user ${user.id}:`, profileError.message);
        // Не прерываем регистрацию, если не удалось создать профиль
      }

      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      };
      const accessToken = this.jwtService.sign(payload, {
        issuer: 'smartmatch',
        audience: 'smartmatch-users'
      });

      console.log(`User registered successfully: ${user.id}`);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new InternalServerErrorException('Ошибка при создании пользователя');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    console.log(`Login attempt for email: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`Login failed: User not found for email: ${email}`);
      throw new UnauthorizedException('Неверные учетные данные');
    }

    if (!user.isActive) {
      console.log(`Login failed: User account is inactive for email: ${email}`);
      throw new UnauthorizedException('Account is blocked');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for email: ${email}`);
      throw new UnauthorizedException('Неверные учетные данные');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };
    const accessToken = this.jwtService.sign(payload, {
      issuer: 'smartmatch',
      audience: 'smartmatch-users'
    });

    console.log(`User logged in successfully: ${user.id}`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
      },
    };
  }

  async validateUser(userId: string) {
    try {
      console.log('AuthService: Validating user with ID:', userId);
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (user) {
        console.log('AuthService: User found:', { id: user.id, email: user.email, role: user.role, isActive: user.isActive });
      } else {
        console.log('AuthService: User not found for ID:', userId);
      }

      return user;
    } catch (error) {
      console.error('AuthService: Database error during user validation:', error);
      throw error;
    }
  }
}
