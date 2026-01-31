import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationDto, UpdateEducationDto } from '../../dto/education.dto';

@Injectable()
export class EducationsService {
  constructor(private prisma: PrismaService) {}

  async create(createEducationDto: CreateEducationDto, userId: string) {
    // Получаем профиль кандидата
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!candidateProfile) {
      throw new NotFoundException('Профиль кандидата не найден');
    }

    return this.prisma.education.create({
      data: {
        ...createEducationDto,
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

    return this.prisma.education.findMany({
      where: { candidateId: candidateProfile.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const education = await this.prisma.education.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            userId: true,
          },
        },
        university: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!education) {
      throw new NotFoundException('Образование не найдено');
    }

    if (education.candidate?.userId !== userId) {
      throw new ForbiddenException('У вас нет прав для просмотра этого образования');
    }

    return education;
  }

  async update(id: string, updateEducationDto: UpdateEducationDto, userId: string) {
    const education = await this.findOne(id, userId);

    return this.prisma.education.update({
      where: { id },
      data: updateEducationDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.education.delete({
      where: { id },
    });

    return { message: 'Образование успешно удалено' };
  }
}
