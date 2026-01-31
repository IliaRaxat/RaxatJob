// Конфигурация API
export const API_CONFIG = {
  // Базовый URL для Backend API из .env файла
  BASE_URL: (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartmatch-three.vercel.app/').replace(/\/$/, ''),
  
  // Endpoints для авторизации
  ENDPOINTS: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  
  // Настройки запросов
  REQUEST_CONFIG: {
    TIMEOUT: 10000, // 10 секунд
    RETRY_ATTEMPTS: 3,
  },
  
  // Заголовки по умолчанию
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Функция для получения полного URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Функция для получения заголовков с авторизацией
export function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Функция для отладки - показывает какой URL используется
export function debugApiConfig(): void {
  console.log('🔧 API Configuration Debug:');
  console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
  console.log('Final BASE_URL:', API_CONFIG.BASE_URL);
} 
