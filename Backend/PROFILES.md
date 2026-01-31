# Управление профилями пользователей

Полное руководство по работе с профилями в SmartMatch API.

## 👤 Обзор типов профилей

В системе SmartMatch существует 3 типа профилей:

- **HR Profile** - для HR-менеджеров и работодателей
- **Candidate Profile** - для соискателей
- **University Profile** - для университетов

## 🔐 Аутентификация

Все эндпоинты профилей требуют аутентификации через JWT токен.

### Заголовки
```
Authorization: Bearer <JWT_TOKEN>
```

### Cookies (автоматически)
```
Cookie: access_token=<JWT_TOKEN>
```

## 👔 HR Профиль

### Создание HR профиля

#### Эндпоинт
```
POST /profiles/hr
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `firstName` | string | ✅ | Имя | Не пустое |
| `lastName` | string | ✅ | Фамилия | Не пустое |
| `company` | string | ✅ | Компания | Не пустое |
| `position` | string | ✅ | Должность | Не пустое |
| `phone` | string | ❌ | Телефон | Формат телефона |
| `avatarId` | string | ❌ | ID аватара | UUID формата |

#### Примеры запросов

##### cURL
```bash
curl -X POST http://localhost:3000/profiles/hr \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Иван",
    "lastName": "Петров",
    "company": "ООО Технологии",
    "position": "HR Manager",
    "phone": "+7-999-123-45-67"
  }'
