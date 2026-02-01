import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '@/shared/lib/authErrorHandler';
import type {
  Student,
  StudentSkill,
  CreateStudentDto,
  UpdateStudentDto,
  StudentSearchParams,
  StudentStats,
  AddStudentSkillDto,
  UpdateStudentSkillDto
} from '../model/types';
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
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
      }
      return headers;
    },
    credentials: 'include',
    fetchFn: async (input, init) => {
      const response = await fetch(input, {
        ...init,
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        const url = typeof input === 'string' ? input : input.url;
        const context = determineErrorContext(errorText, url);
        handleAuthError(response.status, response, context);
      }
      if (process.env.NODE_ENV === 'development') {
      }
      return response;
    },
  }),
  tagTypes: ['Student', 'StudentSkill', 'StudentStats'],
  endpoints: (builder) => ({
    createStudent: builder.mutation<Student, CreateStudentDto>({
      query: (studentData) => {
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
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
        } catch (err) {
        }
      },
    }),
    getStudents: builder.query<Student[], void>({
      query: () => {
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        if (isAdmin) {
          return '/admin/students';
        }
        return '/universities/students';
      },
      providesTags: ['Student'],
    }),
    getStudent: builder.query<Student, string>({
      query: (id) => {
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        if (isAdmin) {
          return `/admin/students/${id}`;
        }
        return `/universities/students/${id}`;
      },
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),
    updateStudent: builder.mutation<Student, { id: string; data: UpdateStudentDto }>({
      query: ({ id, data }) => {
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
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
        } catch (err) {
        }
      },
    }),
    deleteStudent: builder.mutation<{ message: string }, string>({
      query: (id) => {
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
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
        } catch (err) {
        }
      },
    }),
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
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        if (isAdmin) {
          return `/admin/students/search?${params.toString()}`;
        }
        return `/universities/students/search?${params.toString()}`;
      },
      providesTags: ['Student'],
    }),
    getStudentStats: builder.query<StudentStats, void>({
      query: () => {
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
        if (isAdmin) {
          return '/admin/students/stats';
        }
        return '/universities/students/stats';
      },
      providesTags: ['StudentStats'],
    }),
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
        } catch (err) {
        }
      },
    }),
    getStudentSkills: builder.query<StudentSkill[], string>({
      query: (studentId) => `/skills/student/${studentId}`,
      providesTags: (result, error, studentId) => [
        { type: 'StudentSkill', id: studentId }
      ],
    }),
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
  useCreateStudentMutation,
  useGetStudentsQuery,
  useGetStudentQuery,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useSearchStudentsQuery,
  useLazySearchStudentsQuery,
  useGetStudentStatsQuery,
  useAddStudentSkillMutation,
  useGetStudentSkillsQuery,
  useUpdateStudentSkillMutation,
  useRemoveStudentSkillMutation,
} = studentsApi;
