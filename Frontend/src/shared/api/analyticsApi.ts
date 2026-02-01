import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '@/shared/lib/authErrorHandler';
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  const finalUrl = backendUrl.replace(/\/$/, '');
  return finalUrl;
};
export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
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
        const url = typeof input === 'string' ? input : input.url;
      }
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        throw new Error(`Expected JSON but got ${contentType}`);
      }
      return response;
    },
  }),
  tagTypes: ['Analytics', 'Moderation'],
  endpoints: (builder) => ({
    getAnalyticsOverview: builder.query<any, void>({
      query: () => '/admin/analytics/overview',
      providesTags: ['Analytics'],
    }),
    getCompaniesAnalytics: builder.query<any, void>({
      query: () => '/admin/analytics/companies',
      providesTags: ['Analytics'],
    }),
    getUniversitiesAnalytics: builder.query<any, void>({
      query: () => '/admin/analytics/universities',
      providesTags: ['Analytics'],
    }),
    getSkillsAnalytics: builder.query<any, void>({
      query: () => '/admin/analytics/skills',
      providesTags: ['Analytics'],
    }),
    getJobsAnalytics: builder.query<any, void>({
      query: () => '/admin/analytics/jobs',
      providesTags: ['Analytics'],
    }),
    getApplicationsAnalytics: builder.query<any, void>({
      query: () => '/admin/analytics/applications',
      providesTags: ['Analytics'],
    }),
    getUsersAnalytics: builder.query<any, void>({
      query: () => '/admin/analytics/users',
      providesTags: ['Analytics'],
    }),
    getActivityAnalytics: builder.query<any, void>({
      query: () => '/admin/analytics/activity',
      providesTags: ['Analytics'],
    }),
    getModerationJobs: builder.query<any, any>({
      query: (params) => ({
        url: '/admin/moderation/jobs',
        params,
      }),
      providesTags: ['Moderation'],
    }),
    getModerationStats: builder.query<any, void>({
      query: () => '/admin/moderation/stats',
      providesTags: ['Moderation'],
    }),
    approveJob: builder.mutation<any, string>({
      query: (jobId) => ({
        url: `/admin/moderation/jobs/${jobId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Moderation'],
    }),
    rejectJob: builder.mutation<any, { jobId: string; reason: string }>({
      query: ({ jobId, reason }) => ({
        url: `/admin/moderation/jobs/${jobId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Moderation'],
    }),
    returnJob: builder.mutation<any, { jobId: string; reason: string }>({
      query: ({ jobId, reason }) => ({
        url: `/admin/moderation/jobs/${jobId}/return`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Moderation'],
    }),
    bulkApproveJobs: builder.mutation<any, string[]>({
      query: (jobIds) => ({
        url: '/admin/moderation/jobs/bulk-approve',
        method: 'POST',
        body: { jobIds },
      }),
      invalidatesTags: ['Moderation'],
    }),
    bulkRejectJobs: builder.mutation<any, { jobIds: string[]; reason: string }>({
      query: ({ jobIds, reason }) => ({
        url: '/admin/moderation/jobs/bulk-reject',
        method: 'POST',
        body: { jobIds, reason },
      }),
      invalidatesTags: ['Moderation'],
    }),
    getNotifications: builder.query<any, any>({
      query: (params) => ({
        url: '/admin/notifications',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    broadcastNotification: builder.mutation<any, any>({
      query: (data) => ({
        url: '/admin/notifications/broadcast',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Analytics'],
    }),
    deleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Analytics'],
    }),
  }),
});
export const {
  useGetAnalyticsOverviewQuery,
  useGetCompaniesAnalyticsQuery,
  useGetUniversitiesAnalyticsQuery,
  useGetSkillsAnalyticsQuery,
  useGetJobsAnalyticsQuery,
  useGetApplicationsAnalyticsQuery,
  useGetUsersAnalyticsQuery,
  useGetActivityAnalyticsQuery,
  useGetModerationJobsQuery,
  useGetModerationStatsQuery,
  useApproveJobMutation,
  useRejectJobMutation,
  useReturnJobMutation,
  useBulkApproveJobsMutation,
  useBulkRejectJobsMutation,
  useGetNotificationsQuery,
  useBroadcastNotificationMutation,
  useDeleteNotificationMutation,
} = analyticsApi;
export type ModerationJobsParams = any;
export type NotificationsParams = any;
export type BroadcastNotificationParams = any;
