import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHRProfileDto, UpdateHRProfileDto, UpdateProfileDto } from '../../../dto/user.dto';
import { ProfileStrategy } from './profile-strategy.interface';
import { USER_SELECT_BASIC, HR_PROFILE_INCLUDE } from '../../../shared/constants/prisma-fragments';
import { filterUndefinedFields, buildProfileUpdateData } from '../../../shared/utils/data.utils';

@Injectable()
export class HRProfileStrategy implements ProfileStrategy {
  constructor(private prisma: PrismaService) {}

  async createProfile(createHRProfileDto: CreateHRProfileDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'HR') {
      throw new ForbiddenException('Only HR users can create HR profiles');
    }

    const existingProfile = await this.prisma.hRProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException('HR profile already exists');
    }

    return this.prisma.hRProfile.create({
      data: {
        ...createHRProfileDto,
        userId,
      },
      include: HR_PROFILE_INCLUDE,
    });
  }

  async getProfile(userId: string) {
    let profile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      include: HR_PROFILE_INCLUDE,
    });

    if (!profile) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role !== 'HR') {
        throw new ForbiddenException('Only HR users can have HR profiles');
      }

      profile = await this.prisma.hRProfile.create({
        data: {
          firstName: '',
          lastName: '',
          company: '',
          position: '',
          userId,
        },
        include: HR_PROFILE_INCLUDE,
      });
    }

    return profile;
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, userId: string) {
    const profile = await this.prisma.hRProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      const hrData = buildProfileUpdateData(updateProfileDto, ['firstName', 'lastName', 'company', 'position']);
      const filteredData = filterUndefinedFields(hrData);

      return this.prisma.hRProfile.create({
        data: {
          firstName: filteredData.firstName || '',
          lastName: filteredData.lastName || '',
          company: filteredData.company || '',
          position: filteredData.position || '',
          phone: filteredData.phone,
          avatarId: filteredData.avatarId,
          userId,
        },
        include: {
          user: {
            select: USER_SELECT_BASIC,
          },
        },
      });
    }

    const hrUpdateData = {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
      phone: updateProfileDto.phone,
      avatarId: updateProfileDto.avatarId,
      company: updateProfileDto.company,
      position: updateProfileDto.position,
    };

    const filteredData = filterUndefinedFields(hrUpdateData);

    return this.prisma.hRProfile.update({
      where: { userId },
      data: filteredData,
      include: {
        user: {
          select: USER_SELECT_BASIC,
        },
      },
    });
  }

  async getAvatarId(userId: string): Promise<string | null> {
    const profile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      select: { avatarId: true }
    });
    return profile?.avatarId || null;
  }

  async updateAvatarId(userId: string, avatarId: string): Promise<void> {
    await this.prisma.hRProfile.update({
      where: { userId },
      data: { avatarId }
    });
  }

  async clearAvatarId(userId: string): Promise<void> {
    await this.prisma.hRProfile.update({
      where: { userId },
      data: { avatarId: null }
    });
  }
}
