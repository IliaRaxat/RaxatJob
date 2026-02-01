'use client';
import { Provider } from 'react-redux';
import { store } from '@/shared/lib/store';
import { AuthProvider } from '@/features/auth';
import { NotificationProvider } from './Components/NotificationProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </Provider>
  );
}
