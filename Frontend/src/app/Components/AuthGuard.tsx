'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  redirectTo = '/auth/register' 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('🔒 AuthGuard: User not authenticated, redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Проверка авторизации...
      </div>
    );
  }

  // Если пользователь не авторизован, не показываем контент
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
