import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '../authErrorHandler';

// Типы для студентов
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  yearOfStudy: number;
  major: string;
  gpa?: number;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  universityId: string;
  university?: {
    id: string;
    name: string;
  };
  skills: StudentSkill[];
}

export interface StudentSkill {
  id: string;
  level: number;
  skillId: string;
  skill: {
    id: string;
    name: string;
    category: string;
    description?: string;
  };
}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  yearOfStudy: number;
  major: string;
  gpa?: number;
  phone?: string;
}

export interface UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  studentId?: string;
  yearOfStudy?: number;
  major?: string;
  gpa?: number;
  phone?: string;
}

export interface StudentSearchParams {
  skillIds: string[];
  minLevel?: number;
  maxLevel?: number;
}

export interface StudentStats {
  totalStudents: number;
  studentsWithSkills: number;
  studentsWithoutSkills: number;
  topSkills: Array<{
    skillId: string;
    _count: {
      skillId: number;
    };
  }>;
}

export interface AddStudentSkillDto {
  skillId: string;
  level: number;
}

export interface UpdateStudentSkillDto {
  level: number;
}

// Базовый URL для API
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartmatch-three.vercel.app/';
  return backendUrl.replace(/\/$/, '');
};

export const studentsApi = createApi({
  reducerPath: 'studentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🎓 Students API request headers preparation');
        console.log('🍪 Credentials mode: include');
      }
      
      return headers;
    },
    credentials: 'include',
    fetchFn: async (input, init) => {
      const response = await fetch(input, {
        ...init,
        credentials: 'include',
      });
      
      // Обработка ошибок авторизации с контекстом
      if (!response.ok) {
        const errorText = await response.text();
        const url = typeof input === 'string' ? input : input.url;
        const context = determineErrorContext(errorText, url);
        
        handleAuthError(response.status, response, context);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Students API request to:', typeof input === 'string' ? input : input.url);
      }
      
      return response;
    },
  }),
  tagTypes: ['Student', 'StudentSkill', 'StudentStats'],
  endpoints: (builder) => ({
    // Создание студента
    createStudent: builder.mutation<Student, CreateStudentDto>({
      query: (studentData) => {
        // Проверяем роль из localStorage или cookie
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        
        // Для админов используем прямой endpoint без проверки университета
        if (isAdmin) {
          return {
            url: '/admin/students',
            method: 'POST',
            body: studentData,
          };
        }
        
        return {
          url: '/universities/students',
          method: 'POST',
          body: studentData,
        };
      },
      invalidatesTags: ['Student', 'StudentStats'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Student created:', data);
        } catch (err) {
          console.error('❌ Failed to create student:', err);
        }
      },
    }),

    // Получение списка студентов (для админов - все студенты, для университетов - только свои)
    getStudents: builder.query<Student[], void>({
      query: () => {
        // Проверяем роль из localStorage или cookie
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        
        // Для админов используем прямой endpoint без проверки университета
        if (isAdmin) {
          return '/admin/students';
        }
        
        return '/universities/students';
      },
      providesTags: ['Student'],
    }),

    // Получение конкретного студента (для админов - любой студент, для университетов - только свой)
    getStudent: builder.query<Student, string>({
      query: (id) => {
        // Проверяем роль из localStorage или cookie
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        
        // Для админов используем прямой endpoint без проверки университета
        if (isAdmin) {
          return `/admin/students/${id}`;
        }
        
        return `/universities/students/${id}`;
      },
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),

    // Обновление студента
    updateStudent: builder.mutation<Student, { id: string; data: UpdateStudentDto }>({
      query: ({ id, data }) => {
        // Проверяем роль из localStorage или cookie
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        
        // Для админов используем прямой endpoint без проверки университета
        if (isAdmin) {
          return {
            url: `/admin/students/${id}`,
            method: 'PATCH',
            body: data,
          };
        }
        
        return {
          url: `/universities/students/${id}`,
          method: 'PATCH',
          body: data,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Student', id },
        'Student',
        'StudentStats'
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Student updated:', data);
        } catch (err) {
          console.error('❌ Failed to update student:', err);
        }
      },
    }),

    // Удаление студента
    deleteStudent: builder.mutation<{ message: string }, string>({
      query: (id) => {
        // Проверяем роль из localStorage или cookie
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        
        // Для админов используем прямой endpoint без проверки университета
        if (isAdmin) {
          return {
            url: `/admin/students/${id}`,
            method: 'DELETE',
          };
        }
        
        return {
          url: `/universities/students/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Student', 'StudentStats'],
      async onQueryStarted(studentId, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log('✅ Student deleted:', studentId);
        } catch (err) {
          console.error('❌ Failed to delete student:', err);
        }
      },
    }),

    // Поиск студентов по навыкам
    searchStudents: builder.query<Student[], StudentSearchParams>({
      query: ({ skillIds, minLevel, maxLevel }) => {
        const params = new URLSearchParams();
        params.append('skillIds', skillIds.join(','));
        
        if (minLevel !== undefined) {
          params.append('minLevel', minLevel.toString());
        }
        
        if (maxLevel !== undefined) {
          params.append('maxLevel', maxLevel.toString());
        }
        
        // Проверяем роль из localStorage или cookie
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        
        // Для админов используем прямой endpoint без проверки университета
        if (isAdmin) {
          return `/admin/students/search?${params.toString()}`;
        }
        
        return `/universities/students/search?${params.toString()}`;
      },
      providesTags: ['Student'],
    }),

    // Получение статистики студентов (для админов - общая статистика, для университетов - только свои)
    getStudentStats: builder.query<StudentStats, void>({
      query: () => {
        // Проверяем роль из localStorage или cookie
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        
        // Для админов используем прямой endpoint без проверки университета
        if (isAdmin) {
          return '/admin/students/stats';
        }
        
        return '/universities/students/stats';
      },
      providesTags: ['StudentStats'],
    }),

    // Добавление навыка студенту
    addStudentSkill: builder.mutation<StudentSkill, { studentId: string; data: AddStudentSkillDto }>({
      query: ({ studentId, data }) => ({
        url: `/skills/student/${studentId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: 'Student', id: studentId },
        'Student',
        'StudentSkill'
      ],
      async onQueryStarted({ studentId }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Skill added to student:', { studentId, skill: data });
        } catch (err) {
          console.error('❌ Failed to add skill to student:', err);
        }
      },
    }),

    // Получение навыков студента
    getStudentSkills: builder.query<StudentSkill[], string>({
      query: (studentId) => `/skills/student/${studentId}`,
      providesTags: (result, error, studentId) => [
        { type: 'StudentSkill', id: studentId }
      ],
    }),

    // Обновление навыка студента
    updateStudentSkill: builder.mutation<StudentSkill, { studentId: string; skillId: string; data: UpdateStudentSkillDto }>({
      query: ({ studentId, skillId, data }) => ({
        url: `/skills/student/${studentId}/${skillId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: 'Student', id: studentId },
        { type: 'StudentSkill', id: studentId },
        'Student'
      ],
    }),

    // Удаление навыка у студента
    removeStudentSkill: builder.mutation<{ message: string }, { studentId: string; skillId: string }>({
      query: ({ studentId, skillId }) => ({
        url: `/skills/student/${studentId}/${skillId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: 'Student', id: studentId },
        { type: 'StudentSkill', id: studentId },
        'Student'
      ],
    }),
  }),
});

