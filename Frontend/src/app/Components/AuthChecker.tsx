'use client';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth';
export default function AuthChecker() {
  const { user, isLoading } = useAuth();
  useEffect(() => {
    const validateAuth = async () => {
      if (user && !isLoading) {
              }
    };
    validateAuth();
    const interval = setInterval(validateAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, isLoading]);
  return null;
}
