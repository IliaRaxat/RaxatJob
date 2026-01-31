export interface ISkill {
  id: string;
  name: string;
  category?: string;
  description?: string;
  createdAt: Date;
}

export interface ICandidateSkill {
  id: string;
  candidateId: string;
  skillId: string;
  level: number;
  skill: ISkill;
}

export interface IStudentSkill {
  id: string;
  studentId: string;
  skillId: string;
  level: number;
  skill: ISkill;
}
