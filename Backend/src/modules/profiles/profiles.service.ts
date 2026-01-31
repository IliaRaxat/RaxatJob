import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHRProfileDto, UpdateHRProfileDto, CreateCandidateProfileDto, UpdateCandidateProfileDto, CreateUniversityProfileDto, UpdateUniversityProfileDto, UpdateProfileDto } from '../../dto/user.dto';
import { StorageService } from '../storage/storage.service';
import { Response } from 'express';
import { HRProfileStrategy } from './strategies/hr-profile.strategy';
import { CandidateProfileStrategy } from './strategies/candidate-profile.strategy';
import { UniversityProfileStrategy } from './strategies/university-profile.strategy';
import { AdminProfileStrategy } from './strategies/admin-profile.strategy';
import { ModeratorProfileStrategy } from './strategies/moderator-profile.strategy';
import { ProfileStrategy } from './strategies/profile-strategy.interface';

@Injectable()
export class ProfilesService {
  private profileStrategies: Map<string, ProfileStrategy>;

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private hrStrategy: HRProfileStrategy,
    private candidateStrategy: CandidateProfileStrategy,
    private universityStrategy: UniversityProfileStrategy,
    private adminStrategy: AdminProfileStrategy,
    private moderatorStrategy: ModeratorProfileStrategy,
  ) {
    this.profileStrategies = new Map<string, ProfileStrategy>([
      ['HR', this.hrStrategy as ProfileStrategy],
      ['CANDIDATE', this.candidateStrategy as ProfileStrategy],
      ['UNIVERSITY', this.universityStrategy as ProfileStrategy],
      ['ADMIN', this.adminStrategy as ProfileStrategy],
      ['MODERATOR', this.moderatorStrategy as ProfileStrategy],
    ]);
  }

  async createHRProfile(createHRProfileDto: CreateHRProfileDto, userId: string) {
    // Проверяем, что пользователь имеет роль HR
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'HR') {
      throw new ForbiddenException('Только пользователи с ролью HR могут создавать HR профиль');
    }

    // Проверяем, не существует ли уже профиль
    const existingProfile = await this.prisma.hRProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException('HR профиль уже существует');
    }

    return this.prisma.hRProfile.create({
      data: {
        ...createHRProfileDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getHRProfile(userId: string) {
    let profile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        jobs: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Если профиль не существует, создаем его автоматически
    if (!profile) {
      // Проверяем, что пользователь имеет роль HR
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role !== 'HR') {
        throw new ForbiddenException('Только пользователи с ролью HR могут иметь HR профиль');
      }

      // Создаем профиль с пустыми значениями
      profile = await this.prisma.hRProfile.create({
        data: {
          firstName: '',
          lastName: '',
          company: '',
          position: '',
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          jobs: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });
    }

    // Добавляем URL аватарки к профилю
    const avatarUrl = await this.getAvatarUrlForProfile(profile.avatarId);
    
    return {
      ...profile,
      avatarUrl
    };
  }

  async updateHRProfile(updateHRProfileDto: UpdateHRProfileDto, userId: string) {
    const profile = await this.prisma.hRProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException('HR профиль не найден');
    }

    return this.prisma.hRProfile.update({
      where: { userId },
      data: updateHRProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async createCandidateProfile(createCandidateProfileDto: CreateCandidateProfileDto, userId: string) {
    // Проверяем, что пользователь имеет роль CANDIDATE
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'CANDIDATE') {
      throw new ForbiddenException('Только пользователи с ролью CANDIDATE могут создавать профиль кандидата');
    }

    // Проверяем, не существует ли уже профиль
    const existingProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException('Профиль кандидата уже существует');
    }

    return this.prisma.candidateProfile.create({
      data: {
        ...createCandidateProfileDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        experiences: true,
        educations: true,
      },
    });
  }

  async getCandidateProfile(userId: string) {
    let profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        experiences: {
          orderBy: { startDate: 'desc' },
        },
        educations: {
          orderBy: { startDate: 'desc' },
        },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                status: true,
                hr: {
                  select: {
                    company: true,
                  },
                },
              },
            },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });

    // Если профиль не существует, создаем его автоматически
    if (!profile) {
      // Проверяем, что пользователь имеет роль CANDIDATE
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role !== 'CANDIDATE') {
        throw new ForbiddenException('Только пользователи с ролью CANDIDATE могут иметь профиль кандидата');
      }

      // Создаем профиль с пустыми значениями
      profile = await this.prisma.candidateProfile.create({
        data: {
          firstName: '',
          lastName: '',
          isAvailable: true,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          experiences: {
            orderBy: { startDate: 'desc' },
          },
          educations: {
            orderBy: { startDate: 'desc' },
          },
          applications: {
            include: {
              job: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  hr: {
                    select: {
                      company: true,
                    },
                  },
                },
              },
            },
            orderBy: { appliedAt: 'desc' },
          },
        },
      });
    }

    // Добавляем URL аватарки к профилю
    const avatarUrl = await this.getAvatarUrlForProfile(profile.avatarId);
    
    return {
      ...profile,
      avatarUrl
    };
  }

  async updateCandidateProfile(updateCandidateProfileDto: UpdateCandidateProfileDto, userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException('Профиль кандидата не найден');
    }

    return this.prisma.candidateProfile.update({
      where: { userId },
      data: updateCandidateProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  async createUniversityProfile(createUniversityProfileDto: CreateUniversityProfileDto, userId: string) {
    // Проверяем, что пользователь имеет роль UNIVERSITY
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'UNIVERSITY') {
      throw new ForbiddenException('Только пользователи с ролью UNIVERSITY могут создавать профиль университета');
    }

    // Проверяем, не существует ли уже профиль
    const existingProfile = await this.prisma.universityProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException('Профиль университета уже существует');
    }

    return this.prisma.universityProfile.create({
      data: {
        ...createUniversityProfileDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
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

  async getUniversityProfile(userId: string) {
    let profile = await this.prisma.universityProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        students: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
          orderBy: { lastName: 'asc' },
        },
        educations: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    // Если профиль не существует, создаем его автоматически
    if (!profile) {
      // Проверяем, что пользователь имеет роль UNIVERSITY
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role !== 'UNIVERSITY') {
        throw new ForbiddenException('Только пользователи с ролью UNIVERSITY могут иметь профиль университета');
      }

      // Создаем профиль с пустыми значениями
      profile = await this.prisma.universityProfile.create({
        data: {
          name: '',
          address: '',
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          students: {
            include: {
              skills: {
                include: {
                  skill: true,
                },
              },
            },
            orderBy: { lastName: 'asc' },
          },
          educations: {
            orderBy: { startDate: 'desc' },
          },
        },
      });
    }

    // Добавляем URL логотипа к профилю (для университетов используется logoId)
    const avatarUrl = await this.getAvatarUrlForProfile(profile.logoId);
    
    return {
      ...profile,
      avatarUrl
    };
  }

  async updateUniversityProfile(updateUniversityProfileDto: UpdateUniversityProfileDto, userId: string) {
    const profile = await this.prisma.universityProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException('Профиль университета не найден');
    }

    return this.prisma.universityProfile.update({
      where: { userId },
      data: updateUniversityProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
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

  async updateProfile(updateProfileDto: UpdateProfileDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const strategy = this.profileStrategies.get(user.role);
    if (!strategy) {
      throw new ForbiddenException('Unsupported user role');
    }

    return strategy.updateProfile(updateProfileDto, userId);
  }

  private async getAvatarUrlForProfile(avatarId: string | null | undefined): Promise<string | null> {
    if (!avatarId) {
      return null;
    }

    try {
      // Получаем информацию о файле из MediaFile
      const mediaFile = await this.prisma.mediaFile.findUnique({
        where: { id: avatarId }
      });

      if (!mediaFile) {
        return null;
      }

      const presignedUrl = await this.storageService.getPresignedUrl(mediaFile.fileName, 7 * 24 * 3600); // 7 дней
      return presignedUrl;
    } catch (error) {
      return null;
    }
  }

  async uploadAvatar(file: Express.Multer.File, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { fileName, presignedUrl } = await this.storageService.uploadFile(file, 'avatars');

    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        originalName: file.originalname,
        fileName: fileName,
        mimeType: file.mimetype,
        size: file.size,
        url: presignedUrl,
        bucket: 'avatars',
        objectName: fileName,
        type: 'IMAGE',
        status: 'READY',
        uploadedBy: userId,
        metadata: {
          uploadedVia: 'avatar_upload',
          profileType: user.role
        }
      }
    });

    const strategy = this.profileStrategies.get(user.role);
    if (strategy) {
      await strategy.updateAvatarId(userId, mediaFile.id);
    }

    return {
      success: true,
      fileName,
      avatarUrl: presignedUrl,
      mediaFileId: mediaFile.id,
      message: 'Avatar uploaded successfully'
    };
  }

  async getAvatar(userId: string, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const strategy = this.profileStrategies.get(user.role);
    if (!strategy) {
      throw new NotFoundException('Avatar not found');
    }

    const avatarId = await strategy.getAvatarId(userId);
    if (!avatarId) {
      throw new NotFoundException('Avatar not found');
    }

    try {
      const mediaFile = await this.prisma.mediaFile.findUnique({
        where: { id: avatarId }
      });

      if (!mediaFile) {
        throw new NotFoundException('File not found in database');
      }

      const fileBuffer = await this.storageService.downloadFile(mediaFile.fileName);
      
      res.set({
        'Content-Type': mediaFile.mimeType || 'application/octet-stream',
        'Content-Length': mediaFile.size.toString(),
        'Content-Disposition': `inline; filename="${mediaFile.originalName}"`,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async getAvatarUrl(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const strategy = this.profileStrategies.get(user.role);
    if (!strategy) {
      return {
        success: false,
        message: 'Avatar not found'
      };
    }

    const avatarId = await strategy.getAvatarId(userId);
    if (!avatarId) {
      return {
        success: false,
        message: 'Avatar not found'
      };
    }

    try {
      const mediaFile = await this.prisma.mediaFile.findUnique({
        where: { id: avatarId }
      });

      if (!mediaFile) {
        return {
          success: false,
          message: 'File not found in database'
        };
      }

      const presignedUrl = await this.storageService.getPresignedUrl(mediaFile.fileName, 7 * 24 * 3600);
      return {
        success: true,
        avatarUrl: presignedUrl,
        fileName: mediaFile.fileName,
        originalName: mediaFile.originalName
      };
    } catch (error) {
      throw new NotFoundException('Failed to get avatar URL');
    }
  }

  async deleteAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const strategy = this.profileStrategies.get(user.role);
    if (!strategy) {
      throw new NotFoundException('Avatar not found');
    }

    const avatarId = await strategy.getAvatarId(userId);
    if (!avatarId) {
      throw new NotFoundException('Avatar not found');
    }

    try {
      const mediaFile = await this.prisma.mediaFile.findUnique({
        where: { id: avatarId }
      });

      if (!mediaFile) {
        throw new NotFoundException('File not found in database');
      }

      await this.storageService.deleteFile(mediaFile.fileName);
      await this.prisma.mediaFile.delete({
        where: { id: avatarId }
      });
      await strategy.clearAvatarId(userId);

      return {
        success: true,
        message: 'Avatar deleted successfully'
      };
    } catch (error) {
      throw new NotFoundException('Failed to delete avatar');
    }
  }

  async uploadResume(file: Express.Multer.File, userId: string) {
    // Этот метод устарел - используйте новую систему структурированных резюме
    throw new BadRequestException('File-based resumes are deprecated. Please use structured resumes API at /resumes');
  }

  async getResume(userId: string, res: Response) {
    // Этот метод устарел - используйте новую систему структурированных резюме
    throw new BadRequestException('File-based resumes are deprecated. Please use structured resumes API at /resumes');
  }

  async getResumeUrl(userId: string) {
    // Этот метод устарел - используйте новую систему структурированных резюме
    throw new BadRequestException('File-based resumes are deprecated. Please use structured resumes API at /resumes');
  }

  async deleteResume(userId: string) {
    // Этот метод устарел - используйте новую систему структурированных резюме
    throw new BadRequestException('File-based resumes are deprecated. Please use structured resumes API at /resumes');
  }

  // Admin Profile methods
  async getAdminProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN users can access admin profile');
    }

    const strategy = this.profileStrategies.get('ADMIN');
    if (!strategy) {
      throw new NotFoundException('Admin profile strategy not found');
    }

    return strategy.getProfile(userId);
  }

  // Moderator Profile methods
  async getModeratorProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'MODERATOR') {
      throw new ForbiddenException('Only MODERATOR users can access moderator profile');
    }

    const strategy = this.profileStrategies.get('MODERATOR');
    if (!strategy) {
      throw new NotFoundException('Moderator profile strategy not found');
    }

    return strategy.getProfile(userId);
  }
}
