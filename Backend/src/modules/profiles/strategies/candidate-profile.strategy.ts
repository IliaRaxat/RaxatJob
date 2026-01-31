import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCandidateProfileDto, UpdateCandidateProfileDto, UpdateProfileDto } from '../../../dto/user.dto';
import { ProfileStrategy } from './profile-strategy.interface';
import { USER_SELECT_BASIC, CANDIDATE_PROFILE_INCLUDE } from '../../../shared/constants/prisma-fragments';
import { filterUndefinedFields, buildProfileUpdateData, safeCast } from '../../../shared/utils/data.utils';

@Injectable()
export class CandidateProfileStrategy implements ProfileStrategy {
  constructor(private prisma: PrismaService) {}

  async createProfile(createCandidateProfileDto: CreateCandidateProfileDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'CANDIDATE') {
      throw new ForbiddenException('Only CANDIDATE users can create candidate profiles');
    }

    const existingProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException('Candidate profile already exists');
    }

    return this.prisma.candidateProfile.create({
      data: {
        ...createCandidateProfileDto,
        userId,
      },
      include: CANDIDATE_PROFILE_INCLUDE,
    });
  }

  async getProfile(userId: string) {
    let profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: CANDIDATE_PROFILE_INCLUDE,
    });

    if (!profile) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role !== 'CANDIDATE') {
        throw new ForbiddenException('Only CANDIDATE users can have candidate profiles');
      }

      profile = await this.prisma.candidateProfile.create({
        data: {
          firstName: '',
          lastName: '',
          isAvailable: true,
          userId,
        },
        include: CANDIDATE_PROFILE_INCLUDE,
      });
    }

    return profile;
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      const candidateData = buildProfileUpdateData(updateProfileDto, [
        'firstName', 'lastName', 'dateOfBirth', 'location', 'bio', 
        'linkedinUrl', 'githubUrl', 'portfolioUrl', 'isAvailable', 'expectedSalary'
      ]);
      const filteredData = filterUndefinedFields(candidateData);

      return this.prisma.candidateProfile.create({
        data: {
          firstName: filteredData.firstName || '',
          lastName: filteredData.lastName || '',
          phone: filteredData.phone,
          avatarId: filteredData.avatarId,
          dateOfBirth: safeCast(filteredData.dateOfBirth, 'date'),
          location: filteredData.location,
          bio: filteredData.bio,
          // resumeId удален - используйте структурированные резюме
          linkedinUrl: filteredData.linkedinUrl,
          githubUrl: filteredData.githubUrl,
          portfolioUrl: filteredData.portfolioUrl,
          isAvailable: filteredData.isAvailable ?? true,
          expectedSalary: filteredData.expectedSalary,
          userId,
        },
        include: {
          user: {
            select: USER_SELECT_BASIC,
          },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });
    }

    const candidateUpdateData = {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
      phone: updateProfileDto.phone,
      avatarId: updateProfileDto.avatarId,
      dateOfBirth: updateProfileDto.dateOfBirth,
      location: updateProfileDto.location,
      bio: updateProfileDto.bio,
      // resumeId удален - используйте структурированные резюме
      linkedinUrl: updateProfileDto.linkedinUrl,
      githubUrl: updateProfileDto.githubUrl,
      portfolioUrl: updateProfileDto.portfolioUrl,
      isAvailable: updateProfileDto.isAvailable,
      expectedSalary: updateProfileDto.expectedSalary,
    };

    const filteredData = filterUndefinedFields(candidateUpdateData);

    return this.prisma.candidateProfile.update({
      where: { userId },
      data: {
        firstName: filteredData.firstName,
        lastName: filteredData.lastName,
        phone: filteredData.phone,
        avatarId: filteredData.avatarId,
        dateOfBirth: safeCast(filteredData.dateOfBirth, 'date'),
        location: filteredData.location,
        bio: filteredData.bio,
        // resumeId удален - используйте структурированные резюме
        linkedinUrl: filteredData.linkedinUrl,
        githubUrl: filteredData.githubUrl,
        portfolioUrl: filteredData.portfolioUrl,
        isAvailable: filteredData.isAvailable,
        expectedSalary: filteredData.expectedSalary,
      },
      include: {
        user: {
          select: USER_SELECT_BASIC,
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  async getAvatarId(userId: string): Promise<string | null> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      select: { avatarId: true }
    });
    return profile?.avatarId || null;
  }

  async updateAvatarId(userId: string, avatarId: string): Promise<void> {
    await this.prisma.candidateProfile.update({
      where: { userId },
      data: { avatarId }
    });
  }

  async clearAvatarId(userId: string): Promise<void> {
    await this.prisma.candidateProfile.update({
      where: { userId },
      data: { avatarId: null }
    });
  }
}
