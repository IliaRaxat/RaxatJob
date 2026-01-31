# Управление навыками

Полное руководство по работе с навыками в SmartMatch API.

## 🎯 Обзор

Система навыков позволяет:
- Создавать и управлять навыками
- Назначать навыки кандидатам и студентам
- Устанавливать уровни владения навыками
- Поиск по навыкам
- Получать статистику популярных навыков

## 🔐 Аутентификация

Большинство эндпоинтов требуют аутентификации:

```
Authorization: Bearer <JWT_TOKEN>
```

**Исключения:**
- `GET /skills` - список всех навыков
- `GET /skills/popular` - популярные навыки

### Доступ:
- **Все** - просмотр списка навыков
- **CANDIDATE** - управление своими навыками
- **UNIVERSITY** - управление навыками студентов
- **ADMIN** - полный доступ ко всем навыкам

## 🛠️ Управление навыками

### Список всех навыков

#### Эндпоинт
```
GET /skills
```

#### Примеры запросов

##### cURL
```bash
curl -X GET http://localhost:3000/skills
```

##### JavaScript (fetch)
```javascript
async function getSkills() {
  const response = await fetch('/skills', {
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
getSkills()
  .then(skills => console.log('Навыки:', skills))
  .catch(error => console.error('Ошибка:', error.message));
```

##### TypeScript (axios)
```typescript
interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

async function getSkills(): Promise<Skill[]> {
  const response = await axios.get('/skills');
  return response.data;
}
```

#### Ответ при успехе
```json
[
  {
    "id": "skill_id",
    "name": "JavaScript",
    "category": "Programming",
    "description": "JavaScript programming language",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "skill_id_2",
    "name": "React",
    "category": "Frontend",
    "description": "React library for building user interfaces",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Создание навыка

#### Эндпоинт
```
POST /skills
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `name` | string | ✅ | Название навыка | Не пустое, уникальное |
| `category` | string | ✅ | Категория | Не пустое |
| `description` | string | ❌ | Описание | Максимум 500 символов |

#### Примеры запросов

##### cURL
```bash
curl -X POST http://localhost:3000/skills \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TypeScript",
    "category": "Programming",
    "description": "TypeScript programming language with static typing"
  }'
```

##### JavaScript (fetch)
```javascript
async function createSkill(skillData) {
  const response = await fetch('/skills', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(skillData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const skillData = {
  name: 'TypeScript',
  category: 'Programming',
  description: 'TypeScript programming language with static typing'
};

createSkill(skillData)
  .then(skill => console.log('Навык создан:', skill))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
{
  "id": "skill_id",
  "name": "TypeScript",
  "category": "Programming",
  "description": "TypeScript programming language with static typing",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Получение конкретного навыка

#### Эндпоинт
```
GET /skills/:id
```

#### Пример
```bash
curl -X GET http://localhost:3000/skills/skill_id
```

### Обновление навыка

#### Эндпоинт
```
PATCH /skills/:id
```

#### Параметры запроса (все опциональные)

| Поле | Тип | Описание |
|------|-----|----------|
| `name` | string | Название навыка |
| `category` | string | Категория |
| `description` | string | Описание |

#### Пример
```bash
curl -X PATCH http://localhost:3000/skills/skill_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Обновленное описание навыка"
  }'
```

### Удаление навыка

#### Эндпоинт
```
DELETE /skills/:id
```

#### Пример
```bash
curl -X DELETE http://localhost:3000/skills/skill_id \
  -H "Authorization: Bearer <token>"
```

## 👨‍💼 Навыки кандидатов

### Список навыков кандидата

#### Эндпоинт
```
GET /skills/candidate/:candidateId
```

#### Примеры запросов

##### cURL
```bash
curl -X GET http://localhost:3000/skills/candidate/candidate_id \
  -H "Authorization: Bearer <token>"
