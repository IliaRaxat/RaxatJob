# 📄 Полная документация API для структурированных резюме

## 🎯 Что это такое?

Система структурированных резюме позволяет кандидатам создавать детальные резюме с разделами: навыки, опыт работы, образование, проекты, достижения, языки и сертификаты. 

**Главное преимущество**: можно создавать резюме поэтапно - начать с минимума и постепенно дополнять!

## 🚀 Быстрый старт

### Минимальное создание резюме
```json
POST /resumes
{
  "title": "Frontend Developer"
}
```

### Поэтапное заполнение
```json
// 1. Создаем базовое резюме
POST /resumes
{
  "title": "Frontend Developer",
  "isDefault": true
}

// 2. Добавляем основную информацию
PUT /resumes/{id}
{
  "summary": "Опытный разработчик с 5+ лет опыта",
  "objective": "Ищу позицию Senior Developer"
}

// 3. Добавляем навыки
PUT /resumes/{id}
{
  "skills": [
    { "name": "JavaScript", "level": 5, "category": "Programming" },
    { "name": "React", "level": 4, "category": "Framework" }
  ]
}

// 4. Добавляем опыт работы
PUT /resumes/{id}
{
  "experiences": [
    {
      "company": "TechCorp",
      "position": "Senior Developer",
      "startDate": "2021-01-01",
      "endDate": "2024-01-01",
      "isCurrent": false,
      "description": "Разработка веб-приложений"
    }
  ]
}
```

## 🔐 Аутентификация

Все эндпоинты (кроме публичных) требуют JWT токен:

```http
Authorization: Bearer <candidate_jwt_token>
```

**Роли доступа:**
- `CANDIDATE` - полный доступ к своим резюме
- `ADMIN` - доступ ко всем резюме  
- `HR` - доступ к публичным резюме

## 📋 Основные операции

### 1. Создание резюме

**Минимальный запрос:**
```http
POST /resumes
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Frontend Developer"
}
```

**Полный запрос:**
```http
POST /resumes
Content-Type: application/json
Authorization: Bearer <token>

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
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Полнофункциональная платформа для онлайн-торговли",
      "startDate": "2023-01-01",
      "endDate": "2023-08-31", 
      "isCurrent": false,
      "technologies": ["React", "TypeScript", "Node.js"],
      "url": "https://ecommerce-demo.com",
      "githubUrl": "https://github.com/user/ecommerce"
    }
  ],
  "achievements": [
    {
      "title": "Лучший разработчик года",
      "description": "Награда за выдающиеся достижения",
      "date": "2023-12-15",
      "category": "Professional"
    }
  ],
  "languages": [
    {
      "name": "Русский",
      "level": "Native"
    },
    {
      "name": "Английский", 
      "level": "Fluent",
      "certification": "IELTS 7.5"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Developer",
      "issuer": "Amazon Web Services",
      "date": "2023-03-15",
      "credentialId": "AWS-DEV-123456",
      "url": "https://aws.amazon.com/certification/"
    }
  ],
  "isDefault": true,
  "isPublic": true
}
```

