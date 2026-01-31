import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AutoProfileService {
  constructor(private prisma: PrismaService) {}

  /**
   * Автоматически создает профиль для пользователя, если он не существует
   * @param userId - ID пользователя
   * @param userRole - Роль пользователя
   * @returns ID созданного или существующего профиля
   */
  async ensureProfileExists(userId: string, userRole: UserRole): Promise<string> {
    // Проверяем существующий профиль
    const existingProfile = await this.getExistingProfile(userId, userRole);
    if (existingProfile) {
      return existingProfile.id;
    }

    // Создаем новый профиль в зависимости от роли
    return this.createProfileByRole(userId, userRole);
  }

  /**
   * Получает существующий профиль пользователя
   */
  private async getExistingProfile(userId: string, userRole: UserRole): Promise<any> {
    switch (userRole) {
      case 'HR':
        return this.prisma.hRProfile.findUnique({
          where: { userId },
          select: { id: true }
        });
      case 'CANDIDATE':
        return this.prisma.candidateProfile.findUnique({
          where: { userId },
          select: { id: true }
        });
      case 'UNIVERSITY':
        return this.prisma.universityProfile.findUnique({
          where: { userId },
          select: { id: true }
        });
      case 'ADMIN':
        return this.prisma.adminProfile.findUnique({
          where: { userId },
          select: { id: true }
        });
      case 'MODERATOR':
        return this.prisma.moderatorProfile.findUnique({
          where: { userId },
          select: { id: true }
        });
      default:
        return null;
    }
  }

  /**
   * Создает профиль в зависимости от роли пользователя
   */
  private async createProfileByRole(userId: string, userRole: UserRole): Promise<string> {
    switch (userRole) {
      case 'HR':
        return this.createHRProfile(userId);
      case 'CANDIDATE':
        return this.createCandidateProfile(userId);
      case 'UNIVERSITY':
        return this.createUniversityProfile(userId);
      case 'ADMIN':
        return this.createAdminProfile(userId);
      case 'MODERATOR':
        return this.createModeratorProfile(userId);
      default:
        throw new NotFoundException(`Профиль для роли ${userRole} не поддерживается`);
    }
  }

  /**
   * Создает базовый HR профиль
   */
  private async createHRProfile(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    const profile = await this.prisma.hRProfile.create({
      data: {
        userId,
        firstName: 'HR',
        lastName: 'Manager',
        company: 'Компания',
        position: 'HR Manager',
      },
      select: { id: true }
    });

    return profile.id;
  }

  /**
   * Создает базовый профиль кандидата
   */
  private async createCandidateProfile(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    const profile = await this.prisma.candidateProfile.create({
      data: {
        userId,
        firstName: 'Кандидат',
        lastName: 'Соискатель',
        isAvailable: true,
      },
      select: { id: true }
    });

    return profile.id;
  }

  /**
   * Создает базовый профиль университета
   */
  private async createUniversityProfile(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    const profile = await this.prisma.universityProfile.create({
      data: {
        userId,
        name: 'Университет',
        address: 'Адрес университета',
      },
      select: { id: true }
    });

    return profile.id;
  }

  /**
   * Создает базовый профиль администратора
   */
  private async createAdminProfile(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    const profile = await this.prisma.adminProfile.create({
      data: {
        userId,
        firstName: 'Администратор',
        lastName: 'Системы',
        position: 'Системный администратор',
        department: 'IT',
      },
      select: { id: true }
    });

    return profile.id;
  }

  /**
   * Создает базовый профиль модератора
   */
  private async createModeratorProfile(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    const profile = await this.prisma.moderatorProfile.create({
      data: {
        userId,
        firstName: 'Модератор',
        lastName: 'Контента',
        position: 'Модератор',
        department: 'Модерация',
      },
      select: { id: true }
    });

    return profile.id;
  }

  /**
   * Получает ID профиля пользователя (создает если не существует)
   */
  async getProfileId(userId: string, userRole: UserRole): Promise<string> {
    return this.ensureProfileExists(userId, userRole);
  }
}
