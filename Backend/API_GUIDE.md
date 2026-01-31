# API Guide - SmartMatch Platform

Полная документация API для платформы SmartMatch с примерами запросов и ответов.

## 🔧 Конфигурация

### Базовый URL
```
http://localhost:3000
```

### Аутентификация
Все защищенные эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer <JWT_TOKEN>
```

Или через HTTP-only cookies (автоматически):
```
Cookie: access_token=<JWT_TOKEN>
```

### Content-Type
Для JSON запросов:
```
Content-Type: application/json
```

Для загрузки файлов:
```
Content-Type: multipart/form-data
```

## 📋 Быстрый справочник эндпоинтов

| Метод | Путь | Описание | Аутентификация | Роль |
|-------|------|----------|----------------|------|
| POST | `/auth/register` | Регистрация | ❌ | - |
| POST | `/auth/login` | Вход | ❌ | - |
| GET | `/auth/me` | Текущий пользователь | ✅ | Любая |
| POST | `/profiles/hr` | Создать HR профиль | ✅ | HR |
| GET | `/profiles/hr` | Получить HR профиль | ✅ | HR |
| POST | `/profiles/candidate` | Создать профиль кандидата | ✅ | CANDIDATE |
| GET | `/profiles/candidate` | Получить профиль кандидата | ✅ | CANDIDATE |
| POST | `/profiles/university` | Создать профиль университета | ✅ | UNIVERSITY |
| GET | `/profiles/university` | Получить профиль университета | ✅ | UNIVERSITY |
| PATCH | `/profiles` | Обновить любой профиль | ✅ | Любая |
| POST | `/profiles/avatar/upload` | Загрузить аватар | ✅ | Любая |
| GET | `/profiles/avatar` | Получить аватар | ✅ | Любая |
| GET | `/profiles/avatar/url` | URL аватара | ✅ | Любая |
| POST | `/jobs` | Создать вакансию | ✅ | HR |
| GET | `/jobs` | Список вакансий | ❌ | - |
| GET | `/jobs/:id` | Детали вакансии | ❌ | - |
| PATCH | `/jobs/:id` | Обновить вакансию | ✅ | HR |
| DELETE | `/jobs/:id` | Удалить вакансию | ✅ | HR |
| POST | `/applications` | Отклик на вакансию | ✅ | CANDIDATE |
| GET | `/applications` | Список откликов | ✅ | HR/CANDIDATE |
| PATCH | `/applications/:id` | Обновить статус отклика | ✅ | HR |
| POST | `/educations` | Добавить образование | ✅ | CANDIDATE |
| GET | `/educations` | Список образования | ✅ | CANDIDATE |
| PATCH | `/educations/:id` | Обновить образование | ✅ | CANDIDATE |
| DELETE | `/educations/:id` | Удалить образование | ✅ | CANDIDATE |
| POST | `/experiences` | Добавить опыт | ✅ | CANDIDATE |
| GET | `/experiences` | Список опыта | ✅ | CANDIDATE |
| PATCH | `/experiences/:id` | Обновить опыт | ✅ | CANDIDATE |
| DELETE | `/experiences/:id` | Удалить опыт | ✅ | CANDIDATE |
| GET | `/skills` | Список навыков | ❌ | - |
| GET | `/skills/popular` | Популярные навыки | ❌ | - |
| POST | `/skills` | Создать навык | ✅ | Любая |
| GET | `/skills/candidate/:id` | Навыки кандидата | ✅ | Любая |
| POST | `/skills/candidate/:id` | Добавить навык кандидату | ✅ | CANDIDATE |
| GET | `/skills/student/:id` | Навыки студента | ✅ | Любая |
| POST | `/skills/student/:id` | Добавить навык студенту | ✅ | UNIVERSITY |
| POST | `/universities/students` | Создать студента | ✅ | UNIVERSITY |
| GET | `/universities/students` | Список студентов | ✅ | UNIVERSITY |
| GET | `/universities/students/search` | Поиск студентов по навыкам | ✅ | UNIVERSITY |
| GET | `/universities/students/stats` | Статистика студентов | ✅ | UNIVERSITY |
| GET | `/universities/students/:id` | Детали студента | ✅ | UNIVERSITY |
| PATCH | `/universities/students/:id` | Обновить студента | ✅ | UNIVERSITY |
| DELETE | `/universities/students/:id` | Удалить студента | ✅ | UNIVERSITY |
| POST | `/storage/upload` | Загрузить файл | ✅ | Любая |
| GET | `/storage/download/:fileName` | Скачать файл | ❌ | - |
| GET | `/storage/presigned/:fileName` | Presigned URL | ❌ | - |

## 🔐 Аутентификация

### Регистрация
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "role": "CANDIDATE"
  }'
```

