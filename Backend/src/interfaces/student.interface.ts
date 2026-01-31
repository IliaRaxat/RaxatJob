export interface IStudent {
  id: string;
  universityId: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  yearOfStudy: number;
  major: string;
  gpa?: number;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentWithSkills extends IStudent {
  skills: IStudentSkill[];
  university: {
    id: string;
    name: string;
  };
}

export interface IStudentSkill {
  id: string;
  studentId: string;
  skillId: string;
  level: number;
  skill: {
    id: string;
    name: string;
    category?: string;
  };
}
