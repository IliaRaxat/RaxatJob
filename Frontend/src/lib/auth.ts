// API функции для авторизации
import { API_CONFIG, getApiUrl, getAuthHeaders, debugApiConfig } from '../config/api';

export interface User {
  id: string;
  email: string;
  role: 'HR' | 'CANDIDATE' | 'UNIVERSITY' | 'ADMIN' | 'MODERATOR';
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'HR' | 'CANDIDATE' | 'UNIVERSITY';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Функция для выполнения API запросов
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = getApiUrl(endpoint);
  
  // Отладочная информация (только в development)
  if (process.env.NODE_ENV === 'development') {
    debugApiConfig();
    console.log(`🌐 Making API request to: ${url}`);
  }
 
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Неизвестная ошибка при выполнении запроса');
  }
}

// Регистрация нового пользователя
export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Вход в систему
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Выход из системы
export async function logoutUser(): Promise<void> {
  const token = getAuthToken();
  return apiRequest<void>(API_CONFIG.ENDPOINTS.LOGOUT, {
    method: 'POST',
    headers: getAuthHeaders(token || undefined),
  });
}

// Получение информации о текущем пользователе
export async function getCurrentUser(): Promise<User> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Токен авторизации не найден');
  }

  return apiRequest<User>(API_CONFIG.ENDPOINTS.ME, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
}

// Сохранение токена в localStorage
export function saveAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

// Получение токена из localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Удаление токена из localStorage
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

// Проверка авторизации
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Получение роли пользователя
export function getUserRole(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    // В реальном приложении токен нужно декодировать
    // Здесь упрощенная версия для демонстрации
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role;
    }
    return null;
  } catch {
    return null;
  }
}

// Сохранение данных пользователя
export function saveUserData(user: User): void {
  localStorage.setItem('user_data', JSON.stringify(user));
}

// Получение данных пользователя
export function getUserData(): User | null {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

// Удаление данных пользователя
export function removeUserData(): void {
  localStorage.removeItem('user_data');
}
