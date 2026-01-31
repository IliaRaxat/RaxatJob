import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto, UpdateSkillDto, AddCandidateSkillDto, UpdateCandidateSkillDto, AddStudentSkillDto, UpdateStudentSkillDto } from '../../dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async create(createSkillDto: CreateSkillDto) {
    // Check if skill with this name already exists
    const existingSkill = await this.prisma.skill.findUnique({
      where: { name: createSkillDto.name },
    });

    if (existingSkill) {
      return existingSkill;
    }

    // Create new skill if it doesn't exist
    return this.prisma.skill.create({
      data: createSkillDto,
    });
  }

  async findAll() {
    return this.prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }

    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto) {
    await this.findOne(id);

    // If updating name, check if another skill with this name exists
    if (updateSkillDto.name) {
      const existingSkill = await this.prisma.skill.findFirst({
        where: { 
          name: updateSkillDto.name,
          id: { not: id } // Exclude current skill
        },
      });

      if (existingSkill) {
        throw new Error('Навык с таким названием уже существует');
      }
    }

    return this.prisma.skill.update({
      where: { id },
      data: updateSkillDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.skill.delete({
      where: { id },
    });

    return { message: 'Навык успешно удален' };
  }

  // Навыки кандидата
  async addCandidateSkill(candidateId: string, addSkillDto: AddCandidateSkillDto) {
    const { skillId, level } = addSkillDto;

    return this.prisma.candidateSkill.upsert({
      where: {
        candidateId_skillId: {
          candidateId,
          skillId,
        },
      },
      update: { level },
      create: {
        candidateId,
        skillId,
        level,
      },
      include: {
        skill: true,
      },
    });
  }

  async updateCandidateSkill(candidateId: string, skillId: string, updateDto: UpdateCandidateSkillDto) {
    const candidateSkill = await this.prisma.candidateSkill.findUnique({
      where: {
        candidateId_skillId: {
          candidateId,
          skillId,
        },
      },
    });

    if (!candidateSkill) {
      throw new NotFoundException('Навык кандидата не найден');
    }

    return this.prisma.candidateSkill.update({
      where: {
        candidateId_skillId: {
          candidateId,
          skillId,
        },
      },
      data: updateDto,
      include: {
        skill: true,
      },
    });
  }

  async removeCandidateSkill(candidateId: string, skillId: string) {
    await this.prisma.candidateSkill.delete({
      where: {
        candidateId_skillId: {
          candidateId,
          skillId,
        },
      },
    });

    return { message: 'Навык кандидата успешно удален' };
  }

  async getCandidateSkills(candidateId: string) {
    return this.prisma.candidateSkill.findMany({
      where: { candidateId },
      include: {
        skill: true,
      },
    });
  }

  // Навыки студента
  async addStudentSkill(studentId: string, addSkillDto: AddStudentSkillDto) {
    const { skillId, level } = addSkillDto;

    return this.prisma.studentSkill.upsert({
      where: {
        studentId_skillId: {
          studentId,
          skillId,
        },
      },
      update: { level },
      create: {
        studentId,
        skillId,
        level,
      },
      include: {
        skill: true,
      },
    });
  }

  async updateStudentSkill(studentId: string, skillId: string, updateDto: UpdateStudentSkillDto) {
    const studentSkill = await this.prisma.studentSkill.findUnique({
      where: {
        studentId_skillId: {
          studentId,
          skillId,
        },
      },
    });

    if (!studentSkill) {
      throw new NotFoundException('Навык студента не найден');
    }

    return this.prisma.studentSkill.update({
      where: {
        studentId_skillId: {
          studentId,
          skillId,
        },
      },
      data: updateDto,
      include: {
        skill: true,
      },
    });
  }

  async removeStudentSkill(studentId: string, skillId: string) {
    await this.prisma.studentSkill.delete({
      where: {
        studentId_skillId: {
          studentId,
          skillId,
        },
      },
    });

    return { message: 'Навык студента успешно удален' };
  }

  async getStudentSkills(studentId: string) {
    return this.prisma.studentSkill.findMany({
      where: { studentId },
      include: {
        skill: true,
      },
    });
  }

  // Популярные навыки
  async getPopularSkills() {
    // Получаем статистику по навыкам из таблицы SkillAnalytics
    const skillAnalytics = await this.prisma.skillAnalytics.findMany({
      include: {
        skill: true,
      },
      orderBy: {
        demandScore: 'desc',
      },
      take: 20, // Топ 20 навыков
    });

    // Если нет данных в SkillAnalytics, считаем популярность по количеству упоминаний
    if (skillAnalytics.length === 0) {
      const skillsWithCounts = await this.prisma.skill.findMany({
        include: {
          _count: {
            select: {
              candidateSkills: true,
              studentSkills: true,
            },
          },
        },
        orderBy: [
          {
            candidateSkills: {
              _count: 'desc',
            },
          },
          {
            studentSkills: {
              _count: 'desc',
            },
          },
        ],
        take: 20,
      });

      return skillsWithCounts.map(skill => ({
        skill: {
          id: skill.id,
          name: skill.name,
          category: skill.category,
        },
        candidateCount: skill._count.candidateSkills,
        studentCount: skill._count.studentSkills,
        totalCount: skill._count.candidateSkills + skill._count.studentSkills,
      }));
    }

    // Возвращаем данные из SkillAnalytics
    return skillAnalytics.map(analytics => ({
      skill: {
        id: analytics.skill.id,
        name: analytics.skill.name,
        category: analytics.skill.category,
      },
      candidateCount: analytics.totalCandidates,
      studentCount: analytics.totalStudents,
      totalCount: analytics.totalCandidates + analytics.totalStudents,
      demandScore: analytics.demandScore,
    }));
  }
}
