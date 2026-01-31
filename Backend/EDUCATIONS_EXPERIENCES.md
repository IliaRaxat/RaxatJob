# Образование и опыт работы

Полное руководство по работе с образованием и опытом работы в SmartMatch API.

## 🎓 Обзор

Система позволяет кандидатам управлять:
- **Образованием** - учебные заведения, степени, специальности
- **Опытом работы** - предыдущие места работы, должности, периоды

## 🔐 Аутентификация

Все эндпоинты требуют аутентификации:

```
Authorization: Bearer <JWT_TOKEN>
```

### Доступ:
- **CANDIDATE** - полный доступ к своим записям
- **HR** - просмотр образования и опыта кандидатов
- **ADMIN** - полный доступ ко всем записям

## 📚 Образование

### Создание записи об образовании

#### Эндпоинт
```
POST /educations
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `degree` | string | ✅ | Степень | Не пустое |
| `field` | string | ✅ | Область изучения | Не пустое |
| `startDate` | string | ✅ | Дата начала | ISO 8601 формат |
| `endDate` | string | ❌ | Дата окончания | ISO 8601 формат |
| `gpa` | number | ❌ | Средний балл | 0-5 |
| `description` | string | ❌ | Описание | Максимум 1000 символов |
| `isCurrent` | boolean | ❌ | Текущее обучение | true/false |

### Примеры запросов

#### cURL
```bash
curl -X POST http://localhost:3000/educations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "degree": "Бакалавр",
    "field": "Информатика",
    "startDate": "2017-09-01",
    "endDate": "2021-06-30",
    "gpa": 4.5,
    "description": "Специализация по веб-разработке",
    "isCurrent": false
  }'
