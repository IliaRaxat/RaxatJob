# Вакансии и отклики

Полное руководство по работе с вакансиями и откликами в SmartMatch API.

## 💼 Обзор

Система вакансий включает:
- Создание и управление вакансиями (HR)
- Просмотр и фильтрация вакансий (все пользователи)
- Отклики на вакансии (кандидаты)
- Модерация вакансий (администраторы/модераторы)

## 🔐 Аутентификация

Большинство операций требуют аутентификации:

```
Authorization: Bearer <JWT_TOKEN>
```

### Роли и доступ:
- **HR** - создание, редактирование, удаление своих вакансий
- **CANDIDATE** - просмотр вакансий, отклики
- **ADMIN/MODERATOR** - модерация всех вакансий
- **Все** - просмотр опубликованных вакансий

## 📝 Создание вакансии

### Эндпоинт
```
POST /jobs
```

### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `title` | string | ✅ | Название вакансии | Макс. 200 символов |
| `description` | string | ✅ | Описание | Макс. 5000 символов |
| `requirements` | string | ❌ | Требования | Макс. 3000 символов |
| `responsibilities` | string | ❌ | Обязанности | Макс. 3000 символов |
| `benefits` | string | ❌ | Преимущества | Макс. 2000 символов |
| `salaryMin` | number | ❌ | Минимальная зарплата | Минимум 0 |
| `salaryMax` | number | ❌ | Максимальная зарплата | Минимум 0 |
| `currency` | string | ❌ | Валюта | 3 символа |
| `location` | string | ✅ | Локация | Не пустое |
| `type` | enum | ✅ | Тип вакансии | `FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `CONTRACT` |
| `experienceLevel` | enum | ✅ | Уровень опыта | `ENTRY`, `JUNIOR`, `MIDDLE`, `SENIOR`, `LEAD` |
| `remote` | boolean | ❌ | Удаленная работа | true/false |
| `deadline` | string | ❌ | Дедлайн | ISO 8601 формат |
| `skillIds` | string[] | ❌ | ID навыков | Массив UUID |

### Примеры запросов

#### cURL
```bash
curl -X POST http://localhost:3000/jobs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer",
    "description": "Разработка пользовательских интерфейсов с использованием React и TypeScript",
    "requirements": "React, TypeScript, 2+ года опыта, знание HTML/CSS",
    "responsibilities": "Разработка компонентов, оптимизация производительности, работа в команде",
    "benefits": "Удаленная работа, медицинская страховка, гибкий график",
    "salaryMin": 80000,
    "salaryMax": 120000,
    "currency": "RUB",
    "location": "Москва",
    "type": "FULL_TIME",
    "experienceLevel": "MIDDLE",
    "remote": true,
    "deadline": "2024-12-31",
    "skillIds": ["skill1", "skill2"]
  }'