```

##### JavaScript (fetch)
```javascript
async function createHRProfile(profileData) {
  const response = await fetch('/profiles/hr', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(profileData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const hrProfile = {
  firstName: 'Иван',
  lastName: 'Петров',
  company: 'ООО Технологии',
  position: 'HR Manager',
  phone: '+7-999-123-45-67'
};

createHRProfile(hrProfile)
  .then(profile => console.log('HR профиль создан:', profile))
  .catch(error => console.error('Ошибка:', error.message));
```

##### TypeScript (axios)
```typescript
interface CreateHRProfileData {
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phone?: string;
  avatarId?: string;
}

interface HRProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phone?: string;
  avatarId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  jobs: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

async function createHRProfile(data: CreateHRProfileData): Promise<HRProfile> {
  const response = await axios.post('/profiles/hr', data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}
```

#### Ответ при успехе
```json
{
  "id": "hr_profile_id",
  "userId": "user_id",
  "firstName": "Иван",
  "lastName": "Петров",
  "company": "ООО Технологии",
  "position": "HR Manager",
  "phone": "+7-999-123-45-67",
  "avatarId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "hr@company.com",
    "role": "HR"
  },
  "jobs": []
}
```

### Получение HR профиля

#### Эндпоинт
```
GET /profiles/hr
```

#### Пример
```bash
curl -X GET http://localhost:3000/profiles/hr \
  -H "Authorization: Bearer <token>"
```

#### JavaScript
```javascript
async function getHRProfile() {
  const response = await fetch('/profiles/hr', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}
```

### Обновление HR профиля

#### Эндпоинт
```
PATCH /profiles/hr
```

#### Параметры запроса (все опциональные)

| Поле | Тип | Описание |
|------|-----|----------|
| `firstName` | string | Имя |
| `lastName` | string | Фамилия |
| `company` | string | Компания |
| `position` | string | Должность |
| `phone` | string | Телефон |
| `avatarId` | string | ID аватара |

#### Пример
```bash
curl -X PATCH http://localhost:3000/profiles/hr \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Иван",
    "company": "Новая компания",
    "phone": "+7-999-987-65-43"
  }'
```

## 👨‍💼 Candidate Профиль

### Создание профиля кандидата

#### Эндпоинт
```
POST /profiles/candidate
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `firstName` | string | ✅ | Имя | Не пустое |
| `lastName` | string | ✅ | Фамилия | Не пустое |
| `phone` | string | ❌ | Телефон | Формат телефона |
| `dateOfBirth` | string | ❌ | Дата рождения | ISO 8601 формат |
| `location` | string | ❌ | Местоположение | Не пустое |
| `bio` | string | ❌ | Биография | Максимум 1000 символов |
| `avatarId` | string | ❌ | ID аватара | UUID формата |
| `resumeId` | string | ❌ | ID резюме | UUID формата |
| `linkedinUrl` | string | ❌ | LinkedIn URL | Валидный URL |
| `githubUrl` | string | ❌ | GitHub URL | Валидный URL |
| `portfolioUrl` | string | ❌ | Портфолио URL | Валидный URL |
| `isAvailable` | boolean | ❌ | Доступен для работы | true/false |
| `expectedSalary` | number | ❌ | Ожидаемая зарплата | Положительное число |

#### Примеры запросов

##### cURL
```bash
curl -X POST http://localhost:3000/profiles/candidate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Анна",
    "lastName": "Смирнова",
    "phone": "+7-999-123-45-67",
    "dateOfBirth": "1995-05-15",
    "location": "Москва",
    "bio": "Frontend разработчик с 3 годами опыта",
    "linkedinUrl": "https://linkedin.com/in/anna-smirnova",
    "githubUrl": "https://github.com/anna-smirnova",
    "isAvailable": true,
    "expectedSalary": 150000
  }'
```

##### JavaScript (fetch)
```javascript
async function createCandidateProfile(profileData) {
  const response = await fetch('/profiles/candidate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(profileData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const candidateProfile = {
  firstName: 'Анна',
  lastName: 'Смирнова',
  phone: '+7-999-123-45-67',
  dateOfBirth: '1995-05-15',
  location: 'Москва',
  bio: 'Frontend разработчик с 3 годами опыта',
  linkedinUrl: 'https://linkedin.com/in/anna-smirnova',
  githubUrl: 'https://github.com/anna-smirnova',
  isAvailable: true,
  expectedSalary: 150000
};

createCandidateProfile(candidateProfile)
  .then(profile => console.log('Профиль кандидата создан:', profile))
  .catch(error => console.error('Ошибка:', error.message));
```

##### TypeScript (axios)
```typescript
interface CreateCandidateProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  location?: string;
  bio?: string;
  avatarId?: string;
  resumeId?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isAvailable?: boolean;
  expectedSalary?: number;
}

interface CandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  location?: string;
  bio?: string;
  avatarId?: string;
  resumeId?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isAvailable: boolean;
  expectedSalary?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  skills: Array<{
    id: string;
    level: number;
    skill: {
      id: string;
      name: string;
      category: string;
      description: string;
    };
  }>;
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
    isCurrent: boolean;
  }>;
  educations: Array<{
    id: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    gpa?: number;
    description?: string;
  }>;
  applications: Array<{
    id: string;
    status: string;
    appliedAt: string;
    job: {
      id: string;
      title: string;
      status: string;
      hr: {
        company: string;
      };
    };
  }>;
}

async function createCandidateProfile(data: CreateCandidateProfileData): Promise<CandidateProfile> {
  const response = await axios.post('/profiles/candidate', data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}
```

#### Ответ при успехе
```json
{
  "id": "candidate_profile_id",
  "userId": "user_id",
  "firstName": "Анна",
  "lastName": "Смирнова",
  "phone": "+7-999-123-45-67",
  "dateOfBirth": "1995-05-15T00:00:00.000Z",
  "location": "Москва",
  "bio": "Frontend разработчик с 3 годами опыта",
  "avatarId": null,
  "resumeId": null,
  "linkedinUrl": "https://linkedin.com/in/anna-smirnova",
  "githubUrl": "https://github.com/anna-smirnova",
  "portfolioUrl": null,
  "isAvailable": true,
  "expectedSalary": 150000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "anna@example.com",
    "role": "CANDIDATE"
  },
  "skills": [],
  "experiences": [],
  "educations": [],
  "applications": []
}
```

### Получение профиля кандидата

#### Эндпоинт
```
GET /profiles/candidate
```

#### Пример
```bash
curl -X GET http://localhost:3000/profiles/candidate \
  -H "Authorization: Bearer <token>"
```

### Обновление профиля кандидата

#### Эндпоинт
```
PATCH /profiles/candidate
```

#### Пример
```bash
curl -X PATCH http://localhost:3000/profiles/candidate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Обновленное описание",
    "location": "Санкт-Петербург",
    "linkedinUrl": "https://linkedin.com/in/new-profile"
  }'
```

## 🏫 University Профиль

### Создание профиля университета

#### Эндпоинт
```
POST /profiles/university
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `name` | string | ✅ | Название университета | Не пустое |
| `address` | string | ✅ | Адрес | Не пустое |
| `phone` | string | ❌ | Телефон | Формат телефона |
| `website` | string | ❌ | Веб-сайт | Валидный URL |
| `logoId` | string | ❌ | ID логотипа | UUID формата |

#### Примеры запросов

##### cURL
```bash
curl -X POST http://localhost:3000/profiles/university \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Московский Государственный Университет",
    "address": "Москва, Ленинские горы, 1",
    "phone": "+7-495-939-10-00",
    "website": "https://msu.ru"
  }'
```

##### JavaScript (fetch)
```javascript
async function createUniversityProfile(profileData) {
  const response = await fetch('/profiles/university', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(profileData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const universityProfile = {
  name: 'Московский Государственный Университет',
  address: 'Москва, Ленинские горы, 1',
  phone: '+7-495-939-10-00',
  website: 'https://msu.ru'
};

createUniversityProfile(universityProfile)
  .then(profile => console.log('Профиль университета создан:', profile))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
{
  "id": "university_profile_id",
  "userId": "user_id",
  "name": "Московский Государственный Университет",
  "address": "Москва, Ленинские горы, 1",
  "phone": "+7-495-939-10-00",
  "website": "https://msu.ru",
  "logoId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "admin@msu.ru",
    "role": "UNIVERSITY"
  },
  "students": [],
  "educations": []
}
```

### Получение профиля университета

#### Эндпоинт
```
GET /profiles/university
```

### Обновление профиля университета

#### Эндпоинт
```
PATCH /profiles/university
```

#### Пример
```bash
curl -X PATCH http://localhost:3000/profiles/university \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "МГУ им. М.В. Ломоносова",
    "website": "https://www.msu.ru"
  }'
```

## 🔄 Универсальное обновление профиля

### Эндпоинт
```
PATCH /profiles
```

Этот эндпоинт позволяет обновлять любой тип профиля, автоматически определяя тип по роли пользователя.

#### Параметры запроса

Все поля опциональные. Поддерживаются поля для всех типов профилей:

**Общие поля:**
- `firstName` (string) - Имя
- `lastName` (string) - Фамилия
- `phone` (string) - Телефон
- `avatarId` (string) - ID аватара

**Для HR профиля:**
- `company` (string) - Компания
- `position` (string) - Должность

**Для кандидата:**
- `dateOfBirth` (string) - Дата рождения
- `location` (string) - Местоположение
- `bio` (string) - Биография
- `resumeId` (string) - ID резюме
- `linkedinUrl` (string) - LinkedIn URL
- `githubUrl` (string) - GitHub URL
- `portfolioUrl` (string) - Портфолио URL
- `isAvailable` (boolean) - Доступен для работы
- `expectedSalary` (number) - Ожидаемая зарплата

**Для университета:**
- `name` (string) - Название университета
- `address` (string) - Адрес
- `website` (string) - Веб-сайт
- `logoId` (string) - ID логотипа

#### Примеры запросов

##### cURL
```bash
curl -X PATCH http://localhost:3000/profiles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Новое имя",
    "lastName": "Новая фамилия",
    "phone": "+7-999-123-45-67"
  }'
```

##### JavaScript (fetch)
```javascript
async function updateProfile(profileData) {
  const response = await fetch('/profiles', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(profileData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const updates = {
  firstName: 'Новое имя',
  bio: 'Обновленное описание',
  location: 'Москва'
};

updateProfile(updates)
  .then(profile => console.log('Профиль обновлен:', profile))
  .catch(error => console.error('Ошибка:', error.message));
```

## 🖼️ Управление аватарами

### Загрузка аватара

#### Эндпоинт
```
POST /profiles/avatar/upload
```

#### Параметры запроса
- `file` (multipart/form-data) - Файл изображения

#### Ограничения
- Только изображения (`image/*`)
- Максимальный размер: 10MB
- Один файл за раз

#### Примеры запросов

##### cURL
```bash
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@avatar.jpg"
```

##### JavaScript (fetch)
```javascript
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/profiles/avatar/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const fileInput = document.getElementById('avatar-input');
const file = fileInput.files[0];

if (file) {
  uploadAvatar(file)
    .then(result => {
      console.log('Аватар загружен:', result);
      // Обновить профиль с новым avatarId
      return updateProfile({ avatarId: result.fileName });
    })
    .catch(error => console.error('Ошибка загрузки:', error.message));
}
```

##### TypeScript (axios)
```typescript
async function uploadAvatar(file: File): Promise<{
  success: boolean;
  fileName: string;
  avatarUrl: string;
  message: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post('/profiles/avatar/upload', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
}
```

#### Ответ при успехе
```json
{
  "success": true,
  "fileName": "avatars/avatar_123456.jpg",
  "avatarUrl": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_123456.jpg?X-Amz-Algorithm=...",
  "message": "Аватарка успешно загружена"
}
```

### Получение аватара

#### Эндпоинт
```
GET /profiles/avatar
```

Возвращает файл изображения напрямую.

#### Пример
```bash
curl -X GET http://localhost:3000/profiles/avatar \
  -H "Authorization: Bearer <token>" \
  --output avatar.jpg
```

### Получение URL аватара

#### Эндпоинт
```
GET /profiles/avatar/url
```

Возвращает presigned URL для доступа к аватару.

#### Пример
```bash
curl -X GET http://localhost:3000/profiles/avatar/url \
  -H "Authorization: Bearer <token>"
```

#### Ответ при успехе
```json
{
  "success": true,
  "avatarUrl": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_123456.jpg?X-Amz-Algorithm=...",
  "fileName": "avatars/avatar_123456.jpg"
}
```

#### Ответ если аватар не найден
```json
{
  "success": false,
  "message": "Аватарка не найдена"
}
```

### Удаление аватара

#### Эндпоинт
```
POST /profiles/avatar/delete
```

#### Пример
```bash
curl -X POST http://localhost:3000/profiles/avatar/delete \
  -H "Authorization: Bearer <token>"
```

#### Ответ при успехе
```json
{
  "success": true,
  "message": "Аватарка успешно удалена"
}
```

## ❌ Обработка ошибок

### Возможные ошибки

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Неверный или отсутствующий токен",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Недостаточно прав для доступа к профилю",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Профиль не найден",
  "error": "Not Found"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Профиль уже существует",
  "error": "Conflict"
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
    },
    {
      "field": "phone",
      "message": "Неверный формат телефона"
    }
  ]
}
```

### JavaScript обработка ошибок

```javascript
async function handleProfileOperation(operation) {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    if (error.response) {
      // HTTP ошибка
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Перенаправление на страницу входа
          window.location.href = '/login';
          break;
        case 403:
          alert('У вас нет прав для выполнения этого действия');
          break;
        case 404:
          alert('Профиль не найден');
          break;
        case 409:
          alert('Профиль уже существует');
          break;
        case 400:
          // Ошибки валидации
          if (data.details) {
            const validationErrors = data.details.map(d => d.message).join(', ');
            alert(`Ошибки валидации: ${validationErrors}`);
          } else {
            alert(data.message);
          }
          break;
        default:
          alert(`Произошла ошибка: ${data.message}`);
      }
    } else {
      // Сетевая ошибка
      alert('Ошибка сети. Проверьте подключение к интернету.');
    }
    
    throw error;
  }
}

// Использование
handleProfileOperation(() => getHRProfile())
  .then(profile => console.log('Профиль:', profile))
  .catch(error => console.error('Ошибка:', error));
```

## 🔒 Безопасность

### Проверка ролей

Профили доступны только пользователям с соответствующими ролями:

- **HR профиль** - только для пользователей с ролью `HR`
- **Candidate профиль** - только для пользователей с ролью `CANDIDATE`
- **University профиль** - только для пользователей с ролью `UNIVERSITY`

### Валидация данных

Все входящие данные проходят валидацию:

- **Email** - валидный формат email
- **URL** - валидный формат URL
- **Даты** - ISO 8601 формат
- **Телефоны** - формат телефона
- **Размеры файлов** - максимум 10MB для аватаров

### Защита файлов

- Файлы сохраняются в защищенном MinIO storage
- Presigned URLs имеют ограниченное время жизни (7 дней)
- Поддерживаются только изображения для аватаров
- Ограничение размера файла (10MB)

## 📱 React Hook пример

```typescript
import { useState, useEffect } from 'react';

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  // ... другие поля
}

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Определяем тип профиля по роли пользователя
      const userRole = localStorage.getItem('userRole');
      let endpoint = '';
      
      switch (userRole) {
        case 'HR':
          endpoint = '/profiles/hr';
          break;
        case 'CANDIDATE':
          endpoint = '/profiles/candidate';
          break;
        case 'UNIVERSITY':
          endpoint = '/profiles/university';
          break;
        default:
          throw new Error('Неизвестная роль пользователя');
      }
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        throw new Error('Ошибка загрузки профиля');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      setError(null);
      
      const response = await fetch('/profiles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/profiles/avatar/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        // Обновляем профиль с новым avatarId
        await updateProfile({ avatarId: result.fileName });
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAvatar = async () => {
    try {
      setError(null);
      
      const response = await fetch('/profiles/avatar/delete', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Обновляем профиль, убирая avatarId
        await updateProfile({ avatarId: null });
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar
  };
}
```

## 📊 Мониторинг и аналитика

### Отслеживание действий с профилями

```javascript
// Логирование создания профиля
function logProfileCreation(profileType, userId) {
  analytics.track('profile_created', {
    profileType,
    userId,
    timestamp: new Date().toISOString()
  });
}

// Логирование обновления профиля
function logProfileUpdate(profileType, userId, updatedFields) {
  analytics.track('profile_updated', {
    profileType,
    userId,
    updatedFields,
    timestamp: new Date().toISOString()
  });
}

// Логирование загрузки аватара
function logAvatarUpload(userId, fileSize, fileType) {
  analytics.track('avatar_uploaded', {
    userId,
    fileSize,
    fileType,
    timestamp: new Date().toISOString()
  });
}
```
