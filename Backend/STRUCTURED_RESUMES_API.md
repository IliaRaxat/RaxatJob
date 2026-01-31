# 📄 API для структурированных резюме

## 🎯 Обзор новой системы

Система резюме была полностью переработана для поддержки структурированных данных вместо файлов. Теперь каждое резюме - это объект с полями опыта работы, навыков, образования и других данных.

### ✨ Основные возможности

- **Множественные резюме** - пользователь может создать несколько резюме
- **Структурированные данные** - опыт, навыки, образование хранятся в JSON
- **Основное резюме** - одно резюме может быть помечено как основное
- **Публичность** - резюме может быть публичным или приватным
- **Дублирование** - возможность копировать существующие резюме

## 🏗️ Структура данных

### Модель Resume

```typescript
interface Resume {
  id: string;
  candidateId: string;
  title: string;                    // Название резюме
  summary?: string;                 // Краткое описание о себе
  objective?: string;               // Цель поиска работы
  skills?: ResumeSkill[];          // Навыки
  experiences?: ResumeExperience[]; // Опыт работы
  educations?: ResumeEducation[];   // Образование
  projects?: ResumeProject[];       // Проекты
  achievements?: ResumeAchievement[]; // Достижения
  languages?: ResumeLanguage[];     // Языки
  certifications?: ResumeCertification[]; // Сертификаты
  isDefault: boolean;              // Основное резюме
  isPublic: boolean;               // Публичное резюме
  createdAt: Date;
  updatedAt: Date;
}
```

### Структуры данных

#### Навыки (ResumeSkill)
```typescript
interface ResumeSkill {
  name: string;        // Название навыка
  level: number;        // Уровень 1-5
  category?: string;    // Категория навыка
}
```

#### Опыт работы (ResumeExperience)
```typescript
interface ResumeExperience {
  company: string;      // Компания
  position: string;      // Должность
  startDate: string;     // Дата начала
  endDate?: string;      // Дата окончания
  isCurrent: boolean;    // Текущая работа
  description?: string;  // Описание
  achievements?: string[]; // Достижения
  technologies?: string[]; // Технологии
}
```

#### Образование (ResumeEducation)
```typescript
interface ResumeEducation {
  institution: string;   // Учебное заведение
  degree: string;        // Степень
  field: string;         // Специальность
  startDate: string;     // Дата начала
  endDate?: string;      // Дата окончания
  isCurrent: boolean;    // Текущее обучение
  gpa?: number;         // Средний балл
  description?: string; // Описание
}
```

#### Проекты (ResumeProject)
```typescript
interface ResumeProject {
  name: string;          // Название проекта
  description: string;   // Описание
  startDate: string;     // Дата начала
  endDate?: string;      // Дата окончания
  isCurrent: boolean;    // Текущий проект
  technologies: string[]; // Технологии
  url?: string;         // Ссылка на проект
  githubUrl?: string;   // Ссылка на GitHub
}
```

## 🚀 API Endpoints

### 1. Создание резюме

```http
POST /resumes
Authorization: Bearer <candidate_jwt_token>
Content-Type: application/json

{
  "title": "Frontend Developer",
  "summary": "Опытный разработчик с 5+ лет опыта",
  "objective": "Ищу позицию Senior Frontend Developer",
  "skills": [
    {
      "name": "JavaScript",
      "level": 5,
      "category": "Programming"
    },
    {
      "name": "React",
      "level": 4,
      "category": "Framework"
    }
  ],
  "experiences": [
    {
      "company": "Tech Corp",
      "position": "Senior Frontend Developer",
      "startDate": "2020-01-01",
      "endDate": "2023-12-31",
      "isCurrent": false,
      "description": "Разработка веб-приложений",
      "achievements": ["Увеличил производительность на 40%"],
      "technologies": ["React", "TypeScript", "Node.js"]
    }
  ],
  "educations": [
    {
      "institution": "МГУ",
      "degree": "Бакалавр",
      "field": "Компьютерные науки",
      "startDate": "2016-09-01",
      "endDate": "2020-06-30",
      "isCurrent": false,
      "gpa": 4.5
    }
  ],
  "isDefault": true,
  "isPublic": true
}
```

### 2. Получение списка резюме

```http
GET /resumes?page=1&limit=10&search=frontend&isDefault=true
Authorization: Bearer <candidate_jwt_token>
```

**Параметры запроса:**
- `page` - номер страницы (по умолчанию 1)
- `limit` - количество на странице (по умолчанию 10)
- `search` - поиск по названию и описанию
- `isDefault` - фильтр по основному резюме
- `isPublic` - фильтр по публичности
- `sortBy` - поле для сортировки (по умолчанию createdAt)
- `sortOrder` - порядок сортировки (asc/desc)

### 3. Получение резюме по ID

```http
GET /resumes/{id}
Authorization: Bearer <candidate_jwt_token>
```

### 4. Получение основного резюме

```http
GET /resumes/default
Authorization: Bearer <candidate_jwt_token>
```

### 5. Обновление резюме

```http
PUT /resumes/{id}
Authorization: Bearer <candidate_jwt_token>
Content-Type: application/json

{
  "title": "Updated Resume Title",
  "summary": "Обновленное описание",
  "skills": [
    {
      "name": "Vue.js",
      "level": 3,
      "category": "Framework"
    }
  ]
}
```

### 6. Удаление резюме

```http
DELETE /resumes/{id}
Authorization: Bearer <candidate_jwt_token>
```

### 7. Установка основного резюме

```http
POST /resumes/{id}/set-default
Authorization: Bearer <candidate_jwt_token>
```

