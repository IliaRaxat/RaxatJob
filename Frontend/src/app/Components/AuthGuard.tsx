'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
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
            router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);
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
  if (!isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}
