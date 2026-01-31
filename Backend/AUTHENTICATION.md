# Аутентификация и авторизация

Полное руководство по аутентификации в SmartMatch API.

## 🔐 Обзор

SmartMatch использует JWT (JSON Web Tokens) для аутентификации с поддержкой HTTP-only cookies для безопасности.

### Особенности:
- JWT токены с сроком действия 1 час
- HTTP-only cookies для защиты от XSS атак
- Автоматическое обновление токенов
- Поддержка CORS для cross-origin запросов
- Rate limiting для защиты от брутфорса

## 📝 Регистрация

### Эндпоинт
```
POST /auth/register
```

### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `email` | string | ✅ | Email адрес | Любая строка (упрощено для демо) |
| `password` | string | ✅ | Пароль | Минимум 3 символа (упрощено для демо) |
| `role` | enum | ✅ | Роль пользователя | `HR`, `CANDIDATE`, `UNIVERSITY` |

### Примеры запросов

#### cURL
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "123",
    "role": "CANDIDATE"
  }'
```

#### JavaScript (fetch)
```javascript
async function register(email, password, role) {
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, role })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
try {
  const result = await register('candidate@example.com', 'Password123', 'CANDIDATE');
  console.log('Регистрация успешна:', result);
} catch (error) {
  console.error('Ошибка регистрации:', error.message);
}
```

#### TypeScript (axios)
```typescript
import axios from 'axios';

interface RegisterData {
  email: string;
  password: string;
  role: 'HR' | 'CANDIDATE' | 'UNIVERSITY';
}

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await axios.post('/auth/register', data, {
    withCredentials: true
  });
  return response.data;
}

// Использование
const registerData: RegisterData = {
  email: 'candidate@example.com',
  password: 'Password123',
  role: 'CANDIDATE'
};

register(registerData)
  .then(result => console.log('Регистрация успешна:', result))
  .catch(error => console.error('Ошибка:', error.message));
```

### Ответ при успехе
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "candidate@example.com",
    "role": "CANDIDATE"
  }
}
```

### Валидация пароля

Пароль должен соответствовать следующим требованиям:
- Минимум 8 символов
- Максимум 128 символов
- Минимум 1 заглавная буква (A-Z)
- Минимум 1 строчная буква (a-z)
- Минимум 1 цифра (0-9)

#### Примеры валидных паролей:
- `Password123`
- `MySecurePass1`
- `StrongP@ssw0rd`

#### Примеры невалидных паролей:
- `password` (нет заглавных букв и цифр)
- `PASSWORD123` (нет строчных букв)
- `Password` (нет цифр)
- `Pass1` (менее 8 символов)

### Обработка ошибок

#### 400 Bad Request - Ошибки валидации
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Введите корректный email адрес"
    },
    {
      "field": "password",
      "message": "Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру"
    }
  ]
}
```

#### 409 Conflict - Пользователь уже существует
```json
{
  "statusCode": 409,
  "message": "Пользователь с таким email уже существует",
  "error": "Conflict"
}
```

## 🔑 Вход в систему

### Эндпоинт
```
POST /auth/login
```

### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `email` | string | ✅ | Email адрес | Валидный email формат |
| `password` | string | ✅ | Пароль | Не пустой |

### Примеры запросов

#### cURL
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "Password123"
  }'
```

#### JavaScript (fetch)
```javascript
async function login(email, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
try {
  const result = await login('candidate@example.com', 'Password123');
  console.log('Вход успешен:', result);
} catch (error) {
  console.error('Ошибка входа:', error.message);
}
```

#### TypeScript (axios)
```typescript
interface LoginData {
  email: string;
  password: string;
}

async function login(data: LoginData): Promise<AuthResponse> {
  const response = await axios.post('/auth/login', data, {
    withCredentials: true
  });
  return response.data;
}

// Использование
const loginData: LoginData = {
  email: 'candidate@example.com',
  password: 'Password123'
};

login(loginData)
  .then(result => console.log('Вход успешен:', result))
  .catch(error => console.error('Ошибка:', error.message));
```

### Ответ при успехе
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "candidate@example.com",
    "role": "CANDIDATE"
  }
}
```

### Обработка ошибок

#### 401 Unauthorized - Неверные учетные данные
```json
{
  "statusCode": 401,
  "message": "Неверный email или пароль",
  "error": "Unauthorized"
}
```

#### 400 Bad Request - Ошибки валидации
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Введите корректный email адрес"
    }
  ]
}
```

## 👤 Получение текущего пользователя

### Эндпоинт
```
GET /auth/me
```

### Заголовки
```
Authorization: Bearer <JWT_TOKEN>
```

### Примеры запросов

#### cURL
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### JavaScript (fetch)
```javascript
async function getCurrentUser(token) {
  const response = await fetch('/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const token = 'your_jwt_token_here';
getCurrentUser(token)
  .then(user => console.log('Текущий пользователь:', user))
  .catch(error => console.error('Ошибка:', error.message));
```

#### TypeScript (axios)
```typescript
interface User {
  id: string;
  email: string;
  role: string;
}

async function getCurrentUser(): Promise<{ user: User; message: string }> {
  const response = await axios.get('/auth/me', {
    withCredentials: true
  });
  return response.data;
}

// Использование
getCurrentUser()
  .then(result => console.log('Пользователь:', result.user))
  .catch(error => console.error('Ошибка:', error.message));
```