**Ответ:**
```json
{
  "id": "resume_123",
  "candidateId": "candidate_456", 
  "title": "Frontend Developer",
  "summary": "Опытный разработчик с 5+ лет опыта",
  "objective": "Ищу позицию Senior Frontend Developer",
  "skills": [...],
  "experiences": [...],
  "educations": [...],
  "projects": [...],
  "achievements": [...],
  "languages": [...],
  "certifications": [...],
  "isDefault": true,
  "isPublic": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Получение списка резюме

```http
GET /resumes?page=1&limit=10&search=frontend&isDefault=true&isPublic=true&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <token>
```

**Параметры запроса:**
- `page` (number, optional) - номер страницы (по умолчанию 1)
- `limit` (number, optional) - количество на странице (по умолчанию 10)
- `search` (string, optional) - поиск по названию и описанию
- `isDefault` (boolean, optional) - фильтр по основному резюме
- `isPublic` (boolean, optional) - фильтр по публичности
- `sortBy` (string, optional) - поле для сортировки (по умолчанию createdAt)
- `sortOrder` (string, optional) - порядок сортировки: asc/desc (по умолчанию desc)

**Ответ:**
```json
{
  "resumes": [
    {
      "id": "resume_123",
      "candidateId": "candidate_456",
      "title": "Frontend Developer", 
      "summary": "Опытный разработчик с 5+ лет опыта",
      "isDefault": true,
      "isPublic": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### 3. Получение резюме по ID

```http
GET /resumes/{id}
Authorization: Bearer <token>
```

**Ответ:** Полный объект резюме (как в создании)

### 4. Получение основного резюме

```http
GET /resumes/default
Authorization: Bearer <token>
```

**Ответ:** Полный объект основного резюме или null

### 5. Обновление резюме

```http
PUT /resumes/{id}
Content-Type: application/json
Authorization: Bearer <token>
```

**Тело запроса:** Частичные данные для обновления (все поля опциональны)

```json
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

**Ответ:** Обновленный объект резюме

### 6. Удаление резюме

```http
DELETE /resumes/{id}
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "message": "Resume deleted successfully"
}
```

### 7. Установка основного резюме

```http
POST /resumes/{id}/set-default
Authorization: Bearer <token>
```

**Ответ:** Обновленный объект резюме

### 8. Дублирование резюме

```http
POST /resumes/{id}/duplicate
Content-Type: application/json
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "title": "Copy of Frontend Developer Resume"
}
```

**Ответ:** Новый объект резюме

## 🔍 Дополнительные возможности

### 9. Поиск резюме

```http
GET /resumes/search?q=frontend&page=1&limit=10
Authorization: Bearer <token>
```

**Параметры:**
- `q` (string, required) - поисковый запрос
- `page` (number, optional) - номер страницы
- `limit` (number, optional) - количество на странице

**Ответ:** Список найденных резюме

### 10. Публичные резюме

```http
GET /resumes/public?page=1&limit=10&search=developer
```

**Особенности:**
- Не требует аутентификации
- Возвращает только публичные резюме
- Доступно для всех пользователей

**Ответ:** Список публичных резюме

### 11. Статистика резюме

```http
GET /resumes/stats
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "totalResumes": 5,
  "publicResumes": 3,
  "privateResumes": 2,
  "hasDefault": true,
  "defaultResumeTitle": "Frontend Developer",
  "recentResumes": [
    {
      "id": "resume_123",
      "title": "Frontend Developer",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isDefault": true
    }
  ]
}
```

### 12. Массовое обновление

```http
POST /resumes/bulk-update
Content-Type: application/json
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "resumeIds": ["resume_1", "resume_2", "resume_3"],
  "updates": {
    "isPublic": false,
    "summary": "Обновленное описание для всех резюме"
  }
}
```

**Ответ:**
```json
{
  "updated": 3,
  "resumes": [
    {
      "id": "resume_1",
      "title": "Resume 1",
      "isPublic": false,
      "summary": "Обновленное описание для всех резюме"
    }
  ]
}
```

### 13. Экспорт резюме

```http
POST /resumes/export/{id}
Content-Type: application/json
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "format": "json"
}
```

**Поддерживаемые форматы:**
- `json` - JSON формат (реализован)
- `pdf` - PDF документ (планируется)
- `docx` - Word документ (планируется)

**Ответ (JSON):**
```json
{
  "format": "json",
  "data": {
    "id": "resume_123",
    "title": "Frontend Developer",
    "summary": "Опытный разработчик с 5+ лет опыта",
    // ... полные данные резюме
  },
  "exportedAt": "2024-01-15T10:30:00.000Z"
}
```

### 14. Импорт резюме

```http
POST /resumes/import
Content-Type: application/json
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "title": "Imported Resume",
  "resumeData": {
    "summary": "Импортированное резюме",
    "skills": [
      {
        "name": "JavaScript",
        "level": 5,
        "category": "Programming"
      }
    ],
    "experiences": [
      {
        "company": "Company",
        "position": "Developer",
        "startDate": "2020-01-01",
        "endDate": "2023-12-31",
        "isCurrent": false,
        "description": "Work description"
      }
    ]
  }
}
```

**Ответ:** Созданный объект резюме

### 15. Шаблоны резюме

```http
GET /resumes/templates
```

**Ответ:**
```json
{
  "templates": [
    {
      "id": "frontend-developer",
      "name": "Frontend Developer",
      "description": "Шаблон для frontend разработчиков",
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
          "company": "Your Company",
          "position": "Frontend Developer",
          "startDate": "2020-01-01",
          "endDate": "2023-12-31",
          "isCurrent": false,
          "description": "Разработка веб-приложений",
          "technologies": ["React", "TypeScript", "Node.js"]
        }
      ]
    },
    {
      "id": "data-scientist",
      "name": "Data Scientist",
      "description": "Шаблон для data scientists",
      "skills": [
        {
          "name": "Python",
          "level": 5,
          "category": "Programming"
        },
        {
          "name": "Machine Learning",
          "level": 4,
          "category": "AI/ML"
        }
      ]
    },
    {
      "id": "backend-developer",
      "name": "Backend Developer",
      "description": "Шаблон для backend разработчиков",
      "skills": [
        {
          "name": "Node.js",
          "level": 5,
          "category": "Backend"
        },
        {
          "name": "Python",
          "level": 4,
          "category": "Programming"
        }
      ]
    }
  ]
}
```

### 16. Создание резюме из шаблона

```http
POST /resumes/from-template
Content-Type: application/json
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "templateId": "frontend-developer",
  "title": "My Frontend Resume"
}
```

**Ответ:** Созданный объект резюме на основе шаблона

## 📊 Структуры данных

### ResumeSkill
```typescript
interface ResumeSkill {
  name: string;        // Название навыка
  level: number;        // Уровень 1-5
  category?: string;    // Категория навыка
}
```

### ResumeExperience
```typescript
interface ResumeExperience {
  company: string;      // Компания
  position: string;      // Должность
  startDate: string;     // Дата начала (YYYY-MM-DD)
  endDate?: string;      // Дата окончания (YYYY-MM-DD)
  isCurrent: boolean;    // Текущая работа
  description?: string;  // Описание
  achievements?: string[]; // Достижения
  technologies?: string[]; // Технологии
}
```

### ResumeEducation
```typescript
interface ResumeEducation {
  institution: string;   // Учебное заведение
  degree: string;        // Степень
  field: string;         // Специальность
  startDate: string;     // Дата начала (YYYY-MM-DD)
  endDate?: string;      // Дата окончания (YYYY-MM-DD)
  isCurrent: boolean;    // Текущее обучение
  gpa?: number;         // Средний балл
  description?: string; // Описание
}
```

### ResumeProject
```typescript
interface ResumeProject {
  name: string;          // Название проекта
  description: string;   // Описание
  startDate: string;     // Дата начала (YYYY-MM-DD)
  endDate?: string;      // Дата окончания (YYYY-MM-DD)
  isCurrent: boolean;    // Текущий проект
  technologies: string[]; // Технологии
  url?: string;         // Ссылка на проект
  githubUrl?: string;   // Ссылка на GitHub
}
```

### ResumeAchievement
```typescript
interface ResumeAchievement {
  title: string;         // Название достижения
  description: string;   // Описание
  date: string;          // Дата (YYYY-MM-DD)
  category?: string;     // Категория
}
```

### ResumeLanguage
```typescript
interface ResumeLanguage {
  name: string;          // Название языка
  level: string;         // Уровень (Native, Fluent, Intermediate, Basic)
  certification?: string; // Сертификат
}
```

### ResumeCertification
```typescript
interface ResumeCertification {
  name: string;          // Название сертификата
  issuer: string;        // Организация
  date: string;          // Дата получения (YYYY-MM-DD)
  expiryDate?: string;   // Дата истечения (YYYY-MM-DD)
  credentialId?: string; // ID сертификата
  url?: string;         // Ссылка на сертификат
}
```

## ❌ Обработка ошибок

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Title is required",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only candidates can manage resumes",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resume not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Cannot delete the last resume",
  "error": "Conflict"
}
```

