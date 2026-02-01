'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}
export default function RoleGuard({ 
  children, 
  allowedRoles,
  redirectTo = '/' 
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const hasPermission = allowedRoles.includes(user.role);
      if (!hasPermission) {
                                router.push(redirectTo);
      }
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, router, redirectTo]);
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Проверка прав доступа...
      </div>
    );
  }
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }
  return <>{children}</>;
}
