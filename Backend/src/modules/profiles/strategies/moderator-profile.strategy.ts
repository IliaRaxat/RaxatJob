import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from '../../../dto/user.dto';
import { ProfileStrategy } from './profile-strategy.interface';
import { USER_SELECT_BASIC } from '../../../shared/constants/prisma-fragments';
import { filterUndefinedFields, buildProfileUpdateData } from '../../../shared/utils/data.utils';

@Injectable()
export class ModeratorProfileStrategy implements ProfileStrategy {
  constructor(private prisma: PrismaService) {}

  async createProfile(createModeratorProfileDto: any, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'MODERATOR') {
      throw new ForbiddenException('Only MODERATOR users can create moderator profiles');
    }

    const existingProfile = await this.prisma.moderatorProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException('Moderator profile already exists');
    }

    return this.prisma.moderatorProfile.create({
      data: {
        ...createModeratorProfileDto,
        userId,
      },
      include: {
        user: {
          select: USER_SELECT_BASIC,
        },
        avatar: true,
      },
    });
  }

  async getProfile(userId: string) {
    let profile = await this.prisma.moderatorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: USER_SELECT_BASIC,
        },
        avatar: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Moderator profile not found');
    }

    return profile;
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, userId: string) {
    const profile = await this.getProfile(userId);
    
    const updateData = buildProfileUpdateData(updateProfileDto, ['firstName', 'lastName']);
    const filteredData = filterUndefinedFields(updateData);

    return this.prisma.moderatorProfile.update({
      where: { userId },
      data: filteredData,
      include: {
        user: {
          select: USER_SELECT_BASIC,
        },
        avatar: true,
      },
    });
  }

  async deleteProfile(userId: string) {
    const profile = await this.getProfile(userId);
    
    return this.prisma.moderatorProfile.delete({
      where: { userId },
    });
  }

  async getAvatarId(userId: string): Promise<string | null> {
    const profile = await this.prisma.moderatorProfile.findUnique({
      where: { userId },
      select: { avatarId: true }
    });
    return profile?.avatarId || null;
  }

  async updateAvatarId(userId: string, avatarId: string): Promise<void> {
    // Проверяем, существует ли профиль модератора
    const existingProfile = await this.prisma.moderatorProfile.findUnique({
      where: { userId }
    });

    if (!existingProfile) {
      // Если профиль не существует, создаем его
      await this.prisma.moderatorProfile.create({
        data: {
          userId,
          firstName: 'Модератор',
          lastName: 'Контента',
          position: 'Модератор',
          department: 'Модерация',
          avatarId
        }
      });
    } else {
      // Если профиль существует, обновляем аватар
      await this.prisma.moderatorProfile.update({
        where: { userId },
        data: { avatarId }
      });
    }
  }

  async clearAvatarId(userId: string): Promise<void> {
    // Проверяем, существует ли профиль модератора
    const existingProfile = await this.prisma.moderatorProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      // Если профиль существует, очищаем аватар
      await this.prisma.moderatorProfile.update({
        where: { userId },
        data: { avatarId: null }
      });
    }
    // Если профиль не существует, ничего не делаем
  }
}
