'use client';
import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, getUserData } from '@/entities/user';
import { RootState } from '@/shared/lib/store';
import { setUser, setLoading, login, logout, updateUser } from './authSlice';
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    const initAuth = () => {
      const userData = getUserData();
      if (userData) {
        dispatch(setUser(userData));
      }
      dispatch(setLoading(false));
    };
    const handleAuthChange = (event: CustomEvent) => {
      if (event.detail) {
        dispatch(setUser(event.detail));
      } else {
        dispatch(setUser(null));
      }
    };
    if (typeof window !== 'undefined') {
      initAuth();
      window.addEventListener('auth-changed', handleAuthChange as EventListener);
      return () => {
        window.removeEventListener('auth-changed', handleAuthChange as EventListener);
      };
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);
  const loginUser = (userData: User) => {
    dispatch(login(userData));
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(userData));
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: userData }));
    }
  };
  const logoutUser = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      });
    }
    dispatch(logout());
  };
  const updateUserData = (userData: User) => {
    dispatch(updateUser(userData));
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  };
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: loginUser,
    logout: logoutUser,
    updateUser: updateUserData,
  };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
