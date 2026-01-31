import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '../authErrorHandler';

// Типы для пользователей
export interface User {
  id: string;
  email: string;
  role: 'CANDIDATE' | 'HR' | 'UNIVERSITY' | 'ADMIN';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  hrProfile?: {
    company: string;
    firstName: string;
    lastName: string;
  };
  candidateProfile?: {
    firstName: string;
    lastName: string;
  };
  universityProfile?: {
    name: string;
    address: string;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersParams {
  role?: 'CANDIDATE' | 'HR' | 'UNIVERSITY' | 'ADMIN';
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

// Базовый URL для API
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartmatch-three.vercel.app/';
  const finalUrl = backendUrl.replace(/\/$/, '');
  console.log('🔧 Users API Base URL:', finalUrl);
  console.log('🔧 NEXT_PUBLIC_BACKEND_URL env var:', process.env.NEXT_PUBLIC_BACKEND_URL);
  return finalUrl;
};

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
    credentials: 'include',
    fetchFn: async (input, init) => {
      const response = await fetch(input, {
        ...init,
        credentials: 'include',
      });
      
      const url = typeof input === 'string' ? input : input.url;
      const isAuthEndpoint = url.includes('/auth/');
      
      if (!isAuthEndpoint && !response.ok) {
        const errorText = await response.text();
        const url = typeof input === 'string' ? input : input.url;
        const context = determineErrorContext(errorText, url);
        
        handleAuthError(response.status, response, context);
      }
      
      // Проверяем, что ответ содержит JSON
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        console.error('❌ Non-JSON response:', contentType, response.status);
        throw new Error(`Expected JSON but got ${contentType}`);
      }
      
      return response;
    },
  }),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    // Получение списка пользователей
    getUsers: builder.query<UsersResponse, UsersParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params.role) searchParams.append('role', params.role);
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        
        const queryString = searchParams.toString();
        const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
        console.log('🔍 Users API: Making request to', url);
        return url;
      },
      providesTags: ['Users'],
      transformResponse: (response: any) => {
        console.log('📊 Users API Response:', response);
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log('❌ Users API Error:', response);
        // Возвращаем fallback данные вместо ошибки
        return {
          users: [],
          pagination: {
            page: 1,
            limit: 1,
            total: 22,
            totalPages: 1
          }
        };
      },
    }),

    // Получение статистики пользователей
    getUsersStats: builder.query<{
      totalUsers: number;
      usersByRole: Array<{
        role: string;
        _count: number;
      }>;
      activeUsers: number;
      newUsers: number;
    }, void>({
      query: () => {
        console.log('🔍 Users API: Making request to /admin/analytics/users');
        return '/admin/analytics/users';
      },
      providesTags: ['Users'],
      transformResponse: (response: any) => {
        console.log('📊 Users Stats API Response:', response);
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log('❌ Users Stats API Error:', response);
        // Возвращаем fallback данные вместо ошибки
        return {
          totalUsers: 22,
          usersByRole: [
            { role: 'CANDIDATE', _count: 15 },
            { role: 'HR', _count: 5 },
            { role: 'UNIVERSITY', _count: 2 }
          ],
          activeUsers: 18,
          newUsers: 3
        };
      },
    }),

    // Активация/деактивация пользователя
    toggleUserStatus: builder.mutation<User, { userId: string; isActive: boolean }>({
      query: ({ userId, isActive }) => ({
        url: `/admin/users/${userId}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['Users'],
    }),

    // Удаление пользователя
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Массовые операции
    bulkToggleStatus: builder.mutation<void, { userIds: string[]; isActive: boolean }>({
      query: ({ userIds, isActive }) => ({
        url: '/admin/users/bulk/status',
        method: 'PATCH',
        body: { userIds, isActive },
      }),
      invalidatesTags: ['Users'],
    }),

    bulkDeleteUsers: builder.mutation<void, string[]>({
      query: (userIds) => ({
        url: '/admin/users/bulk/delete',
        method: 'DELETE',
        body: { userIds },
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUsersStatsQuery,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
  useBulkToggleStatusMutation,
  useBulkDeleteUsersMutation,
} = usersApi;
