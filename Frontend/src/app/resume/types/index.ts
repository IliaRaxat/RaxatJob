export interface Resume {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreateResumeDto {
  title: string;
}
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
}
export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}
export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}
export interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
export interface MonthYearSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
export interface HeroSectionProps {
  onLoadResume: () => void;
  onShowPreview: () => void;
  showPreview: boolean;
}
export interface PersonalInfoSectionProps {
  personalInfo: PersonalInfo;
  setPersonalInfo: (info: PersonalInfo) => void;
}
export interface ExperienceSectionProps {
  experiences: Experience[];
  setExperiences: (experiences: Experience[]) => void;
}
export interface EducationSectionProps {
  education: Education[];
  setEducation: (education: Education[]) => void;
}
export interface SkillsSectionProps {
  skills: Skill[];
  setSkills: (skills: Skill[]) => void;
}
export interface ResumePreviewProps {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  showPreview: boolean;
}
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
