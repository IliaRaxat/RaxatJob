import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '@/shared/lib/authErrorHandler';
import type {
  InternshipRequest,
  CompanyResponse,
  CreateInternshipRequestDto,
  UpdateInternshipRequestDto,
  InternshipRequestQueryDto,
  InternshipRequestsResponse,
  CreateCompanyResponseDto,
  InternshipRequestStatus
} from '../model/types';
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  return backendUrl.replace(/\/$/, '');
};
export const internshipRequestsApi = createApi({
  reducerPath: 'internshipRequestsApi',
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
      if (!response.ok) {
        const errorText = await response.text();
        const url = typeof input === 'string' ? input : input.url;
        const context = determineErrorContext(errorText, url);
        handleAuthError(response.status, response, context);
      }
      return response;
    },
  }),
  tagTypes: ['InternshipRequest', 'CompanyResponse'],
  endpoints: (builder) => ({
    createInternshipRequest: builder.mutation<InternshipRequest, CreateInternshipRequestDto>({
      query: (requestData) => ({
        url: '/internship-requests',
        method: 'POST',
        body: requestData,
      }),
      invalidatesTags: ['InternshipRequest'],
    }),
    getInternshipRequests: builder.query<InternshipRequestsResponse, InternshipRequestQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.specialty) searchParams.append('specialty', params.specialty);
        if (params?.location) searchParams.append('location', params.location);
        if (params?.status) searchParams.append('status', params.status);
        if (params?.isRemote !== undefined) searchParams.append('isRemote', params.isRemote.toString());
        if (params?.page && params.page > 0) searchParams.append('page', params.page.toString());
        if (params?.limit && params.limit > 0) searchParams.append('limit', params.limit.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        const queryString = searchParams.toString();
        return `/internship-requests/catalog${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['InternshipRequest'],
    }),
    getMyInternshipRequests: builder.query<InternshipRequestsResponse, InternshipRequestQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.append('status', params.status);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.search) searchParams.append('search', params.search);
        if (params?.specialty) searchParams.append('specialty', params.specialty);
        if (params?.location) searchParams.append('location', params.location);
        if (params?.isRemote !== undefined) searchParams.append('isRemote', params.isRemote.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        const queryString = searchParams.toString();
        return `/internship-requests/my${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['InternshipRequest'],
    }),
    getInternshipRequestById: builder.query<InternshipRequest, string>({
      query: (id) => `/internship-requests/${id}`,
      providesTags: (result, error, id) => [{ type: 'InternshipRequest', id }],
    }),
    updateInternshipRequest: builder.mutation<InternshipRequest, { id: string; data: UpdateInternshipRequestDto }>({
      query: ({ id, data }) => ({
        url: `/internship-requests/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'InternshipRequest', id },
        'InternshipRequest',
      ],
    }),
    deleteInternshipRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/internship-requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'InternshipRequest', id },
        'InternshipRequest',
      ],
    }),
    respondToInternshipRequest: builder.mutation<CompanyResponse, CreateCompanyResponseDto>({
      query: (responseData) => ({
        url: '/internship-requests/respond',
        method: 'POST',
        body: responseData,
      }),
      invalidatesTags: ['CompanyResponse', 'InternshipRequest'],
    }),
    getCompanyResponses: builder.query<CompanyResponse[], string>({
      query: (internshipRequestId) => `/internship-requests/${internshipRequestId}/responses`,
      providesTags: (result, error, internshipRequestId) => [
        { type: 'CompanyResponse', id: internshipRequestId }
      ],
    }),
    selectCompany: builder.mutation<InternshipRequest, { 
      internshipRequestId: string; 
      companyResponseId: string; 
    }>({
      query: ({ internshipRequestId, companyResponseId }) => ({
        url: `/internship-requests/${internshipRequestId}/select-company`,
        method: 'POST',
        body: { companyResponseId },
      }),
      invalidatesTags: (result, error, { internshipRequestId }) => [
        { type: 'InternshipRequest', id: internshipRequestId },
        'InternshipRequest',
        'CompanyResponse',
      ],
    }),
    updateInternshipRequestStatus: builder.mutation<InternshipRequest, { 
      id: string; 
      status: InternshipRequestStatus; 
    }>({
      query: ({ id, status }) => ({
        url: `/internship-requests/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'InternshipRequest', id },
        'InternshipRequest',
      ],
    }),
    getPublicInternshipRequests: builder.query<InternshipRequestsResponse, InternshipRequestQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.specialty) searchParams.append('specialty', params.specialty);
        if (params?.location) searchParams.append('location', params.location);
        if (params?.isRemote !== undefined) searchParams.append('isRemote', params.isRemote.toString());
        if (params?.page && params.page > 0) searchParams.append('page', params.page.toString());
        if (params?.limit && params.limit > 0) searchParams.append('limit', params.limit.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        const queryString = searchParams.toString();
        return `/internship-requests/public${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['InternshipRequest'],
    }),
    getHRCompanyResponses: builder.query<CompanyResponse[], InternshipRequestQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        const queryString = searchParams.toString();
        return `/hr/company-responses${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['CompanyResponse'],
    }),
    updateCompanyResponseStatus: builder.mutation<CompanyResponse, { 
      id: string; 
      status: 'PENDING' | 'ACCEPTED' | 'REJECTED'; 
    }>({
      query: ({ id, status }) => ({
        url: `/hr/company-responses/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CompanyResponse', id },
        'CompanyResponse',
        'InternshipRequest',
      ],
    }),
  }),
});
export const {
  useCreateInternshipRequestMutation,
  useGetInternshipRequestsQuery,
  useGetMyInternshipRequestsQuery,
  useGetInternshipRequestByIdQuery,
  useUpdateInternshipRequestMutation,
  useDeleteInternshipRequestMutation,
  useRespondToInternshipRequestMutation,
  useGetCompanyResponsesQuery,
  useSelectCompanyMutation,
  useUpdateInternshipRequestStatusMutation,
  useGetPublicInternshipRequestsQuery,
  useGetHRCompanyResponsesQuery,
  useUpdateCompanyResponseStatusMutation,
} = internshipRequestsApi;