export const {
  // Student CRUD operations
  useCreateStudentMutation,
  useGetStudentsQuery,
  useGetStudentQuery,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  
  // Student search and stats
  useSearchStudentsQuery,
  useLazySearchStudentsQuery,
  useGetStudentStatsQuery,
  
  // Student skills operations
  useAddStudentSkillMutation,
  useGetStudentSkillsQuery,
  useUpdateStudentSkillMutation,
  useRemoveStudentSkillMutation,
} = studentsApi;

// Вспомогательные функции для валидации
export const validateStudent = (student: CreateStudentDto): string[] => {
  const errors: string[] = [];
  
  if (!student.firstName?.trim()) {
    errors.push('Имя обязательно для заполнения');
  } else if (student.firstName.length > 50) {
    errors.push('Имя не должно превышать 50 символов');
  }
  
  if (!student.lastName?.trim()) {
    errors.push('Фамилия обязательна для заполнения');
  } else if (student.lastName.length > 50) {
    errors.push('Фамилия не должна превышать 50 символов');
  }
  
  if (!student.email?.trim()) {
    errors.push('Email обязателен для заполнения');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    errors.push('Введите корректный email адрес');
  }
  
  if (!student.studentId?.trim()) {
    errors.push('Номер студенческого билета обязателен');
  }
  
  if (!student.yearOfStudy || student.yearOfStudy < 1 || student.yearOfStudy > 6) {
    errors.push('Курс должен быть от 1 до 6');
  }
  
  if (!student.major?.trim()) {
    errors.push('Специальность обязательна для заполнения');
  } else if (student.major.length > 100) {
    errors.push('Специальность не должна превышать 100 символов');
  }
  
  if (student.gpa !== undefined && (student.gpa < 0 || student.gpa > 5)) {
    errors.push('Средний балл должен быть от 0 до 5');
  }
  
  if (student.phone && !/^\+?[\d\s\-\(\)]+$/.test(student.phone)) {
    errors.push('Введите корректный номер телефона');
  }
  
  return errors;
};

// Утилиты для работы со студентами
export const getStudentFullName = (student: Student): string => {
  return `${student.firstName} ${student.lastName}`;
};

export const getStudentYear = (yearOfStudy: number): string => {
  const yearNames = ['', '1-й курс', '2-й курс', '3-й курс', '4-й курс', '5-й курс', '6-й курс'];
  return yearNames[yearOfStudy] || `${yearOfStudy}-й курс`;
};

export const formatGPA = (gpa?: number): string => {
  if (gpa === undefined) return 'Не указан';
  return gpa.toFixed(2);
};

export const getSkillLevelText = (level: number): string => {
  const levelTexts = ['', 'Начальный', 'Базовый', 'Средний', 'Продвинутый', 'Экспертный'];
  return levelTexts[level] || 'Неизвестный';
};
