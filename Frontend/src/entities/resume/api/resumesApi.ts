import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '@/shared/lib/authErrorHandler';
import type {
  Resume,
  CreateResumeDto,
  UpdateResumeDto,
  GetResumesQuery,
  ResumesResponse
} from '../model/types';
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  return backendUrl.replace(/\/$/, '');
};
export const resumesApi = createApi({
  reducerPath: 'resumesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
    credentials: 'include',
    fetchFn: async (input, init) => {
      const response = await fetch(input, init);
      if (process.env.NODE_ENV === 'development') {
      }
      if (!response.ok) {
        const errorText = await response.text();
        const url = typeof input === 'string' ? input : input.url;
        const context = determineErrorContext(errorText, url);
        handleAuthError(response.status, response, context);
      }
      return response;
    },
  }),
  tagTypes: ['Resume'],
  endpoints: (builder) => ({
    createResume: builder.mutation<Resume, CreateResumeDto>({
      query: (resumeData) => ({
        url: '/resumes',
        method: 'POST',
        body: resumeData,
      }),
      invalidatesTags: ['Resume'],
    }),
    getResumes: builder.query<ResumesResponse, GetResumesQuery | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.search) searchParams.append('search', params.search);
        if (params?.isDefault !== undefined) searchParams.append('isDefault', params.isDefault.toString());
        if (params?.isPublic !== undefined) searchParams.append('isPublic', params.isPublic.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        const queryString = searchParams.toString();
        return `/resumes${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: ResumesResponse) => response,
      providesTags: ['Resume'],
    }),
    getResumeById: builder.query<Resume, string>({
      query: (id) => `/resumes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Resume', id }],
    }),
    updateResume: builder.mutation<Resume, { id: string; data: UpdateResumeDto }>({
      query: ({ id, data }) => ({
        url: `/resumes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Resume', id },
        'Resume',
      ],
    }),
    deleteResume: builder.mutation<void, string>({
      query: (id) => ({
        url: `/resumes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Resume', id },
        'Resume',
      ],
    }),
    getDefaultResume: builder.query<Resume, void>({
      query: () => '/resumes/default',
      providesTags: ['Resume'],
    }),
    setDefaultResume: builder.mutation<Resume, string>({
      query: (id) => ({
        url: `/resumes/${id}/set-default`,
        method: 'POST',
      }),
      invalidatesTags: ['Resume'],
    }),
    duplicateResume: builder.mutation<Resume, { id: string; title: string }>({
      query: ({ id, title }) => ({
        url: `/resumes/${id}/duplicate`,
        method: 'POST',
        body: { title },
      }),
      invalidatesTags: ['Resume'],
    }),
  }),
});
export const {
  useCreateResumeMutation,
  useGetResumesQuery,
  useGetResumeByIdQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useGetDefaultResumeQuery,
  useSetDefaultResumeMutation,
  useDuplicateResumeMutation,
} = resumesApi;