## 🔧 Примеры использования

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

// Поиск резюме
async function searchResumes(query, token) {
  const response = await fetch(`/resumes/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}

// Массовое обновление
async function bulkUpdateResumes(resumeIds, updates, token) {
  const response = await fetch('/resumes/bulk-update', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      resumeIds,
      updates
    })
  });
  
  return response.json();
}

// Экспорт резюме
async function exportResume(resumeId, format = 'json', token) {
  const response = await fetch(`/resumes/export/${resumeId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ format })
  });
  
  return response.json();
}
```

### cURL примеры

```bash
# Создание резюме
curl -X POST http://localhost:3000/resumes \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer",
    "summary": "Опытный разработчик",
    "skills": [
      {
        "name": "JavaScript",
        "level": 5,
        "category": "Programming"
      }
    ],
    "isDefault": true,
    "isPublic": true
  }'

# Получение списка резюме
curl -X GET "http://localhost:3000/resumes?page=1&limit=10" \
  -H "Authorization: Bearer your_token"

# Поиск резюме
curl -X GET "http://localhost:3000/resumes/search?q=frontend" \
  -H "Authorization: Bearer your_token"

# Получение статистики
curl -X GET http://localhost:3000/resumes/stats \
  -H "Authorization: Bearer your_token"

# Экспорт резюме
curl -X POST http://localhost:3000/resumes/export/resume_123 \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"format": "json"}'
```

## 🚀 Интеграция с откликами

При создании отклика на вакансию система автоматически использует основное резюме:

```typescript
// В applications.service.ts
async createApplication(data: CreateApplicationDto) {
  // Получаем основное резюме кандидата
  const defaultResume = await this.resumesService.getDefaultResume(data.candidateId);
  
  return this.prisma.application.create({
    data: {
      ...data,
      resumeId: defaultResume?.id, // Автоматически прикрепляем резюме
    }
  });
}
```

## 📈 Мониторинг и аналитика

### Метрики для отслеживания

```typescript
// Получение статистики по резюме
const stats = await fetch('/resumes/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Аналитика:
// - Общее количество резюме
// - Публичные vs приватные
// - Наличие основного резюме
// - Недавние резюме
```

## 🔒 Безопасность

1. **Аутентификация** - все операции требуют JWT токен
2. **Авторизация** - пользователи могут управлять только своими резюме
3. **Валидация** - все входные данные проверяются
4. **Санитизация** - защита от XSS и инъекций
5. **Rate limiting** - ограничение частоты запросов

## 🎯 Лучшие практики

1. **Используйте пагинацию** для больших списков
2. **Кэшируйте** часто запрашиваемые данные
3. **Валидируйте** данные на клиенте и сервере
4. **Обрабатывайте ошибки** корректно
5. **Используйте HTTPS** для безопасности
6. **Логируйте** важные операции
7. **Мониторьте** производительность API

## 💡 Поэтапное создание резюме - лучший подход!

### Сценарий 1: Быстрое создание
```javascript
// 1. Создаем базовое резюме
const resume = await fetch('/resumes', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Frontend Developer',
    isDefault: true
  })
});

