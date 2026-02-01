import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Internship,
  InternshipApplication,
  CreateInternshipDto,
  UpdateInternshipDto,
  InternshipQueryDto,
  InternshipsResponse,
  ApplyToInternshipDto,
  InternshipStatus
} from '../model/types';
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  return backendUrl.replace(/\/$/, '');
};
export const internshipsApi = createApi({
  reducerPath: 'internshipsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['Internship', 'InternshipApplication'],
  endpoints: (builder) => ({
    createInternship: builder.mutation<Internship, CreateInternshipDto>({
      query: (internshipData) => ({
        url: '/internships',
        method: 'POST',
        body: internshipData,
      }),
      invalidatesTags: ['Internship'],
    }),
    getInternships: builder.query<InternshipsResponse, InternshipQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.location) searchParams.append('location', params.location);
        if (params?.isRemote !== undefined) searchParams.append('isRemote', params.isRemote.toString());
        if (params?.skills) searchParams.append('skills', params.skills);
        if (params?.tags) searchParams.append('tags', params.tags);
        if (params?.salaryMin) searchParams.append('salaryMin', params.salaryMin.toString());
        if (params?.salaryMax) searchParams.append('salaryMax', params.salaryMax.toString());
        if (params?.page && params.page > 0) searchParams.append('page', params.page.toString());
        if (params?.limit && params.limit > 0) searchParams.append('limit', params.limit.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        const queryString = searchParams.toString();
        return `/internships${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Internship'],
    }),
    getMyInternships: builder.query<InternshipsResponse, void>({
      query: () => '/internships/my',
      providesTags: ['Internship'],
    }),
    getInternshipById: builder.query<Internship, string>({
      query: (id) => `/internships/${id}`,
      providesTags: (result, error, id) => [{ type: 'Internship', id }],
    }),
    updateInternship: builder.mutation<Internship, { id: string; data: UpdateInternshipDto }>({
      query: ({ id, data }) => ({
        url: `/internships/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Internship', id },
        'Internship',
      ],
    }),
    deleteInternship: builder.mutation<void, string>({
      query: (id) => ({
        url: `/internships/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Internship', id },
        'Internship',
      ],
    }),
    updateInternshipStatus: builder.mutation<Internship, { 
      id: string; 
      status: InternshipStatus; 
    }>({
      query: ({ id, status }) => ({
        url: `/internships/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Internship', id },
        'Internship',
      ],
    }),
    applyToInternship: builder.mutation<InternshipApplication, ApplyToInternshipDto>({
      query: (applicationData) => ({
        url: '/internships/apply',
        method: 'POST',
        body: applicationData,
      }),
      invalidatesTags: ['InternshipApplication', 'Internship'],
    }),
    getInternshipApplications: builder.query<InternshipApplication[], string>({
      query: (internshipId) => `/internships/${internshipId}/applications`,
      providesTags: (result, error, internshipId) => [
        { type: 'InternshipApplication', id: internshipId }
      ],
    }),
    updateApplicationStatus: builder.mutation<InternshipApplication, {
      internshipId: string;
      applicationId: string;
      status: 'ACCEPTED' | 'REJECTED';
    }>({
      query: ({ internshipId, applicationId, status }) => ({
        url: `/internships/${internshipId}/applications/${applicationId}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { internshipId }) => [
        { type: 'InternshipApplication', id: internshipId },
        'InternshipApplication',
      ],
    }),
    getMyApplications: builder.query<InternshipApplication[], void>({
      query: () => '/internships/my-applications',
      providesTags: ['InternshipApplication'],
    }),
  }),
});
export const {
  useCreateInternshipMutation,
  useGetInternshipsQuery,
  useGetMyInternshipsQuery,
  useGetInternshipByIdQuery,
  useUpdateInternshipMutation,
  useDeleteInternshipMutation,
  useUpdateInternshipStatusMutation,
  useApplyToInternshipMutation,
  useGetInternshipApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useGetMyApplicationsQuery,
} = internshipsApi;