### 8. Дублирование резюме

```http
POST /resumes/{id}/duplicate
Authorization: Bearer <candidate_jwt_token>
Content-Type: application/json

{
  "title": "Copy of Frontend Developer Resume"
}
```

## 📋 Примеры использования

### JavaScript (fetch)

```javascript
// Создание резюме
async function createResume(resumeData, token) {
  const response = await fetch('/resumes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(resumeData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
}

// Получение списка резюме
async function getResumes(token, filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/resumes?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}

// Обновление резюме
async function updateResume(resumeId, updateData, token) {
  const response = await fetch(`/resumes/${resumeId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  return response.json();
}

// Дублирование резюме
async function duplicateResume(resumeId, newTitle, token) {
  const response = await fetch(`/resumes/${resumeId}/duplicate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: newTitle })
  });
  
  return response.json();
}
```

### React Hook пример

```typescript
import { useState, useEffect } from 'react';

interface UseResumesReturn {
  resumes: Resume[];
  loading: boolean;
  error: string | null;
  createResume: (data: CreateResumeDto) => Promise<Resume>;
  updateResume: (id: string, data: UpdateResumeDto) => Promise<Resume>;
  deleteResume: (id: string) => Promise<void>;
  setDefaultResume: (id: string) => Promise<Resume>;
  duplicateResume: (id: string, title: string) => Promise<Resume>;
}

export function useResumes(): UseResumesReturn {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createResume = async (data: CreateResumeDto): Promise<Resume> => {
    try {
      setLoading(true);
      const response = await fetch('/resumes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to create resume');
      
      const newResume = await response.json();
      setResumes(prev => [...prev, newResume]);
      return newResume;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateResume = async (id: string, data: UpdateResumeDto): Promise<Resume> => {
    try {
      setLoading(true);
      const response = await fetch(`/resumes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to update resume');
      
      const updatedResume = await response.json();
      setResumes(prev => prev.map(r => r.id === id ? updatedResume : r));
      return updatedResume;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`/resumes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete resume');
      
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultResume = async (id: string): Promise<Resume> => {
    try {
      setLoading(true);
      const response = await fetch(`/resumes/${id}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to set default resume');
      
      const updatedResume = await response.json();
      setResumes(prev => prev.map(r => ({
        ...r,
        isDefault: r.id === id
      })));
      return updatedResume;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const duplicateResume = async (id: string, title: string): Promise<Resume> => {
    try {
      setLoading(true);
      const response = await fetch(`/resumes/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      
      if (!response.ok) throw new Error('Failed to duplicate resume');
      
      const duplicatedResume = await response.json();
      setResumes(prev => [...prev, duplicatedResume]);
      return duplicatedResume;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    resumes,
    loading,
    error,
    createResume,
    updateResume,
    deleteResume,
    setDefaultResume,
    duplicateResume
  };
}
```

## ✅ Ответы API

### Успешное создание резюме
```json
{
  "id": "resume_123",
  "candidateId": "candidate_456",
  "title": "Frontend Developer",
  "summary": "Опытный разработчик с 5+ лет опыта",
  "objective": "Ищу позицию Senior Frontend Developer",
  "skills": [
    {
      "name": "JavaScript",
      "level": 5,
      "category": "Programming"
    }
  ],
  "experiences": [
    {
      "company": "Tech Corp",
      "position": "Senior Frontend Developer",
      "startDate": "2020-01-01",
      "endDate": "2023-12-31",
      "isCurrent": false,
      "description": "Разработка веб-приложений",
      "achievements": ["Увеличил производительность на 40%"],
      "technologies": ["React", "TypeScript", "Node.js"]
    }
  ],
  "isDefault": true,
  "isPublic": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Список резюме
```json
{
  "resumes": [
    {
      "id": "resume_123",
      "title": "Frontend Developer",
      "isDefault": true,
      "isPublic": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

## ❌ Обработка ошибок

### 400 - Неверные данные
```json
{
  "statusCode": 400,
  "message": "Title is required",
  "error": "Bad Request"
}
```

### 401 - Не авторизован
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 - Не кандидат
```json
{
  "statusCode": 403,
  "message": "Only candidates can manage resumes",
  "error": "Forbidden"
}
```

### 404 - Резюме не найдено
```json
{
  "statusCode": 404,
  "message": "Resume not found",
  "error": "Not Found"
}
```

## 🔄 Интеграция с откликами

Теперь при создании отклика на вакансию система автоматически использует основное резюме кандидата:

```typescript
// При создании отклика
const application = await this.applicationsService.createApplication({
  jobId: 'job_123',
  candidateId: 'candidate_456',
  resumeId: 'resume_789', // Автоматически основное резюме
  coverLetter: 'Мой опыт работы...'
});
```

## 🎯 Преимущества новой системы

1. **Структурированные данные** - легче анализировать и искать
2. **Множественные резюме** - разные резюме для разных позиций
3. **Автоматическое прикрепление** - основное резюме автоматически прикрепляется к откликам
4. **Гибкость** - можно легко обновлять отдельные секции
5. **Поиск и фильтрация** - мощные возможности поиска по содержимому
6. **Дублирование** - быстрое создание вариаций резюме

## 🚀 Миграция с файловой системы

Старые файловые резюме остаются в системе, но новые отклики будут использовать структурированные резюме. Пользователи могут:

1. Создать новое структурированное резюме
2. Скопировать данные из старого файлового резюме
3. Удалить старое файловое резюме
4. Использовать новое структурированное резюме для откликов
