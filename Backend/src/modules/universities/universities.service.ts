import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from '../../dto/student.dto';

@Injectable()
export class UniversitiesService {
  constructor(private prisma: PrismaService) {}

  // Получение ID профиля университета по ID пользователя
  private async getUniversityProfileId(userId: string): Promise<string> {
    const universityProfile = await this.prisma.universityProfile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!universityProfile) {
      throw new NotFoundException('Профиль университета не найден');
    }

    return universityProfile.id;
  }

  // Студенты
  async createStudent(createStudentDto: CreateStudentDto, userId: string) {
    const universityId = await this.getUniversityProfileId(userId);
    return this.prisma.student.create({
      data: {
        ...createStudentDto,
        universityId,
      },
    });
  }

  async findAllStudents(userId: string) {
    const universityId = await this.getUniversityProfileId(userId);
    return this.prisma.student.findMany({
      where: { universityId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async findStudent(id: string, userId: string) {
    const universityId = await this.getUniversityProfileId(userId);
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        university: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Студент не найден');
    }

    if (student.universityId !== universityId) {
      throw new ForbiddenException('У вас нет прав для просмотра этого студента');
    }

    return student;
  }

  async updateStudent(id: string, updateStudentDto: UpdateStudentDto, userId: string) {
    await this.findStudent(id, userId);

    return this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  async removeStudent(id: string, userId: string) {
    await this.findStudent(id, userId);

    await this.prisma.student.delete({
      where: { id },
    });

    return { message: 'Студент успешно удален' };
  }

  // Поиск студентов по навыкам
  async findStudentsBySkills(userId: string, skillIds: string[]) {
    const universityId = await this.getUniversityProfileId(userId);
    return this.prisma.student.findMany({
      where: {
        universityId,
        skills: {
          some: {
            skillId: {
              in: skillIds,
            },
          },
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  // Статистика по студентам
  async getStudentStats(userId: string) {
    const universityId = await this.getUniversityProfileId(userId);
    const [totalStudents, studentsWithSkills, topSkills] = await Promise.all([
      this.prisma.student.count({
        where: { universityId },
      }),
      this.prisma.student.count({
        where: {
          universityId,
          skills: {
            some: {},
          },
        },
      }),
      this.prisma.studentSkill.groupBy({
        by: ['skillId'],
        where: {
          student: {
            universityId,
          },
        },
        _count: {
          skillId: true,
        },
        orderBy: {
          _count: {
            skillId: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      totalStudents,
      studentsWithSkills,
      studentsWithoutSkills: totalStudents - studentsWithSkills,
      topSkills,
    };
  }
}