```

##### JavaScript (fetch)
```javascript
async function getCandidateSkills(candidateId) {
  const response = await fetch(`/skills/candidate/${candidateId}`, {
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
getCandidateSkills('candidate_id')
  .then(skills => console.log('Навыки кандидата:', skills))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
[
  {
    "id": "candidate_skill_id",
    "level": 4,
    "skill": {
      "id": "skill_id",
      "name": "JavaScript",
      "category": "Programming",
      "description": "JavaScript programming language"
    }
  },
  {
    "id": "candidate_skill_id_2",
    "level": 3,
    "skill": {
      "id": "skill_id_2",
      "name": "React",
      "category": "Frontend",
      "description": "React library for building user interfaces"
    }
  }
]
```

### Добавление навыка кандидату

#### Эндпоинт
```
POST /skills/candidate/:candidateId
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `skillId` | string | ✅ | ID навыка | UUID формата |
| `level` | number | ✅ | Уровень владения | 1-5 |

#### Уровни навыков:
- **1** - Начальный
- **2** - Базовый
- **3** - Средний
- **4** - Продвинутый
- **5** - Эксперт

#### Примеры запросов

##### cURL
```bash
curl -X POST http://localhost:3000/skills/candidate/candidate_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "skill_id",
    "level": 4
  }'
```

##### JavaScript (fetch)
```javascript
async function addCandidateSkill(candidateId, skillId, level) {
  const response = await fetch(`/skills/candidate/${candidateId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ skillId, level })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
addCandidateSkill('candidate_id', 'skill_id', 4)
  .then(skill => console.log('Навык добавлен:', skill))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
{
  "id": "candidate_skill_id",
  "level": 4,
  "skill": {
    "id": "skill_id",
    "name": "JavaScript",
    "category": "Programming",
    "description": "JavaScript programming language"
  }
}
```

### Обновление уровня навыка кандидата

#### Эндпоинт
```
PATCH /skills/candidate/:candidateId/:skillId
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание |
|------|-----|---------------|----------|
| `level` | number | ✅ | Новый уровень владения |

#### Пример
```bash
curl -X PATCH http://localhost:3000/skills/candidate/candidate_id/skill_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "level": 5
  }'
```

### Удаление навыка кандидата

#### Эндпоинт
```
DELETE /skills/candidate/:candidateId/:skillId
```

#### Пример
```bash
curl -X DELETE http://localhost:3000/skills/candidate/candidate_id/skill_id \
  -H "Authorization: Bearer <token>"
```

## 🎓 Навыки студентов

### Список навыков студента

#### Эндпоинт
```
GET /skills/student/:studentId
```

#### Примеры запросов

##### cURL
```bash
curl -X GET http://localhost:3000/skills/student/student_id \
  -H "Authorization: Bearer <token>"
```

##### JavaScript (fetch)
```javascript
async function getStudentSkills(studentId) {
  const response = await fetch(`/skills/student/${studentId}`, {
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
getStudentSkills('student_id')
  .then(skills => console.log('Навыки студента:', skills))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
[
  {
    "id": "student_skill_id",
    "level": 3,
    "skill": {
      "id": "skill_id",
      "name": "Python",
      "category": "Programming",
      "description": "Python programming language"
    }
  },
  {
    "id": "student_skill_id_2",
    "level": 2,
    "skill": {
      "id": "skill_id_2",
      "name": "Machine Learning",
      "category": "AI/ML",
      "description": "Machine Learning algorithms and techniques"
    }
  }
]
```

### Добавление навыка студенту

#### Эндпоинт
```
POST /skills/student/:studentId
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание |
|------|-----|---------------|----------|
| `skillId` | string | ✅ | ID навыка |
| `level` | number | ✅ | Уровень владения |

#### Примеры запросов

##### cURL
```bash
curl -X POST http://localhost:3000/skills/student/student_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "skill_id",
    "level": 3
  }'
```

##### JavaScript (fetch)
```javascript
async function addStudentSkill(studentId, skillId, level) {
  const response = await fetch(`/skills/student/${studentId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ skillId, level })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
addStudentSkill('student_id', 'skill_id', 3)
  .then(skill => console.log('Навык добавлен:', skill))
  .catch(error => console.error('Ошибка:', error.message));
```

### Обновление уровня навыка студента

#### Эндпоинт
```
PATCH /skills/student/:studentId/:skillId
```

#### Пример
```bash
curl -X PATCH http://localhost:3000/skills/student/student_id/skill_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "level": 4
  }'
```

### Удаление навыка студента

#### Эндпоинт
```
DELETE /skills/student/:studentId/:skillId
```

#### Пример
```bash
curl -X DELETE http://localhost:3000/skills/student/student_id/skill_id \
  -H "Authorization: Bearer <token>"
```

## 🔍 Поиск по навыкам

### Поиск студентов по навыкам

#### Эндпоинт
```
GET /universities/students/search?skillIds=skill1,skill2
```

#### Параметры запроса

| Параметр | Тип | Описание | Пример |
|----------|-----|----------|--------|
| `skillIds` | string | ID навыков через запятую | `skill1,skill2,skill3` |
| `minLevel` | number | Минимальный уровень | `3` |
| `maxLevel` | number | Максимальный уровень | `5` |

#### Примеры запросов

##### cURL
```bash
# Поиск студентов с навыками JavaScript и React
curl -X GET "http://localhost:3000/universities/students/search?skillIds=skill1,skill2" \
  -H "Authorization: Bearer <token>"

# Поиск с минимальным уровнем
curl -X GET "http://localhost:3000/universities/students/search?skillIds=skill1&minLevel=3" \
  -H "Authorization: Bearer <token>"
```

##### JavaScript (fetch)
```javascript
async function searchStudentsBySkills(skillIds, minLevel = null, maxLevel = null) {
  const params = new URLSearchParams();
  params.append('skillIds', skillIds.join(','));
  
  if (minLevel !== null) {
    params.append('minLevel', minLevel.toString());
  }
  
  if (maxLevel !== null) {
    params.append('maxLevel', maxLevel.toString());
  }
  
  const response = await fetch(`/universities/students/search?${params.toString()}`, {
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
searchStudentsBySkills(['skill1', 'skill2'], 3, 5)
  .then(students => console.log('Найденные студенты:', students))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
[
  {
    "id": "student_id",
    "firstName": "Петр",
    "lastName": "Иванов",
    "email": "petr.ivanov@student.msu.ru",
    "major": "Информатика",
    "yearOfStudy": 3,
    "gpa": 4.5,
    "skills": [
      {
        "id": "student_skill_id",
        "level": 4,
        "skill": {
          "id": "skill1",
          "name": "JavaScript",
          "category": "Programming"
        }
      },
      {
        "id": "student_skill_id_2",
        "level": 3,
        "skill": {
          "id": "skill2",
          "name": "React",
          "category": "Frontend"
        }
      }
    ]
  }
]
```

## 📊 Статистика навыков

### Популярные навыки

#### Эндпоинт
```
GET /skills/popular
```

#### Описание
API для получения списка самых популярных навыков в системе. Популярность определяется на основе:
- **Приоритет 1**: Данные из таблицы `SkillAnalytics` (если доступны) - сортировка по `demandScore`
- **Приоритет 2**: Подсчет упоминаний в таблицах `CandidateSkill` и `StudentSkill`

#### Аутентификация
Не требуется.

#### Параметры
Нет параметров запроса.

#### Пример запроса
```bash
curl -X GET http://localhost:3000/skills/popular
```

#### Ответ при успехе
```json
[
  {
    "skill": {
      "id": "skill_id",
      "name": "JavaScript",
      "category": "Programming"
    },
    "candidateCount": 150,
    "studentCount": 200,
    "totalCount": 350,
    "demandScore": 8.5
  },
  {
    "skill": {
      "id": "skill_id_2",
      "name": "Python",
      "category": "Programming"
    },
    "candidateCount": 120,
    "studentCount": 180,
    "totalCount": 300,
    "demandScore": 7.8
  }
]
```

#### Поля ответа
- `skill` - объект с информацией о навыке:
  - `id` - уникальный идентификатор навыка
  - `name` - название навыка
  - `category` - категория навыка
- `candidateCount` - количество кандидатов с этим навыком
- `studentCount` - количество студентов с этим навыком
- `totalCount` - общее количество упоминаний навыка
- `demandScore` - показатель спроса на навык (только если данные из SkillAnalytics)

#### Логика работы

1. **Проверка SkillAnalytics**: API сначала пытается получить данные из таблицы `SkillAnalytics`
2. **Сортировка по спросу**: Если данные есть, навыки сортируются по убыванию `demandScore`
3. **Fallback на подсчет**: Если данных в `SkillAnalytics` нет, система считает популярность по количеству упоминаний
4. **Ограничение результатов**: Возвращается максимум 20 самых популярных навыков

#### Примеры использования

**JavaScript (Fetch API)**
```javascript
async function getPopularSkills() {
  try {
    const response = await fetch('http://localhost:3000/skills/popular');
    const skills = await response.json();
    console.log('Популярные навыки:', skills);
    return skills;
  } catch (error) {
    console.error('Ошибка при получении популярных навыков:', error);
  }
}
```

**JavaScript (jQuery)**
```javascript
$.get('http://localhost:3000/skills/popular')
  .done(function(skills) {
    console.log('Популярные навыки:', skills);
  })
  .fail(function(error) {
    console.error('Ошибка:', error);
  });
```

**React компонент**
```jsx
import React, { useState, useEffect } from 'react';

function PopularSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/skills/popular')
      .then(response => response.json())
      .then(data => {
        setSkills(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Популярные навыки</h2>
      {skills.map(skill => (
        <div key={skill.skill.id}>
          <h3>{skill.skill.name}</h3>
          <p>Категория: {skill.skill.category}</p>
          <p>Всего упоминаний: {skill.totalCount}</p>
          {skill.demandScore && <p>Спрос: {skill.demandScore}</p>}
        </div>
      ))}
    </div>
  );
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
  "message": "Навык не найден",
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
      "field": "level",
      "message": "Уровень навыка должен быть от 1 до 5"
    },
    {
      "field": "name",
      "message": "Название навыка не может быть пустым"
    }
  ]
}
```

#### 409 Conflict - Дублирование
```json
{
  "statusCode": 409,
  "message": "Навык уже добавлен",
  "error": "Conflict"
}
```

### JavaScript обработка ошибок

```javascript
async function handleSkillOperation(operation) {
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
          alert('Навык не найден');
          break;
        case 409:
          alert('Навык уже добавлен');
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

interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

interface CandidateSkill {
  id: string;
  level: number;
  skill: Skill;
}

interface UseSkillsReturn {
  skills: Skill[];
  candidateSkills: CandidateSkill[];
  loading: boolean;
  error: string | null;
  addSkill: (data: Omit<Skill, 'id'>) => Promise<void>;
  addCandidateSkill: (skillId: string, level: number) => Promise<void>;
  updateCandidateSkill: (skillId: string, level: number) => Promise<void>;
  removeCandidateSkill: (skillId: string) => Promise<void>;
  searchStudentsBySkills: (skillIds: string[], minLevel?: number) => Promise<any[]>;
}

export function useSkills(): UseSkillsReturn {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [candidateSkills, setCandidateSkills] = useState<CandidateSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/skills', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      } else {
        throw new Error('Ошибка загрузки навыков');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateSkills = async () => {
    try {
      const response = await fetch('/skills/candidate/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidateSkills(data);
      } else {
        throw new Error('Ошибка загрузки навыков кандидата');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const addSkill = async (data: Omit<Skill, 'id'>) => {
    try {
      setError(null);
      
      const response = await fetch('/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const newSkill = await response.json();
        setSkills(prev => [...prev, newSkill]);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addCandidateSkill = async (skillId: string, level: number) => {
    try {
      setError(null);
      
      const response = await fetch('/skills/candidate/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ skillId, level })
      });
      
      if (response.ok) {
        const newCandidateSkill = await response.json();
        setCandidateSkills(prev => [...prev, newCandidateSkill]);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCandidateSkill = async (skillId: string, level: number) => {
    try {
      setError(null);
      
      const response = await fetch(`/skills/candidate/me/${skillId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ level })
      });
      
      if (response.ok) {
        const updatedSkill = await response.json();
        setCandidateSkills(prev => 
          prev.map(skill => skill.skill.id === skillId ? updatedSkill : skill)
        );
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeCandidateSkill = async (skillId: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/skills/candidate/me/${skillId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setCandidateSkills(prev => 
          prev.filter(skill => skill.skill.id !== skillId)
        );
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const searchStudentsBySkills = async (skillIds: string[], minLevel?: number) => {
    try {
      setError(null);
      
      const params = new URLSearchParams();
      params.append('skillIds', skillIds.join(','));
      if (minLevel !== undefined) {
        params.append('minLevel', minLevel.toString());
      }
      
      const response = await fetch(`/universities/students/search?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        return await response.json();
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
    fetchSkills();
    fetchCandidateSkills();
  }, []);

  return {
    skills,
    candidateSkills,
    loading,
    error,
    addSkill,
    addCandidateSkill,
    updateCandidateSkill,
    removeCandidateSkill,
    searchStudentsBySkills
  };
}
```

## 📊 Мониторинг и аналитика

### Отслеживание действий с навыками

```javascript
// Логирование добавления навыка
function logSkillAdded(skillId, name, category) {
  analytics.track('skill_added', {
    skillId,
    name,
    category,
    timestamp: new Date().toISOString()
  });
}

// Логирование добавления навыка кандидату
function logCandidateSkillAdded(candidateId, skillId, level) {
  analytics.track('candidate_skill_added', {
    candidateId,
    skillId,
    level,
    timestamp: new Date().toISOString()
  });
}

// Логирование обновления уровня навыка
function logSkillLevelUpdated(candidateId, skillId, oldLevel, newLevel) {
  analytics.track('skill_level_updated', {
    candidateId,
    skillId,
    oldLevel,
    newLevel,
    timestamp: new Date().toISOString()
  });
}

// Логирование поиска по навыкам
function logSkillSearch(skillIds, minLevel, resultCount) {
  analytics.track('skill_search', {
    skillIds,
    minLevel,
    resultCount,
    timestamp: new Date().toISOString()
  });
}
```

## 🔒 Безопасность

### Проверка прав доступа

- **CANDIDATE** - управление своими навыками
- **UNIVERSITY** - управление навыками студентов
- **HR** - просмотр навыков кандидатов
- **ADMIN** - полный доступ ко всем навыкам

### Валидация данных

- **Уровни навыков** - диапазон от 1 до 5
- **Названия навыков** - уникальность, не пустые
- **Категории** - предопределенный список
- **Описания** - ограничения по длине

### Защита от дублирования

Система предотвращает:
- Добавление одного навыка несколько раз одному кандидату
- Создание навыков с одинаковыми названиями
- Некорректные уровни навыков