```

#### JavaScript (fetch)
```javascript
async function createJob(jobData) {
  const response = await fetch('/jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(jobData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const jobData = {
  title: 'Frontend Developer',
  description: 'Разработка пользовательских интерфейсов с использованием React и TypeScript',
  requirements: 'React, TypeScript, 2+ года опыта, знание HTML/CSS',
  responsibilities: 'Разработка компонентов, оптимизация производительности, работа в команде',
  benefits: 'Удаленная работа, медицинская страховка, гибкий график',
  salaryMin: 80000,
  salaryMax: 120000,
  currency: 'RUB',
  location: 'Москва',
  type: 'FULL_TIME',
  experienceLevel: 'MIDDLE',
  remote: true,
  deadline: '2024-12-31',
  skillIds: ['skill1', 'skill2']
};

createJob(jobData)
  .then(job => console.log('Вакансия создана:', job))
  .catch(error => console.error('Ошибка:', error.message));
```

#### TypeScript (axios)
```typescript
interface CreateJobData {
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  experienceLevel: 'ENTRY' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD';
  remote?: boolean;
  deadline?: string;
  skillIds?: string[];
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location: string;
  type: string;
  experienceLevel: string;
  remote: boolean;
  deadline?: string;
  status: string;
  moderationStatus: string;
  createdAt: string;
  updatedAt: string;
  hr: {
    id: string;
    firstName: string;
    lastName: string;
    company: string;
  };
  skills: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  applications?: Array<{
    id: string;
    status: string;
    appliedAt: string;
    candidate: {
      firstName: string;
      lastName: string;
    };
  }>;
}

async function createJob(data: CreateJobData): Promise<Job> {
  const response = await axios.post('/jobs', data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}
```

#### Ответ при успехе
```json
{
  "id": "job_id",
  "title": "Frontend Developer",
  "description": "Разработка пользовательских интерфейсов с использованием React и TypeScript",
  "requirements": "React, TypeScript, 2+ года опыта, знание HTML/CSS",
  "responsibilities": "Разработка компонентов, оптимизация производительности, работа в команде",
  "benefits": "Удаленная работа, медицинская страховка, гибкий график",
  "salaryMin": 80000,
  "salaryMax": 120000,
  "currency": "RUB",
  "location": "Москва",
  "type": "FULL_TIME",
  "experienceLevel": "MIDDLE",
  "remote": true,
  "deadline": "2024-12-31T00:00:00.000Z",
  "status": "DRAFT",
  "moderationStatus": "PENDING",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "hr": {
    "id": "hr_id",
    "firstName": "Иван",
    "lastName": "Петров",
    "company": "ООО Технологии"
  },
  "skills": [
    {
      "id": "skill1",
      "name": "React",
      "category": "Frontend"
    },
    {
      "id": "skill2",
      "name": "TypeScript",
      "category": "Programming"
    }
  ]
}
```

## 📋 Список вакансий

### Эндпоинт
```
GET /jobs
```

### Параметры запроса

| Параметр | Тип | Описание | Пример |
|----------|-----|----------|--------|
| `search` | string | Поиск по тексту | `frontend` |
| `type` | enum | Тип вакансии | `FULL_TIME` |
| `experienceLevel` | enum | Уровень опыта | `MIDDLE` |
| `location` | string | Локация | `Москва` |
| `remote` | boolean | Удаленная работа | `true` |
| `skills` | string | Навыки (через запятую) | `react,typescript` |
| `page` | number | Страница | `1` |
| `limit` | number | Количество на странице | `10` |
| `sortBy` | string | Сортировка | `createdAt`, `salary`, `title` |
| `sortOrder` | string | Порядок сортировки | `asc`, `desc` |

### Примеры запросов

#### cURL
```bash
# Базовый запрос
curl -X GET "http://localhost:3000/jobs"

# С фильтрами
curl -X GET "http://localhost:3000/jobs?search=frontend&location=Москва&type=FULL_TIME&page=1&limit=10"

# С навыками
curl -X GET "http://localhost:3000/jobs?skills=react,typescript&remote=true"
```

#### JavaScript (fetch)
```javascript
async function getJobs(filters = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await fetch(`/jobs?${params.toString()}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const filters = {
  search: 'frontend',
  location: 'Москва',
  type: 'FULL_TIME',
  remote: true,
  page: 1,
  limit: 10
};

getJobs(filters)
  .then(result => {
    console.log('Вакансии:', result.jobs);
    console.log('Всего:', result.total);
    console.log('Страниц:', result.totalPages);
  })
  .catch(error => console.error('Ошибка:', error.message));
```

#### TypeScript (axios)
```typescript
interface JobFilters {
  search?: string;
  type?: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  experienceLevel?: 'ENTRY' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD';
  location?: string;
  remote?: boolean;
  skills?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'salary' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function getJobs(filters: JobFilters = {}): Promise<JobsResponse> {
  const response = await axios.get('/jobs', { params: filters });
  return response.data;
}
```

#### Ответ при успехе
```json
{
  "jobs": [
    {
      "id": "job_id",
      "title": "Frontend Developer",
      "description": "Разработка пользовательских интерфейсов...",
      "location": "Москва",
      "type": "FULL_TIME",
      "experienceLevel": "MIDDLE",
      "remote": true,
      "salaryMin": 80000,
      "salaryMax": 120000,
      "currency": "RUB",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "hr": {
        "company": "ООО Технологии",
        "firstName": "Иван",
        "lastName": "Петров"
      },
      "skills": [
        {
          "id": "skill1",
          "name": "React",
          "category": "Frontend"
        }
      ]
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

## 🔍 Детали вакансии

### Эндпоинт
```
GET /jobs/:id
```

### Примеры запросов

#### cURL
```bash
curl -X GET http://localhost:3000/jobs/job_id
```

#### JavaScript (fetch)
```javascript
async function getJob(jobId) {
  const response = await fetch(`/jobs/${jobId}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
getJob('job_id')
  .then(job => console.log('Вакансия:', job))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
{
  "id": "job_id",
  "title": "Frontend Developer",
  "description": "Разработка пользовательских интерфейсов с использованием React и TypeScript",
  "requirements": "React, TypeScript, 2+ года опыта, знание HTML/CSS",
  "responsibilities": "Разработка компонентов, оптимизация производительности, работа в команде",
  "benefits": "Удаленная работа, медицинская страховка, гибкий график",
  "salaryMin": 80000,
  "salaryMax": 120000,
  "currency": "RUB",
  "location": "Москва",
  "type": "FULL_TIME",
  "experienceLevel": "MIDDLE",
  "remote": true,
  "deadline": "2024-12-31T00:00:00.000Z",
  "status": "ACTIVE",
  "moderationStatus": "APPROVED",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "hr": {
    "id": "hr_id",
    "firstName": "Иван",
    "lastName": "Петров",
    "company": "ООО Технологии",
    "phone": "+7-999-123-45-67"
  },
  "skills": [
    {
      "id": "skill1",
      "name": "React",
      "category": "Frontend",
      "description": "React library for building user interfaces"
    },
    {
      "id": "skill2",
      "name": "TypeScript",
      "category": "Programming",
      "description": "TypeScript programming language"
    }
  ],
  "applications": [
    {
      "id": "application_id",
      "status": "PENDING",
      "appliedAt": "2024-01-15T00:00:00.000Z",
      "candidate": {
        "firstName": "Анна",
        "lastName": "Смирнова"
      }
    }
  ]
}
```

## ✏️ Обновление вакансии

### Эндпоинт
```
PATCH /jobs/:id
```

### Параметры запроса (все опциональные)

| Поле | Тип | Описание |
|------|-----|----------|
| `title` | string | Название вакансии |
| `description` | string | Описание |
| `requirements` | string | Требования |
| `responsibilities` | string | Обязанности |
| `benefits` | string | Преимущества |
| `salaryMin` | number | Минимальная зарплата |
| `salaryMax` | number | Максимальная зарплата |
| `currency` | string | Валюта |
| `location` | string | Локация |
| `type` | enum | Тип вакансии |
| `experienceLevel` | enum | Уровень опыта |
| `remote` | boolean | Удаленная работа |
| `deadline` | string | Дедлайн |
| `skillIds` | string[] | ID навыков |

### Примеры запросов

#### cURL
```bash
curl -X PATCH http://localhost:3000/jobs/job_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Frontend Developer",
    "salaryMin": 100000,
    "salaryMax": 150000,
    "experienceLevel": "SENIOR"
  }'
```

#### JavaScript (fetch)
```javascript
async function updateJob(jobId, updateData) {
  const response = await fetch(`/jobs/${jobId}`, {
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
  title: 'Senior Frontend Developer',
  salaryMin: 100000,
  salaryMax: 150000,
  experienceLevel: 'SENIOR'
};

updateJob('job_id', updates)
  .then(job => console.log('Вакансия обновлена:', job))
  .catch(error => console.error('Ошибка:', error.message));
```

## 🗑️ Удаление вакансии

### Эндпоинт
```
DELETE /jobs/:id
```

### Примеры запросов

#### cURL
```bash
curl -X DELETE http://localhost:3000/jobs/job_id \
  -H "Authorization: Bearer <token>"
```

#### JavaScript (fetch)
```javascript
async function deleteJob(jobId) {
  const response = await fetch(`/jobs/${jobId}`, {
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
deleteJob('job_id')
  .then(result => console.log('Вакансия удалена:', result))
  .catch(error => console.error('Ошибка:', error.message));
```

## 📝 Отклики на вакансии

### Создание отклика

#### Эндпоинт
```
POST /applications
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание |
|------|-----|---------------|----------|
| `jobId` | string | ✅ | ID вакансии |
| `coverLetter` | string | ❌ | Сопроводительное письмо |
| `resumeUrl` | string | ❌ | URL резюме |

#### Примеры запросов

##### cURL
```bash
curl -X POST http://localhost:3000/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job_id",
    "coverLetter": "Здравствуйте! Меня заинтересовала вакансия Frontend Developer...",
    "resumeUrl": "https://example.com/resume.pdf"
  }'
```

##### JavaScript (fetch)
```javascript
async function createApplication(applicationData) {
  const response = await fetch('/applications', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(applicationData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const applicationData = {
  jobId: 'job_id',
  coverLetter: 'Здравствуйте! Меня заинтересовала вакансия Frontend Developer...',
  resumeUrl: 'https://example.com/resume.pdf'
};

createApplication(applicationData)
  .then(application => console.log('Отклик создан:', application))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
{
  "id": "application_id",
  "jobId": "job_id",
  "candidateId": "candidate_id",
  "coverLetter": "Здравствуйте! Меня заинтересовала вакансия Frontend Developer...",
  "resumeUrl": "https://example.com/resume.pdf",
  "status": "PENDING",
  "appliedAt": "2024-01-15T00:00:00.000Z",
  "job": {
    "id": "job_id",
    "title": "Frontend Developer",
    "hr": {
      "company": "ООО Технологии"
    }
  },
  "candidate": {
    "firstName": "Анна",
    "lastName": "Смирнова"
  }
}
```

### Список откликов

#### Эндпоинт
```
GET /applications
```

#### Параметры запроса

| Параметр | Тип | Описание |
|----------|-----|----------|
| `status` | enum | Статус отклика |
| `jobId` | string | ID вакансии |
| `candidateId` | string | ID кандидата |

#### Примеры запросов

##### cURL
```bash
# Все отклики
curl -X GET http://localhost:3000/applications \
  -H "Authorization: Bearer <token>"

# С фильтрами
curl -X GET "http://localhost:3000/applications?status=PENDING&jobId=job_id" \
  -H "Authorization: Bearer <token>"
```

##### JavaScript (fetch)
```javascript
async function getApplications(filters = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await fetch(`/applications?${params.toString()}`, {
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
const filters = {
  status: 'PENDING',
  jobId: 'job_id'
};

getApplications(filters)
  .then(applications => console.log('Отклики:', applications))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
[
  {
    "id": "application_id",
    "status": "PENDING",
    "coverLetter": "Здравствуйте! Меня заинтересовала вакансия...",
    "resumeUrl": "https://example.com/resume.pdf",
    "appliedAt": "2024-01-15T00:00:00.000Z",
    "job": {
      "id": "job_id",
      "title": "Frontend Developer",
      "hr": {
        "company": "ООО Технологии"
      }
    },
    "candidate": {
      "firstName": "Анна",
      "lastName": "Смирнова"
    }
  }
]
```

### Обновление статуса отклика

#### Эндпоинт
```
PATCH /applications/:id
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание |
|------|-----|---------------|----------|
| `status` | enum | ✅ | Новый статус |
| `notes` | string | ❌ | Заметки HR |

#### Статусы откликов:
- `PENDING` - Ожидает рассмотрения
- `REVIEWED` - Рассмотрен
- `ACCEPTED` - Принят
- `REJECTED` - Отклонен
- `INTERVIEW_SCHEDULED` - Запланировано собеседование
- `HIRED` - Принят на работу

#### Примеры запросов

##### cURL
```bash
curl -X PATCH http://localhost:3000/applications/application_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REVIEWED",
    "notes": "Кандидат подходит по требованиям"
  }'
```

##### JavaScript (fetch)
```javascript
async function updateApplicationStatus(applicationId, status, notes) {
  const response = await fetch(`/applications/${applicationId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ status, notes })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
updateApplicationStatus('application_id', 'REVIEWED', 'Кандидат подходит по требованиям')
  .then(application => console.log('Статус обновлен:', application))
  .catch(error => console.error('Ошибка:', error.message));
```

## 🔍 Мои вакансии (для HR)

### Эндпоинт
```
GET /jobs/my
```

### Примеры запросов

#### cURL
```bash
curl -X GET http://localhost:3000/jobs/my \
  -H "Authorization: Bearer <token>"
```

#### JavaScript (fetch)
```javascript
async function getMyJobs() {
  const response = await fetch('/jobs/my', {
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
getMyJobs()
  .then(jobs => console.log('Мои вакансии:', jobs))
  .catch(error => console.error('Ошибка:', error.message));
```

## 📊 Статусы и типы

### Типы вакансий (JobType)
- `FULL_TIME` - Полная занятость
- `PART_TIME` - Частичная занятость
- `INTERNSHIP` - Стажировка
- `CONTRACT` - Контракт

### Уровни опыта (ExperienceLevel)
- `ENTRY` - Начальный
- `JUNIOR` - Младший
- `MIDDLE` - Средний
- `SENIOR` - Старший
- `LEAD` - Ведущий

### Статусы вакансий (JobStatus)
- `DRAFT` - Черновик (не опубликована)
- `ACTIVE` - Активная (опубликована)
- `PAUSED` - Приостановлена
- `CLOSED` - Закрыта
- `ARCHIVED` - Архивирована

### Статусы модерации (ModerationStatus)
- `PENDING` - Ожидает модерации
- `APPROVED` - Одобрена
- `REJECTED` - Отклонена
- `DRAFT` - Возвращена на доработку

### Статусы откликов (ApplicationStatus)
- `PENDING` - Ожидает рассмотрения
- `REVIEWED` - Рассмотрен
- `ACCEPTED` - Принят
- `REJECTED` - Отклонен
- `INTERVIEW_SCHEDULED` - Запланировано собеседование
- `HIRED` - Принят на работу

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
  "message": "Вакансия не найдена",
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
      "field": "title",
      "message": "Название вакансии не должно превышать 200 символов"
    },
    {
      "field": "salaryMin",
      "message": "Минимальная зарплата должна быть положительным числом"
    }
  ]
}
```

### JavaScript обработка ошибок

```javascript
async function handleJobOperation(operation) {
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
          alert('Вакансия не найдена');
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

interface JobFilters {
  search?: string;
  type?: string;
  experienceLevel?: string;
  location?: string;
  remote?: boolean;
  skills?: string;
  page?: number;
  limit?: number;
}

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
  fetchJobs: (filters?: JobFilters) => Promise<void>;
  createJob: (data: CreateJobData) => Promise<void>;
  updateJob: (id: string, data: Partial<CreateJobData>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
}

export function useJobs(): UseJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchJobs = async (filters: JobFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/jobs?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);
      } else {
        throw new Error('Ошибка загрузки вакансий');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (data: CreateJobData) => {
    try {
      setError(null);
      
      const response = await fetch('/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const newJob = await response.json();
        setJobs(prev => [newJob, ...prev]);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateJob = async (id: string, data: Partial<CreateJobData>) => {
    try {
      setError(null);
      
      const response = await fetch(`/jobs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const updatedJob = await response.json();
        setJobs(prev => prev.map(job => job.id === id ? updatedJob : job));
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/jobs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setJobs(prev => prev.filter(job => job.id !== id));
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
    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob
  };
}
```

## 📊 Мониторинг и аналитика

### Отслеживание действий с вакансиями

```javascript
// Логирование создания вакансии
function logJobCreation(jobId, title, type, experienceLevel) {
  analytics.track('job_created', {
    jobId,
    title,
    type,
    experienceLevel,
    timestamp: new Date().toISOString()
  });
}

// Логирование отклика на вакансию
function logJobApplication(jobId, candidateId) {
  analytics.track('job_application', {
    jobId,
    candidateId,
    timestamp: new Date().toISOString()
  });
}

// Логирование обновления статуса отклика
function logApplicationStatusUpdate(applicationId, oldStatus, newStatus) {
  analytics.track('application_status_updated', {
    applicationId,
    oldStatus,
    newStatus,
    timestamp: new Date().toISOString()
  });
}
```