```

#### JavaScript (fetch)
```javascript
async function createEducation(educationData) {
  const response = await fetch('/educations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(educationData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const educationData = {
  degree: 'Бакалавр',
  field: 'Информатика',
  startDate: '2017-09-01',
  endDate: '2021-06-30',
  gpa: 4.5,
  description: 'Специализация по веб-разработке',
  isCurrent: false
};

createEducation(educationData)
  .then(education => console.log('Образование добавлено:', education))
  .catch(error => console.error('Ошибка:', error.message));
```

#### TypeScript (axios)
```typescript
interface CreateEducationData {
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  description?: string;
  isCurrent?: boolean;
}

interface Education {
  id: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  description?: string;
  isCurrent: boolean;
  candidateId: string;
  createdAt: string;
  updatedAt: string;
}

async function createEducation(data: CreateEducationData): Promise<Education> {
  const response = await axios.post('/educations', data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}
```

#### Ответ при успехе
```json
{
  "id": "education_id",
  "degree": "Бакалавр",
  "field": "Информатика",
  "startDate": "2017-09-01T00:00:00.000Z",
  "endDate": "2021-06-30T00:00:00.000Z",
  "gpa": 4.5,
  "description": "Специализация по веб-разработке",
  "isCurrent": false,
  "candidateId": "candidate_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Список образования

#### Эндпоинт
```
GET /educations
```

#### Примеры запросов

##### cURL
```bash
curl -X GET http://localhost:3000/educations \
  -H "Authorization: Bearer <token>"
```

##### JavaScript (fetch)
```javascript
async function getEducations() {
  const response = await fetch('/educations', {
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

// Использование
getEducations()
  .then(educations => console.log('Образование:', educations))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
[
  {
    "id": "education_id",
    "degree": "Бакалавр",
    "field": "Информатика",
    "startDate": "2017-09-01T00:00:00.000Z",
    "endDate": "2021-06-30T00:00:00.000Z",
    "gpa": 4.5,
    "description": "Специализация по веб-разработке",
    "isCurrent": false,
    "candidateId": "candidate_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "education_id_2",
    "degree": "Магистр",
    "field": "Компьютерные науки",
    "startDate": "2021-09-01T00:00:00.000Z",
    "endDate": null,
    "gpa": 4.8,
    "description": "Специализация по машинному обучению",
    "isCurrent": true,
    "candidateId": "candidate_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Получение конкретной записи

#### Эндпоинт
```
GET /educations/:id
```

#### Пример
```bash
curl -X GET http://localhost:3000/educations/education_id \
  -H "Authorization: Bearer <token>"
```

### Обновление образования

#### Эндпоинт
```
PATCH /educations/:id
```

#### Параметры запроса (все опциональные)

| Поле | Тип | Описание |
|------|-----|----------|
| `degree` | string | Степень |
| `field` | string | Область изучения |
| `startDate` | string | Дата начала |
| `endDate` | string | Дата окончания |
| `gpa` | number | Средний балл |
| `description` | string | Описание |
| `isCurrent` | boolean | Текущее обучение |

#### Примеры запросов

##### cURL
```bash
curl -X PATCH http://localhost:3000/educations/education_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "gpa": 4.7,
    "description": "Обновленное описание специализации"
  }'
```

##### JavaScript (fetch)
```javascript
async function updateEducation(educationId, updateData) {
  const response = await fetch(`/educations/${educationId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(updateData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const updates = {
  gpa: 4.7,
  description: 'Обновленное описание специализации'
};

updateEducation('education_id', updates)
  .then(education => console.log('Образование обновлено:', education))
  .catch(error => console.error('Ошибка:', error.message));
```

### Удаление образования

#### Эндпоинт
```
DELETE /educations/:id
```

#### Примеры запросов

##### cURL
```bash
curl -X DELETE http://localhost:3000/educations/education_id \
  -H "Authorization: Bearer <token>"
```

##### JavaScript (fetch)
```javascript
async function deleteEducation(educationId) {
  const response = await fetch(`/educations/${educationId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
deleteEducation('education_id')
  .then(result => console.log('Образование удалено:', result))
  .catch(error => console.error('Ошибка:', error.message));
```

## 💼 Опыт работы

### Создание записи об опыте

#### Эндпоинт
```
POST /experiences
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `company` | string | ✅ | Компания | Не пустое |
| `position` | string | ✅ | Должность | Не пустое |
| `startDate` | string | ✅ | Дата начала | ISO 8601 формат |
| `endDate` | string | ❌ | Дата окончания | ISO 8601 формат |
| `description` | string | ❌ | Описание | Максимум 2000 символов |
| `isCurrent` | boolean | ❌ | Текущая работа | true/false |

### Примеры запросов

#### cURL
```bash
curl -X POST http://localhost:3000/experiences \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "ООО Веб-Студия",
    "position": "Frontend Developer",
    "startDate": "2021-06-01",
    "endDate": "2024-01-01",
    "description": "Разработка пользовательских интерфейсов с использованием React и TypeScript",
    "isCurrent": false
  }'
```

#### JavaScript (fetch)
```javascript
async function createExperience(experienceData) {
  const response = await fetch('/experiences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(experienceData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const experienceData = {
  company: 'ООО Веб-Студия',
  position: 'Frontend Developer',
  startDate: '2021-06-01',
  endDate: '2024-01-01',
  description: 'Разработка пользовательских интерфейсов с использованием React и TypeScript',
  isCurrent: false
};

createExperience(experienceData)
  .then(experience => console.log('Опыт добавлен:', experience))
  .catch(error => console.error('Ошибка:', error.message));
```

#### TypeScript (axios)
```typescript
interface CreateExperienceData {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrent?: boolean;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrent: boolean;
  candidateId: string;
  createdAt: string;
  updatedAt: string;
}

async function createExperience(data: CreateExperienceData): Promise<Experience> {
  const response = await axios.post('/experiences', data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}
```

#### Ответ при успехе
```json
{
  "id": "experience_id",
  "company": "ООО Веб-Студия",
  "position": "Frontend Developer",
  "startDate": "2021-06-01T00:00:00.000Z",
  "endDate": "2024-01-01T00:00:00.000Z",
  "description": "Разработка пользовательских интерфейсов с использованием React и TypeScript",
  "isCurrent": false,
  "candidateId": "candidate_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Список опыта

#### Эндпоинт
```
GET /experiences
```

#### Примеры запросов

##### cURL
```bash
curl -X GET http://localhost:3000/experiences \
  -H "Authorization: Bearer <token>"
```

##### JavaScript (fetch)
```javascript
async function getExperiences() {
  const response = await fetch('/experiences', {
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

// Использование
getExperiences()
  .then(experiences => console.log('Опыт работы:', experiences))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
[
  {
    "id": "experience_id",
    "company": "ООО Веб-Студия",
    "position": "Frontend Developer",
    "startDate": "2021-06-01T00:00:00.000Z",
    "endDate": "2024-01-01T00:00:00.000Z",
    "description": "Разработка пользовательских интерфейсов с использованием React и TypeScript",
    "isCurrent": false,
    "candidateId": "candidate_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "experience_id_2",
    "company": "ООО Технологии",
    "position": "Senior Frontend Developer",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": null,
    "description": "Руководство командой разработки, архитектура приложений",
    "isCurrent": true,
    "candidateId": "candidate_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Получение конкретной записи

#### Эндпоинт
```
GET /experiences/:id
```

#### Пример
```bash
curl -X GET http://localhost:3000/experiences/experience_id \
  -H "Authorization: Bearer <token>"
```

### Обновление опыта

#### Эндпоинт
```
PATCH /experiences/:id
```

#### Параметры запроса (все опциональные)

| Поле | Тип | Описание |
|------|-----|----------|
| `company` | string | Компания |
| `position` | string | Должность |
| `startDate` | string | Дата начала |
| `endDate` | string | Дата окончания |
| `description` | string | Описание |
| `isCurrent` | boolean | Текущая работа |

#### Примеры запросов

##### cURL
```bash
curl -X PATCH http://localhost:3000/experiences/experience_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Senior Frontend Developer",
    "description": "Обновленное описание должности"
  }'
```

##### JavaScript (fetch)
```javascript
async function updateExperience(experienceId, updateData) {
  const response = await fetch(`/experiences/${experienceId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(updateData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const updates = {
  position: 'Senior Frontend Developer',
  description: 'Обновленное описание должности'
};

updateExperience('experience_id', updates)
  .then(experience => console.log('Опыт обновлен:', experience))
  .catch(error => console.error('Ошибка:', error.message));
```

### Удаление опыта

#### Эндпоинт
```
DELETE /experiences/:id
```

#### Примеры запросов

##### cURL
```bash
curl -X DELETE http://localhost:3000/experiences/experience_id \
  -H "Authorization: Bearer <token>"
```

##### JavaScript (fetch)
```javascript
async function deleteExperience(experienceId) {
  const response = await fetch(`/experiences/${experienceId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
deleteExperience('experience_id')
  .then(result => console.log('Опыт удален:', result))
  .catch(error => console.error('Ошибка:', error.message));
```

## 📅 Форматирование дат

### Поддерживаемые форматы

Все даты должны быть в формате ISO 8601:

#### Примеры валидных дат:
- `2024-01-15` - дата без времени
- `2024-01-15T10:30:00` - дата с временем
- `2024-01-15T10:30:00.000Z` - дата с временем и UTC

#### JavaScript примеры:

```javascript
// Создание даты
const startDate = new Date('2024-01-15').toISOString();
// Результат: "2024-01-15T00:00:00.000Z"

// Текущая дата
const currentDate = new Date().toISOString();
// Результат: "2024-01-15T10:30:00.000Z"

// Форматирование для отображения
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Пример использования
const formattedDate = formatDate('2024-01-15T00:00:00.000Z');
// Результат: "15 января 2024 г."
```

#### TypeScript примеры:

```typescript
// Типы для дат
interface DateRange {
  startDate: string;
  endDate?: string;
}

// Валидация дат
function validateDateRange(startDate: string, endDate?: string): boolean {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  if (isNaN(start.getTime())) {
    return false;
  }
  
  if (end && (isNaN(end.getTime()) || end <= start)) {
    return false;
  }
  
  return true;
}

// Вычисление продолжительности
function calculateDuration(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  if (years > 0) {
    return `${years} г. ${months} мес.`;
  } else {
    return `${months} мес.`;
  }
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
  "message": "Недостаточно прав для выполнения операции",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Запись не найдена",
  "error": "Not Found"
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
      "field": "startDate",
      "message": "Дата начала должна быть в формате ISO 8601"
    },
    {
      "field": "gpa",
      "message": "Средний балл должен быть от 0 до 5"
    }
  ]
}
```

### JavaScript обработка ошибок

```javascript
async function handleEducationExperienceOperation(operation) {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          window.location.href = '/login';
          break;
        case 403:
          alert('У вас нет прав для выполнения этого действия');
          break;
        case 404:
          alert('Запись не найдена');
          break;
        case 400:
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
      alert('Ошибка сети. Проверьте подключение к интернету.');
    }
    
    throw error;
  }
}
```

## 📱 React Hook пример

```typescript
import { useState, useEffect } from 'react';

interface Education {
  id: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  description?: string;
  isCurrent: boolean;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrent: boolean;
}

interface UseEducationExperienceReturn {
  educations: Education[];
  experiences: Experience[];
  loading: boolean;
  error: string | null;
  addEducation: (data: Omit<Education, 'id'>) => Promise<void>;
  updateEducation: (id: string, data: Partial<Education>) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  addExperience: (data: Omit<Experience, 'id'>) => Promise<void>;
  updateExperience: (id: string, data: Partial<Experience>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
}

export function useEducationExperience(): UseEducationExperienceReturn {
  const [educations, setEducations] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEducations = async () => {
    try {
      const response = await fetch('/educations', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEducations(data);
      } else {
        throw new Error('Ошибка загрузки образования');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/experiences', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setExperiences(data);
      } else {
        throw new Error('Ошибка загрузки опыта');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const addEducation = async (data: Omit<Education, 'id'>) => {
    try {
      setError(null);
      
      const response = await fetch('/educations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const newEducation = await response.json();
        setEducations(prev => [...prev, newEducation]);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEducation = async (id: string, data: Partial<Education>) => {
    try {
      setError(null);
      
      const response = await fetch(`/educations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const updatedEducation = await response.json();
        setEducations(prev => prev.map(edu => edu.id === id ? updatedEducation : edu));
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEducation = async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/educations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setEducations(prev => prev.filter(edu => edu.id !== id));
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addExperience = async (data: Omit<Experience, 'id'>) => {
    try {
      setError(null);
      
      const response = await fetch('/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const newExperience = await response.json();
        setExperiences(prev => [...prev, newExperience]);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateExperience = async (id: string, data: Partial<Experience>) => {
    try {
      setError(null);
      
      const response = await fetch(`/experiences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const updatedExperience = await response.json();
        setExperiences(prev => prev.map(exp => exp.id === id ? updatedExperience : exp));
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/experiences/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setExperiences(prev => prev.filter(exp => exp.id !== id));
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
    setLoading(true);
    Promise.all([fetchEducations(), fetchExperiences()])
      .finally(() => setLoading(false));
  }, []);

  return {
    educations,
    experiences,
    loading,
    error,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience
  };
}
```

## 📊 Мониторинг и аналитика

### Отслеживание действий с образованием и опытом

```javascript
// Логирование добавления образования
function logEducationAdded(educationId, degree, field) {
  analytics.track('education_added', {
    educationId,
    degree,
    field,
    timestamp: new Date().toISOString()
  });
}

// Логирование добавления опыта
function logExperienceAdded(experienceId, company, position) {
  analytics.track('experience_added', {
    experienceId,
    company,
    position,
    timestamp: new Date().toISOString()
  });
}

// Логирование обновления записи
function logRecordUpdated(recordType, recordId, updatedFields) {
  analytics.track(`${recordType}_updated`, {
    recordId,
    updatedFields,
    timestamp: new Date().toISOString()
  });
}
```

## 🔒 Безопасность

### Проверка прав доступа

- **CANDIDATE** - полный доступ к своим записям
- **HR** - просмотр образования и опыта кандидатов при рассмотрении откликов
- **ADMIN** - полный доступ ко всем записям

### Валидация данных

- **Даты** - ISO 8601 формат, логическая последовательность
- **GPA** - диапазон от 0 до 5
- **Текстовые поля** - ограничения по длине
- **Обязательные поля** - проверка на пустоту

### Защита от дублирования

Система предотвращает создание дублирующих записей:
- Проверка на одинаковые периоды работы
- Валидация пересекающихся дат
- Предупреждения о потенциальных дубликатах
