import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/shared/api/base';
import { User, HRProfile, CandidateProfile, UniversityProfile, AdminProfile } from '../model/types';
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
export type UniversalProfileDto = Partial<CreateHRProfileDto & CreateCandidateProfileDto & CreateUniversityProfileDto & CreateAdminProfileDto>;
export type UniversalUpdateDto = Partial<UpdateHRProfileDto & UpdateCandidateProfileDto & UpdateUniversityProfileDto & UpdateAdminProfileDto>;
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['User', 'HRProfile', 'CandidateProfile', 'UniversityProfile', 'AdminProfile'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(data.user));
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: data.user }));
          }
        } catch (err) {
        }
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(data.user));
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: data.user }));
          }
        } catch (err) {
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user_data');
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
          }
        } catch {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user_data');
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
          }
        }
      },
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
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
    uploadAvatar: builder.mutation<{ 
        success: boolean;
        fileName: string;
        avatarUrl: string;
        mediaFileId: string;
        message: string;
    }, FormData>({
      queryFn: async (formData, { signal, getState }) => {
        const state = getState() as any;
        const baseUrl = state.config?.baseUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/profiles/avatar/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          signal,
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
  useCreateProfileMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} = authApi;
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