**Ответ:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "CANDIDATE"
  }
}
```

**Валидация:**
- `email`: Валидный email адрес
- `password`: Минимум 8 символов, минимум 1 заглавная буква, 1 строчная, 1 цифра
- `role`: Одно из значений: `HR`, `CANDIDATE`, `UNIVERSITY`

### Вход
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

**Ответ:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "CANDIDATE"
  }
}
```

### JavaScript примеры

```javascript
// Регистрация
async function register(email, password, role) {
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, role })
  });
  return response.json();
}

// Вход
async function login(email, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  return response.json();
}

// Проверка аутентификации
async function getCurrentUser() {
  const response = await fetch('/auth/me', {
    credentials: 'include'
  });
  return response.json();
}
```

### TypeScript с Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

// Регистрация
interface RegisterData {
  email: string;
  password: string;
  role: 'HR' | 'CANDIDATE' | 'UNIVERSITY';
}

async function register(data: RegisterData) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

// Вход
interface LoginData {
  email: string;
  password: string;
}

async function login(data: LoginData) {
  const response = await api.post('/auth/login', data);
  return response.data;
}
```

## 👤 Профили

### HR Профиль

#### Создание HR профиля
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

**Поля:**
- `firstName` (string, обязательное) - Имя
- `lastName` (string, обязательное) - Фамилия
- `company` (string, обязательное) - Компания
- `position` (string, обязательное) - Должность
- `phone` (string, опциональное) - Телефон
- `avatarId` (string, опциональное) - ID аватара

#### Получение HR профиля
```bash
curl -X GET http://localhost:3000/profiles/hr \
  -H "Authorization: Bearer <token>"
