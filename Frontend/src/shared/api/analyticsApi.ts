import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '@/shared/lib/authErrorHandler';

interface AnalyticsOverview {
  [key: string]: unknown;
}

interface CompaniesAnalytics {
  [key: string]: unknown;
}

interface UniversitiesAnalytics {
  [key: string]: unknown;
}

interface SkillsAnalytics {
  [key: string]: unknown;
}

interface JobsAnalytics {
  [key: string]: unknown;
}

interface ApplicationsAnalytics {
  [key: string]: unknown;
}

interface UsersAnalytics {
  [key: string]: unknown;
}

interface ActivityAnalytics {
  [key: string]: unknown;
}

interface ModerationJob {
  [key: string]: unknown;
}

interface ModerationStats {
  [key: string]: unknown;
}

interface Notification {
  [key: string]: unknown;
}

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
        const urlString = typeof input === 'string' ? input : input.url;
        const context = determineErrorContext(errorText, urlString);
        handleAuthError(response.status, response, context);
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
    getAnalyticsOverview: builder.query<AnalyticsOverview, void>({
      query: () => '/admin/analytics/overview',
      providesTags: ['Analytics'],
    }),
    getCompaniesAnalytics: builder.query<CompaniesAnalytics, void>({
      query: () => '/admin/analytics/companies',
      providesTags: ['Analytics'],
    }),
    getUniversitiesAnalytics: builder.query<UniversitiesAnalytics, void>({
      query: () => '/admin/analytics/universities',
      providesTags: ['Analytics'],
    }),
    getSkillsAnalytics: builder.query<SkillsAnalytics, void>({
      query: () => '/admin/analytics/skills',
      providesTags: ['Analytics'],
    }),
    getJobsAnalytics: builder.query<JobsAnalytics, void>({
      query: () => '/admin/analytics/jobs',
      providesTags: ['Analytics'],
    }),
    getApplicationsAnalytics: builder.query<ApplicationsAnalytics, void>({
      query: () => '/admin/analytics/applications',
      providesTags: ['Analytics'],
    }),
    getUsersAnalytics: builder.query<UsersAnalytics, void>({
      query: () => '/admin/analytics/users',
      providesTags: ['Analytics'],
    }),
    getActivityAnalytics: builder.query<ActivityAnalytics, void>({
      query: () => '/admin/analytics/activity',
      providesTags: ['Analytics'],
    }),
    getModerationJobs: builder.query<ModerationJob[], Record<string, unknown>>({
      query: (params) => ({
        url: '/admin/moderation/jobs',
        params,
      }),
      providesTags: ['Moderation'],
    }),
    getModerationStats: builder.query<ModerationStats, void>({
      query: () => '/admin/moderation/stats',
      providesTags: ['Moderation'],
    }),
    approveJob: builder.mutation<{ success: boolean }, string>({
      query: (jobId) => ({
        url: `/admin/moderation/jobs/${jobId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Moderation'],
    }),
    rejectJob: builder.mutation<{ success: boolean }, { jobId: string; reason: string }>({
      query: ({ jobId, reason }) => ({
        url: `/admin/moderation/jobs/${jobId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Moderation'],
    }),
    returnJob: builder.mutation<{ success: boolean }, { jobId: string; reason: string }>({
      query: ({ jobId, reason }) => ({
        url: `/admin/moderation/jobs/${jobId}/return`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Moderation'],
    }),
    bulkApproveJobs: builder.mutation<{ success: boolean }, string[]>({
      query: (jobIds) => ({
        url: '/admin/moderation/jobs/bulk-approve',
        method: 'POST',
        body: { jobIds },
      }),
      invalidatesTags: ['Moderation'],
    }),
    bulkRejectJobs: builder.mutation<{ success: boolean }, { jobIds: string[]; reason: string }>({
      query: ({ jobIds, reason }) => ({
        url: '/admin/moderation/jobs/bulk-reject',
        method: 'POST',
        body: { jobIds, reason },
      }),
      invalidatesTags: ['Moderation'],
    }),
    getNotifications: builder.query<Notification[], Record<string, unknown>>({
      query: (params) => ({
        url: '/admin/notifications',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    broadcastNotification: builder.mutation<{ success: boolean }, Record<string, unknown>>({
      query: (data) => ({
        url: '/admin/notifications/broadcast',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Analytics'],
    }),
    deleteNotification: builder.mutation<{ success: boolean }, string>({
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

export type ModerationJobsParams = Record<string, unknown>;
export type NotificationsParams = Record<string, unknown>;
export type BroadcastNotificationParams = Record<string, unknown>;
