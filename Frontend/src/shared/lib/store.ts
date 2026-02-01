import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from '@/entities/user';
import { jobsApi } from '@/entities/job';
import { studentsApi } from '@/entities/student';
import { analyticsApi } from '@/shared/api/analyticsApi';
import { usersApi } from '@/entities/user';
import { resumesApi } from '@/entities/resume';
import { internshipRequestsApi } from '@/entities/internship-request';
import { internshipsApi } from '@/entities/internship';
import { authReducer } from '@/features/auth';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [studentsApi.reducerPath]: studentsApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [resumesApi.reducerPath]: resumesApi.reducer,
    [internshipRequestsApi.reducerPath]: internshipRequestsApi.reducer,
    [internshipsApi.reducerPath]: internshipsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      jobsApi.middleware, 
      studentsApi.middleware,
      analyticsApi.middleware, 
      usersApi.middleware,
      resumesApi.middleware,
      internshipRequestsApi.middleware,
      internshipsApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
