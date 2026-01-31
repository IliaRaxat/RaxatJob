import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperienceDto, UpdateExperienceDto } from '../../dto/experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(private prisma: PrismaService) {}

  async create(createExperienceDto: CreateExperienceDto, userId: string) {
    // Получаем профиль кандидата
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!candidateProfile) {
      throw new NotFoundException('Профиль кандидата не найден');
    }

    return this.prisma.experience.create({
      data: {
        ...createExperienceDto,
        candidateId: candidateProfile.id,
      },
    });
  }

  async findAll(userId: string) {
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!candidateProfile) {
      throw new NotFoundException('Профиль кандидата не найден');
    }

    return this.prisma.experience.findMany({
      where: { candidateId: candidateProfile.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const experience = await this.prisma.experience.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!experience) {
      throw new NotFoundException('Опыт работы не найден');
    }

    if (experience.candidate.userId !== userId) {
      throw new ForbiddenException('У вас нет прав для просмотра этого опыта работы');
    }

    return experience;
  }

  async update(id: string, updateExperienceDto: UpdateExperienceDto, userId: string) {
    const experience = await this.findOne(id, userId);

    return this.prisma.experience.update({
      where: { id },
      data: updateExperienceDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.experience.delete({
      where: { id },
    });

    return { message: 'Опыт работы успешно удален' };
  }
}