```

**Ответ:**
```json
{
  "id": "hr_profile_id",
  "userId": "user_id",
  "firstName": "Иван",
  "lastName": "Петров",
  "company": "ООО Технологии",
  "position": "HR Manager",
  "phone": "+7-999-123-45-67",
  "avatarId": "avatar_file_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "hr@company.com",
    "role": "HR"
  },
  "jobs": [
    {
      "id": "job_id",
      "title": "Frontend Developer",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Candidate Профиль

#### Создание профиля кандидата
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
    "githubUrl": "https://github.com/anna-smirnova"
  }'
```

**Поля:**
- `firstName` (string, обязательное) - Имя
- `lastName` (string, обязательное) - Фамилия
- `phone` (string, опциональное) - Телефон
- `dateOfBirth` (string, опциональное) - Дата рождения (ISO 8601)
- `location` (string, опциональное) - Местоположение
- `bio` (string, опциональное) - Биография
- `avatarId` (string, опциональное) - ID аватара
- `resumeId` (string, опциональное) - ID резюме
- `linkedinUrl` (string, опциональное) - LinkedIn URL
- `githubUrl` (string, опциональное) - GitHub URL
- `portfolioUrl` (string, опциональное) - Портфолио URL

#### Получение профиля кандидата
```bash
curl -X GET http://localhost:3000/profiles/candidate \
  -H "Authorization: Bearer <token>"
```

**Ответ:**
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
  "avatarId": "avatar_file_id",
  "resumeId": "resume_file_id",
  "linkedinUrl": "https://linkedin.com/in/anna-smirnova",
  "githubUrl": "https://github.com/anna-smirnova",
  "portfolioUrl": "https://anna-smirnova.dev",
  "isAvailable": true,
  "expectedSalary": 150000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "anna@example.com",
    "role": "CANDIDATE"
  },
  "skills": [
    {
      "id": "skill_relation_id",
      "level": 4,
      "skill": {
        "id": "skill_id",
        "name": "JavaScript",
        "category": "Programming",
        "description": "JavaScript programming language"
      }
    }
  ],
  "experiences": [
    {
      "id": "experience_id",
      "company": "ООО Веб-Студия",
      "position": "Frontend Developer",
      "startDate": "2021-06-01T00:00:00.000Z",
      "endDate": "2024-01-01T00:00:00.000Z",
      "description": "Разработка пользовательских интерфейсов",
      "isCurrent": false
    }
  ],
  "educations": [
    {
      "id": "education_id",
      "degree": "Бакалавр",
      "field": "Информатика",
      "startDate": "2017-09-01T00:00:00.000Z",
      "endDate": "2021-06-30T00:00:00.000Z",
      "gpa": 4.5,
      "description": "Специализация по веб-разработке"
    }
  ],
  "applications": [
    {
      "id": "application_id",
      "status": "PENDING",
      "appliedAt": "2024-01-15T00:00:00.000Z",
      "job": {
        "id": "job_id",
        "title": "Senior Frontend Developer",
        "status": "ACTIVE",
        "hr": {
          "company": "ООО Технологии"
        }
      }
    }
  ]
}
```

### University Профиль

#### Создание профиля университета
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

**Поля:**
- `name` (string, обязательное) - Название университета
- `address` (string, обязательное) - Адрес
- `phone` (string, опциональное) - Телефон
- `website` (string, опциональное) - Веб-сайт
- `logoId` (string, опциональное) - ID логотипа

### Универсальное обновление профиля

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

## 💼 Вакансии

### Создание вакансии
```bash
curl -X POST http://localhost:3000/jobs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer",
    "description": "Разработка пользовательских интерфейсов",
    "requirements": "React, TypeScript, 2+ года опыта",
    "responsibilities": "Разработка компонентов, оптимизация производительности",
    "benefits": "Удаленная работа, медицинская страховка",
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

**Поля:**
- `title` (string, обязательное, макс. 200 символов) - Название вакансии
- `description` (string, обязательное, макс. 5000 символов) - Описание
- `requirements` (string, опциональное, макс. 3000 символов) - Требования
- `responsibilities` (string, опциональное, макс. 3000 символов) - Обязанности
- `benefits` (string, опциональное, макс. 2000 символов) - Преимущества
- `salaryMin` (number, опциональное, мин. 0) - Минимальная зарплата
- `salaryMax` (number, опциональное, мин. 0) - Максимальная зарплата
- `currency` (string, опциональное) - Валюта
- `location` (string, обязательное) - Локация
- `type` (enum, обязательное) - Тип вакансии: `FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `CONTRACT`
- `experienceLevel` (enum, обязательное) - Уровень опыта: `ENTRY`, `JUNIOR`, `MIDDLE`, `SENIOR`, `LEAD`
- `remote` (boolean, опциональное) - Удаленная работа
- `deadline` (string, опциональное) - Дедлайн (ISO 8601)
- `skillIds` (string[], опциональное) - ID навыков

### Список вакансий
```bash
curl -X GET "http://localhost:3000/jobs?search=frontend&location=Москва&type=FULL_TIME&page=1&limit=10"
```

**Параметры запроса:**
- `search` (string, опциональное) - Поиск по тексту
- `type` (enum, опциональное) - Тип вакансии
- `experienceLevel` (enum, опциональное) - Уровень опыта
- `location` (string, опциональное) - Локация
- `remote` (boolean, опциональное) - Удаленная работа
- `page` (number, опциональное, по умолчанию 1) - Страница
- `limit` (number, опциональное, по умолчанию 10) - Количество на странице

**Ответ:**
```json
{
  "jobs": [
    {
      "id": "job_id",
      "title": "Frontend Developer",
      "description": "Разработка пользовательских интерфейсов",
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
          "id": "skill_id",
          "name": "React",
          "category": "Programming"
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

## 📝 Отклики на вакансии

### Создание отклика
```bash
curl -X POST http://localhost:3000/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job_id",
    "coverLetter": "Сопроводительное письмо",
    "resumeUrl": "https://example.com/resume.pdf"
  }'
```

**Поля:**
- `jobId` (string, обязательное) - ID вакансии
- `coverLetter` (string, опциональное) - Сопроводительное письмо
- `resumeUrl` (string, опциональное) - URL резюме

### Список откликов
```bash
curl -X GET http://localhost:3000/applications \
  -H "Authorization: Bearer <token>"
