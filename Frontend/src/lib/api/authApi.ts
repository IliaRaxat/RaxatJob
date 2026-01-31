import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '../authErrorHandler';

// Типы данных
export interface User {
  id: string;
  email: string;
  role: 'HR' | 'CANDIDATE' | 'UNIVERSITY' | 'ADMIN' | 'MODERATOR';
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'HR' | 'CANDIDATE' | 'UNIVERSITY';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Типы для профилей
export interface HRProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phone?: string;
  avatarUrl?: string;
  avatarId?: string;
  user: User;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  avatarId?: string;
  user: User;
}

export interface UniversityProfile {
  id: string;
  userId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  logoId?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  students: any[];
  educations: any[];
}

export interface AdminProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  phone?: string;
  avatarId?: string;
  permissions?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  avatar?: string;
}

// DTO типы для создания/обновления профилей
export interface CreateHRProfileDto {
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phone?: string;
  avatarUrl?: string;
  avatarId?: string;
}

export interface UpdateHRProfileDto {
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
  phone?: string;
  avatarUrl?: string;
  avatarId?: string;
}

export interface CreateCandidateProfileDto {
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  avatarId?: string;
}

export interface UpdateCandidateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  avatarId?: string;
}

export interface CreateUniversityProfileDto {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  logoId?: string;
}

export interface UpdateUniversityProfileDto {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  logoId?: string;
}

export interface CreateAdminProfileDto {
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  phone?: string;
  avatarId?: string;
  permissions?: string;
}

export interface UpdateAdminProfileDto {
  firstName?: string;
  lastName?: string;
  position?: string;
  department?: string;
  phone?: string;
  avatarId?: string;
  permissions?: string;
}

// Universal profile types
export type UniversalProfileDto = Partial<CreateHRProfileDto & CreateCandidateProfileDto & CreateUniversityProfileDto & CreateAdminProfileDto>;
export type UniversalUpdateDto = Partial<UpdateHRProfileDto & UpdateCandidateProfileDto & UpdateUniversityProfileDto & UpdateAdminProfileDto>;

// Базовый URL для API
const getBaseUrl = () => {
  // Используем внешний API
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartmatch-three.vercel.app/';
  // Убираем trailing slash если есть
  return backendUrl.replace(/\/$/, '');
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      // Устанавливаем базовые заголовки
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      // Токен теперь передается автоматически через httpOnly cookies
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 Request headers preparation (using httpOnly cookies for auth)');
        console.log('🍪 Credentials mode: include');
      }
      
      return headers;
    },
    credentials: 'include', // Важно для передачи cookies
    fetchFn: async (input, init) => {
      // Кастомная fetch функция для обеспечения передачи cookies
      const response = await fetch(input, {
        ...init,
        credentials: 'include', // Дублируем для уверенности
      });
      
      // Обработка ошибок авторизации только для критических ошибок
      // Не обрабатываем 401/403 для login/register endpoints, так как это нормально
      const url = typeof input === 'string' ? input : input.url;
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      
      if (!isAuthEndpoint && !response.ok) {
        const errorText = await response.text();
        const url = typeof input === 'string' ? input : input.url;
        const context = determineErrorContext(errorText, url);
        
        handleAuthError(response.status, response, context);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Fetch request to:', url);
        console.log('🍪 Request credentials:', init?.credentials || 'include');
        console.log('📊 Response status:', response.status);
      }
      
      return response;
    },
  }),
  tagTypes: ['User', 'HRProfile', 'CandidateProfile', 'UniversityProfile', 'AdminProfile'],
  endpoints: (builder) => ({
    // Регистрация
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          console.log('🎉 Registration successful, received data:', { user: data.user });
          
          // Сохраняем данные пользователя в localStorage (токен в httpOnly cookie)
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(data.user));
            console.log('💾 User data saved to localStorage');
            console.log('🍪 Auth token automatically saved in httpOnly cookie');
            
            // Уведомляем об обновлении данных через событие
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: data.user }));
          }
        } catch (err) {
          console.error('❌ Registration failed:', err);
        }
      },
    }),
    
    // Вход
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('🎉 Login successful, received data:', { user: data.user });
          
          // Сохраняем данные пользователя в localStorage (токен в httpOnly cookie)
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(data.user));
            console.log('💾 User data saved to localStorage');
            console.log('🍪 Auth token automatically saved in httpOnly cookie');
            
            // Уведомляем об обновлении данных через событие
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: data.user }));
          }
        } catch (err) {
          console.error('❌ Login failed:', err);
        }
      },
    }),
    
    // Выход
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // Удаляем данные из localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user_data');
            // Уведомляем об выходе через событие
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
          }
        } catch {
          // Даже если запрос не удался, очищаем локальные данные
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user_data');
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
          }
        }
      },
    }),
    
    // Получение текущего пользователя
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    // Universal Profile endpoints
    createProfile: builder.mutation<HRProfile | CandidateProfile | UniversityProfile | AdminProfile, UniversalProfileDto & { role: string }>({
      query: ({ role, ...data }) => ({
        url: `/profiles/${role.toLowerCase()}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['HRProfile', 'CandidateProfile', 'UniversityProfile', 'AdminProfile'],
    }),

    getProfile: builder.query<HRProfile | CandidateProfile | UniversityProfile | AdminProfile, { role: string }>({
      query: ({ role }) => `/profiles/${role.toLowerCase()}`,
      providesTags: ['HRProfile', 'CandidateProfile', 'UniversityProfile', 'AdminProfile'],
    }),

    updateProfile: builder.mutation<HRProfile | CandidateProfile | UniversityProfile | AdminProfile, UniversalUpdateDto>({
      query: (data) => ({
        url: '/profiles',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['HRProfile', 'CandidateProfile', 'UniversityProfile', 'AdminProfile'],
    }),

    // Avatar upload endpoint
    uploadAvatar: builder.mutation<{ 
        success: boolean;
        fileName: string;
        avatarUrl: string;
        mediaFileId: string;
        message: string;
    }, FormData>({
      // Используем кастомную fetch функцию для полного контроля
      queryFn: async (formData, { signal }) => {
        const response = await fetch(`${getBaseUrl()}/profiles/avatar/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          signal,
          // Не устанавливаем Content-Type, браузер сам установит с boundary для FormData
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Upload failed' }));
          return { error: { status: response.status, data: error } };
        }

        const data = await response.json();
        return { data };
      },
    }),

  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  // Universal Profile hooks
  useCreateProfileMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  // Avatar upload hook
  useUploadAvatarMutation,
} = authApi;

// Вспомогательные функции для работы с localStorage
export const getUserData = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getUserData();
};

export const getUserRole = (): string | null => {
  const user = getUserData();
  return user ? user.role : null;
};