### Ответ при успехе
```json
{
  "user": {
    "id": "user_123",
    "email": "candidate@example.com",
    "role": "CANDIDATE"
  },
  "message": "Аутентификация работает корректно"
}
```

## 🔄 Управление токенами

### Получение токена для использования в заголовках

#### Эндпоинт
```
GET /auth/token
```

#### Пример
```bash
curl -X GET http://localhost:3000/auth/token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Ответ
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "candidate@example.com",
    "role": "CANDIDATE"
  },
  "message": "Используйте этот токен в заголовке Authorization: Bearer <token>"
}
```

### Выход из системы

#### Эндпоинт
```
POST /auth/logout
```

#### Пример
```bash
curl -X POST http://localhost:3000/auth/logout
```

#### Ответ
```json
{
  "message": "Успешный выход из системы"
}
```

## 🍪 HTTP-only Cookies

### Настройка cookies

Cookies автоматически устанавливаются при регистрации и входе:

```javascript
// Cookies настраиваются автоматически
// Не нужно вручную управлять ими в JavaScript
```

### Параметры cookies:
- `httpOnly: true` - Защита от XSS атак
- `secure: true` (в production) - Только HTTPS
- `sameSite: 'none'` (в production) - Cross-origin запросы
- `maxAge: 3600000` - 1 час
- `path: '/'` - Доступно для всех путей

### Использование cookies в запросах

```javascript
// Cookies автоматически отправляются с запросами
// при использовании credentials: 'include'
const response = await fetch('/api/protected-endpoint', {
  method: 'GET',
  credentials: 'include' // Важно для отправки cookies
});
```

## 🛡️ Безопасность

### JWT Токены

#### Структура токена
```javascript
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "user_123",
  "email": "candidate@example.com",
  "role": "CANDIDATE",
  "iat": 1640995200,
  "exp": 1640998800
}
```

#### Проверка токена
```javascript
// Токен автоматически проверяется на сервере
// При невалидном токене возвращается 401 Unauthorized
```

### Rate Limiting

Защита от брутфорса:
- Максимум 5 попыток входа в минуту
- Блокировка на 15 минут при превышении лимита

### CORS

Настройки CORS для cross-origin запросов:
```javascript
// Разрешенные origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://yourdomain.com'
];
```

## 🔧 Конфигурация

### Переменные окружения

```env
# JWT секрет (обязательно)
JWT_SECRET=your-super-secret-jwt-key

# Время жизни токена (в секундах)
JWT_EXPIRES_IN=3600

# CORS origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### Настройка axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Для cookies
  timeout: 10000
});

// Интерцептор для автоматического добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Перенаправление на страницу входа
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 📱 React Hook пример

```typescript
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: 'Не авторизован'
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Ошибка проверки аутентификации'
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
        return data;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error.message
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth
  };
}
```

## 🚨 Обработка ошибок

### Типичные ошибки аутентификации

#### 401 Unauthorized
```javascript
// Неверный токен или истекший токен
if (response.status === 401) {
  // Перенаправить на страницу входа
  window.location.href = '/login';
}
```

#### 403 Forbidden
```javascript
// Недостаточно прав для доступа к ресурсу
if (response.status === 403) {
  // Показать сообщение об отсутствии прав
  alert('У вас нет прав для выполнения этого действия');
}
```

#### 429 Too Many Requests
```javascript
// Превышен лимит запросов
if (response.status === 429) {
  // Показать сообщение о превышении лимита
  alert('Слишком много запросов. Попробуйте позже.');
}
```

### Универсальная функция обработки ошибок

```typescript
interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

async function handleApiError(response: Response): Promise<never> {
  const error: ApiError = await response.json();
  
  switch (response.status) {
    case 401:
      // Перенаправление на страницу входа
      window.location.href = '/login';
      break;
    case 403:
      throw new Error('Недостаточно прав для выполнения операции');
    case 429:
      throw new Error('Слишком много запросов. Попробуйте позже.');
    case 400:
      // Ошибки валидации
      if (error.details) {
        const validationErrors = error.details.map(d => d.message).join(', ');
        throw new Error(`Ошибки валидации: ${validationErrors}`);
      }
      throw new Error(error.message);
    default:
      throw new Error(error.message || 'Произошла неизвестная ошибка');
  }
}
```

## 📊 Мониторинг и логирование

### Отслеживание событий аутентификации

```javascript
// Логирование успешного входа
function logLogin(userId, email, role) {
  console.log(`Пользователь ${email} (${role}) успешно вошел в систему`);
  // Отправка аналитики
  analytics.track('user_login', {
    userId,
    email,
    role,
    timestamp: new Date().toISOString()
  });
}

// Логирование неудачного входа
function logFailedLogin(email, reason) {
  console.warn(`Неудачная попытка входа для ${email}: ${reason}`);
  // Отправка аналитики
  analytics.track('login_failed', {
    email,
    reason,
    timestamp: new Date().toISOString()
  });
}
```

### Проверка состояния аутентификации

```javascript
// Проверка валидности токена
async function isTokenValid(token) {
  try {
    const response = await fetch('/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Автоматическое обновление токена
async function refreshTokenIfNeeded() {
  const token = localStorage.getItem('token');
  if (token && !(await isTokenValid(token))) {
    // Токен истек, перенаправление на страницу входа
    window.location.href = '/login';
  }
}
```