```

**Ответ:**
```json
[
  {
    "id": "application_id",
    "status": "PENDING",
    "coverLetter": "Сопроводительное письмо",
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

### Обновление статуса отклика (HR)
```bash
curl -X PATCH http://localhost:3000/applications/application_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REVIEWED",
    "notes": "Заметки HR"
  }'
```

**Статусы откликов:**
- `PENDING` - Ожидает рассмотрения
- `REVIEWED` - Рассмотрен
- `ACCEPTED` - Принят
- `REJECTED` - Отклонен
- `INTERVIEW_SCHEDULED` - Запланировано собеседование
- `HIRED` - Принят на работу

## 🎓 Образование

### Добавление образования
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
    "description": "Специализация по веб-разработке"
  }'
```

**Поля:**
- `degree` (string, обязательное) - Степень
- `field` (string, обязательное) - Область изучения
- `startDate` (string, обязательное) - Дата начала (ISO 8601)
- `endDate` (string, опциональное) - Дата окончания (ISO 8601)
- `gpa` (number, опциональное, 0-5) - Средний балл
- `description` (string, опциональное) - Описание
- `isCurrent` (boolean, опциональное) - Текущее обучение

### Список образования
```bash
curl -X GET http://localhost:3000/educations \
  -H "Authorization: Bearer <token>"
```

## 💼 Опыт работы

### Добавление опыта
```bash
curl -X POST http://localhost:3000/experiences \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "ООО Веб-Студия",
    "position": "Frontend Developer",
    "startDate": "2021-06-01",
    "endDate": "2024-01-01",
    "description": "Разработка пользовательских интерфейсов",
    "isCurrent": false
  }'
```

**Поля:**
- `company` (string, обязательное) - Компания
- `position` (string, обязательное) - Должность
- `startDate` (string, обязательное) - Дата начала (ISO 8601)
- `endDate` (string, опциональное) - Дата окончания (ISO 8601)
- `description` (string, опциональное) - Описание
- `isCurrent` (boolean, опциональное) - Текущая работа

## 🎯 Навыки

### Список навыков
```bash
curl -X GET http://localhost:3000/skills
```

### Популярные навыки
```bash
curl -X GET http://localhost:3000/skills/popular
```

**Описание**: Получить список самых популярных навыков в системе.

**Особенности**:
- Не требует аутентификации
- Приоритет SkillAnalytics → fallback на подсчет упоминаний
- Максимум 20 навыков
- Сортировка по спросу и количеству упоминаний

**Подробная документация**: см. [SKILLS.md](./SKILLS.md#популярные-навыки)

### Создание навыка
```bash
curl -X POST http://localhost:3000/skills \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "React",
    "category": "Frontend",
    "description": "React library for building user interfaces"
  }'
```

### Навыки кандидата
```bash
curl -X GET http://localhost:3000/skills/candidate/candidate_id \
  -H "Authorization: Bearer <token>"
```

### Добавление навыка кандидату
```bash
curl -X POST http://localhost:3000/skills/candidate/candidate_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "skill_id",
    "level": 4
  }'
```

**Уровни навыков:**
- 1 - Начальный
- 2 - Базовый
- 3 - Средний
- 4 - Продвинутый
- 5 - Эксперт

## 📁 Файлы

### Загрузка файла
```bash
curl -X POST http://localhost:3000/storage/upload \
  -F "file=@avatar.jpg" \
  -F "path=avatars"
```

**Ответ:**
```json
{
  "success": true,
  "fileName": "avatars/avatar_123456.jpg",
  "originalName": "avatar.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg",
  "presignedUrl": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_123456.jpg?X-Amz-Algorithm=..."
}
```

### Загрузка аватара профиля
```bash
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@avatar.jpg"
```

### Получение URL аватара
```bash
curl -X GET http://localhost:3000/profiles/avatar/url \
  -H "Authorization: Bearer <token>"
```

## 🎓 Управление студентами (Университеты)

### Создание студента
```bash
curl -X POST http://localhost:3000/universities/students \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan.petrov@university.edu",
    "studentId": "2024001",
    "yearOfStudy": 3,
    "major": "Информатика",
    "gpa": 4.2,
    "phone": "+7-999-123-45-67"
  }'
```

**Поля:**
- `firstName` (string, обязательное) - Имя
- `lastName` (string, обязательное) - Фамилия
- `email` (string, обязательное) - Email студента
- `studentId` (string, обязательное) - Студенческий билет
- `yearOfStudy` (number, обязательное) - Курс (1-6)
- `major` (string, обязательное) - Специальность
- `gpa` (number, опциональное) - Средний балл (0-5)
- `phone` (string, опциональное) - Телефон

### Список студентов
```bash
curl -X GET http://localhost:3000/universities/students \
  -H "Authorization: Bearer <token>"
