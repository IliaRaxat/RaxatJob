import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUniversityProfileDto, UpdateUniversityProfileDto, UpdateProfileDto } from '../../../dto/user.dto';
import { ProfileStrategy } from './profile-strategy.interface';
import { USER_SELECT_BASIC, UNIVERSITY_PROFILE_INCLUDE } from '../../../shared/constants/prisma-fragments';
import { filterUndefinedFields, buildProfileUpdateData } from '../../../shared/utils/data.utils';

@Injectable()
export class UniversityProfileStrategy implements ProfileStrategy {
  constructor(private prisma: PrismaService) {}

  async createProfile(createUniversityProfileDto: CreateUniversityProfileDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'UNIVERSITY') {
      throw new ForbiddenException('Only UNIVERSITY users can create university profiles');
    }

    const existingProfile = await this.prisma.universityProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException('University profile already exists');
    }

    return this.prisma.universityProfile.create({
      data: {
        ...createUniversityProfileDto,
        userId,
      },
      include: UNIVERSITY_PROFILE_INCLUDE,
    });
  }

  async getProfile(userId: string) {
    let profile = await this.prisma.universityProfile.findUnique({
      where: { userId },
      include: UNIVERSITY_PROFILE_INCLUDE,
    });

    if (!profile) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role !== 'UNIVERSITY') {
        throw new ForbiddenException('Only UNIVERSITY users can have university profiles');
      }

      profile = await this.prisma.universityProfile.create({
        data: {
          name: '',
          address: '',
          userId,
        },
        include: UNIVERSITY_PROFILE_INCLUDE,
      });
    }

    return profile;
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, userId: string) {
    const profile = await this.prisma.universityProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      const universityData = buildProfileUpdateData(updateProfileDto, ['name', 'address', 'website']);
      const filteredData = filterUndefinedFields(universityData);

      return this.prisma.universityProfile.create({
        data: {
          name: filteredData.name || '',
          address: filteredData.address || '',
          phone: filteredData.phone,
          website: filteredData.website,
          logoId: filteredData.logoId,
          userId,
        },
        include: {
          user: {
            select: USER_SELECT_BASIC,
          },
          students: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              major: true,
            },
          },
        },
      });
    }

    const universityUpdateData = {
      name: updateProfileDto.name,
      address: updateProfileDto.address,
      phone: updateProfileDto.phone,
      website: updateProfileDto.website,
      logoId: updateProfileDto.logoId,
    };

    const filteredData = filterUndefinedFields(universityUpdateData);

    return this.prisma.universityProfile.update({
      where: { userId },
      data: filteredData,
      include: {
        user: {
          select: USER_SELECT_BASIC,
        },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            major: true,
          },
        },
      },
    });
  }

  async getAvatarId(userId: string): Promise<string | null> {
    const profile = await this.prisma.universityProfile.findUnique({
      where: { userId },
      select: { logoId: true }
    });
    return profile?.logoId || null;
  }

  async updateAvatarId(userId: string, avatarId: string): Promise<void> {
    await this.prisma.universityProfile.update({
      where: { userId },
      data: { logoId: avatarId }
    });
  }

  async clearAvatarId(userId: string): Promise<void> {
    await this.prisma.universityProfile.update({
      where: { userId },
      data: { logoId: null }
    });
  }
}