// 2. Позже добавляем детали
await fetch(`/resumes/${resume.id}`, {
  method: 'PUT',
  body: JSON.stringify({
    summary: 'Опытный разработчик',
    skills: [
      { name: 'JavaScript', level: 5, category: 'Programming' }
    ]
  })
});
```

### Сценарий 2: Из шаблона
```javascript
// 1. Получаем шаблоны
const templates = await fetch('/resumes/templates');

// 2. Создаем из шаблона
const resume = await fetch('/resumes/from-template', {
  method: 'POST',
  body: JSON.stringify({
    templateId: 'frontend-developer',
    title: 'My Resume'
  })
});

// 3. Настраиваем под себя
await fetch(`/resumes/${resume.id}`, {
  method: 'PUT',
  body: JSON.stringify({
    summary: 'Мое персональное описание',
    experiences: [
      {
        company: 'Моя компания',
        position: 'Моя должность',
        startDate: '2020-01-01',
        endDate: '2024-01-01',
        isCurrent: false,
        description: 'Мой опыт работы'
      }
    ]
  })
});
```

### Сценарий 3: Импорт существующего
```javascript
// 1. Импортируем данные
const resume = await fetch('/resumes/import', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Imported Resume',
    resumeData: {
      summary: 'Импортированное резюме',
      skills: [
        { name: 'JavaScript', level: 5, category: 'Programming' }
      ]
    }
  })
});

// 2. Дополняем недостающими данными
await fetch(`/resumes/${resume.id}`, {
  method: 'PUT',
  body: JSON.stringify({
    experiences: [
      {
        company: 'Новая компания',
        position: 'Новая должность',
        startDate: '2024-01-01',
        isCurrent: true,
        description: 'Текущая работа'
      }
    ]
  })
});
```

**Главное преимущество**: пользователь может начать с минимума и постепенно дополнять резюме по мере необходимости!