```

**Ответ:**
```json
[
  {
    "id": "student_id",
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan.petrov@university.edu",
    "studentId": "2024001",
    "yearOfStudy": 3,
    "major": "Информатика",
    "gpa": 4.2,
    "phone": "+7-999-123-45-67",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "skills": [
      {
        "id": "skill_relation_id",
        "level": 4,
        "skill": {
          "id": "skill_id",
          "name": "JavaScript",
          "category": "Programming"
        }
      }
    ]
  }
]
```

### Поиск студентов по навыкам
```bash
curl -X GET "http://localhost:3000/universities/students/search?skillIds=skill1,skill2&minLevel=3" \
  -H "Authorization: Bearer <token>"
```

**Параметры:**
- `skillIds` (string) - ID навыков через запятую
- `minLevel` (number, опциональное) - Минимальный уровень навыка
- `maxLevel` (number, опциональное) - Максимальный уровень навыка

### Статистика студентов
```bash
curl -X GET http://localhost:3000/universities/students/stats \
  -H "Authorization: Bearer <token>"
```

**Ответ:**
```json
{
  "totalStudents": 150,
  "studentsWithSkills": 120,
  "studentsWithoutSkills": 30,
  "topSkills": [
    {
      "skillId": "skill_id",
      "_count": {
        "skillId": 45
      }
    }
  ]
}
```

### Детали студента
```bash
curl -X GET http://localhost:3000/universities/students/student_id \
  -H "Authorization: Bearer <token>"
```

### Обновление студента
```bash
curl -X PATCH http://localhost:3000/universities/students/student_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Иван",
    "gpa": 4.5,
    "phone": "+7-999-987-65-43"
  }'
```

### Удаление студента
```bash
curl -X DELETE http://localhost:3000/universities/students/student_id \
  -H "Authorization: Bearer <token>"
```

**Ответ:**
```json
{
  "message": "Студент успешно удален"
}
```

### JavaScript примеры

```javascript
// Создание студента
async function createStudent(studentData) {
  const response = await fetch('/universities/students', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(studentData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Получение списка студентов
async function getStudents() {
  const response = await fetch('/universities/students', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  
  return await response.json();
}

// Поиск студентов по навыкам
async function searchStudentsBySkills(skillIds, minLevel = null) {
  const params = new URLSearchParams();
  params.append('skillIds', skillIds.join(','));
  
  if (minLevel !== null) {
    params.append('minLevel', minLevel.toString());
  }
  
  const response = await fetch(`/universities/students/search?${params.toString()}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  
  return await response.json();
}

// Обновление студента
async function updateStudent(studentId, updateData) {
  const response = await fetch(`/universities/students/${studentId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(updateData)
  });
  
  return await response.json();
}

// Удаление студента
async function deleteStudent(studentId) {
  const response = await fetch(`/universities/students/${studentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  
  return await response.json();
}
```

## ❌ Обработка ошибок

### Коды ошибок
- `400 Bad Request` - Неверный запрос (ошибки валидации)
- `401 Unauthorized` - Не авторизован
- `403 Forbidden` - Доступ запрещен
- `404 Not Found` - Ресурс не найден
- `409 Conflict` - Конфликт (дублирование)
- `500 Internal Server Error` - Внутренняя ошибка сервера

### Формат ошибок
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

### JavaScript обработка ошибок
```javascript
async function makeRequest() {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error.message);
    throw error;
  }
}
```

## 🔒 Безопасность

### JWT Токены
- Срок действия: 1 час
- HTTP-only cookies для защиты от XSS
- CORS настроен для cross-origin запросов
- Rate limiting для защиты от спама

### Валидация данных
- Все входящие данные валидируются
- Проверка ролей пользователей
- Ограничения на размер файлов (10MB)
- Поддержка только изображений для аватаров

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
- `DRAFT` - Черновик
- `ACTIVE` - Активная
- `PAUSED` - Приостановлена
- `CLOSED` - Закрыта
- `ARCHIVED` - Архивирована

### Статусы модерации (ModerationStatus)
- `PENDING` - Ожидает модерации
- `APPROVED` - Одобрена
- `REJECTED` - Отклонена
- `DRAFT` - Возвращена на доработку
