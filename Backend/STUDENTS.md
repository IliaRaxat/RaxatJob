# Управление студентами

Полное руководство по работе со студентами в SmartMatch API для университетов.

## 🎓 Обзор

Система управления студентами позволяет университетам:
- Создавать и управлять профилями студентов
- Отслеживать навыки студентов
- Анализировать статистику по студентам
- Искать студентов по навыкам
- Управлять образовательными данными

## 🔐 Аутентификация

Все эндпоинты требуют аутентификации и роли `UNIVERSITY`:

```
Authorization: Bearer <JWT_TOKEN>
```

### Доступ:
- **UNIVERSITY** - полный доступ к управлению студентами
- **ADMIN** - доступ ко всем студентам всех университетов
- **MODERATOR** - просмотр статистики студентов

## 👨‍🎓 Создание студента

### Эндпоинт
```
POST /universities/students
```

### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `firstName` | string | ✅ | Имя | Не пустое, макс. 50 символов |
| `lastName` | string | ✅ | Фамилия | Не пустое, макс. 50 символов |
| `email` | string | ✅ | Email студента | Валидный email |
| `studentId` | string | ✅ | Студенческий билет | Уникальный в рамках университета |
| `yearOfStudy` | number | ✅ | Курс | 1-6 |
| `major` | string | ✅ | Специальность | Не пустое, макс. 100 символов |
| `gpa` | number | ❌ | Средний балл | 0-5 |
| `phone` | string | ❌ | Телефон | Формат телефона |

### Примеры запросов

#### cURL
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

#### JavaScript (fetch)
```javascript
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

// Использование
const studentData = {
  firstName: 'Иван',
  lastName: 'Петров',
  email: 'ivan.petrov@university.edu',
  studentId: '2024001',
  yearOfStudy: 3,
  major: 'Информатика',
  gpa: 4.2,
  phone: '+7-999-123-45-67'
};

createStudent(studentData)
  .then(student => console.log('Студент создан:', student))
  .catch(error => console.error('Ошибка:', error.message));
```

#### TypeScript (axios)
```typescript
interface CreateStudentData {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  yearOfStudy: number;
  major: string;
  gpa?: number;
  phone?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  yearOfStudy: number;
  major: string;
  gpa?: number;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  skills: Array<{
    id: string;
    level: number;
    skill: {
      id: string;
      name: string;
      category: string;
    };
  }>;
}

async function createStudent(data: CreateStudentData): Promise<Student> {
  const response = await axios.post('/universities/students', data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}
```

### Ответ при успехе
```json
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
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "skills": []
}
```

## 📋 Список студентов

### Эндпоинт
```
GET /universities/students
```

### Примеры запросов

#### cURL
```bash
curl -X GET http://localhost:3000/universities/students \
  -H "Authorization: Bearer <token>"
```

#### JavaScript (fetch)
```javascript
async function getStudents() {
  const response = await fetch('/universities/students', {
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

### Ответ
```json
[
  {
    "id": "student_id_1",
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
  },
  {
    "id": "student_id_2",
    "firstName": "Анна",
    "lastName": "Смирнова",
    "email": "anna.smirnova@university.edu",
    "studentId": "2024002",
    "yearOfStudy": 2,
    "major": "Математика",
    "gpa": 4.8,
    "phone": "+7-999-987-65-43",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "skills": []
  }
]
```

## 🔍 Поиск студентов по навыкам

### Эндпоинт
```
GET /universities/students/search?skillIds=skill1,skill2&minLevel=3
```

### Параметры запроса

| Параметр | Тип | Описание | Пример |
|----------|-----|----------|--------|
| `skillIds` | string | ID навыков через запятую | `skill1,skill2,skill3` |
| `minLevel` | number | Минимальный уровень навыка | `3` |
| `maxLevel` | number | Максимальный уровень навыка | `5` |

### Примеры запросов

#### cURL
```bash
# Поиск студентов с навыками JavaScript и React
curl -X GET "http://localhost:3000/universities/students/search?skillIds=skill1,skill2" \
  -H "Authorization: Bearer <token>"

# Поиск с минимальным уровнем
curl -X GET "http://localhost:3000/universities/students/search?skillIds=skill1&minLevel=3" \
  -H "Authorization: Bearer <token>"
```

#### JavaScript (fetch)
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
searchStudentsBySkills(['skill1', 'skill2'], 3)
  .then(students => console.log('Найденные студенты:', students))
  .catch(error => console.error('Ошибка поиска:', error.message));
```

### Ответ
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
    "skills": [
      {
        "id": "skill_relation_id",
        "level": 4,
        "skill": {
          "id": "skill1",
          "name": "JavaScript",
          "category": "Programming"
        }
      },
      {
        "id": "skill_relation_id_2",
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

## 📊 Статистика студентов

### Эндпоинт
```
GET /universities/students/stats
```

### Примеры запросов

#### cURL
```bash
curl -X GET http://localhost:3000/universities/students/stats \
  -H "Authorization: Bearer <token>"
```

#### JavaScript (fetch)
```javascript
async function getStudentStats() {
  const response = await fetch('/universities/students/stats', {
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

### Ответ
```json
{
  "totalStudents": 150,
  "studentsWithSkills": 120,
  "studentsWithoutSkills": 30,
  "topSkills": [
    {
      "skillId": "skill_id_1",
      "_count": {
        "skillId": 45
      }
    },
    {
      "skillId": "skill_id_2",
      "_count": {
        "skillId": 38
      }
    }
  ]
}
```

## 👤 Детали студента

### Эндпоинт
```
GET /universities/students/:id
```

### Примеры запросов

#### cURL
```bash
curl -X GET http://localhost:3000/universities/students/student_id \
  -H "Authorization: Bearer <token>"
```

#### JavaScript (fetch)
```javascript
async function getStudent(studentId) {
  const response = await fetch(`/universities/students/${studentId}`, {
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

### Ответ
```json
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
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "university": {
    "id": "university_id",
    "name": "Московский Государственный Университет"
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
  ]
}
```

## ✏️ Обновление студента

### Эндпоинт
```
PATCH /universities/students/:id
```

### Параметры запроса (все опциональные)

| Поле | Тип | Описание | Валидация |
|------|-----|----------|-----------|
| `firstName` | string | Имя | Не пустое, макс. 50 символов |
| `lastName` | string | Фамилия | Не пустое, макс. 50 символов |
| `email` | string | Email студента | Валидный email |
| `studentId` | string | Студенческий билет | Уникальный в рамках университета |
| `yearOfStudy` | number | Курс | 1-6 |
| `major` | string | Специальность | Не пустое, макс. 100 символов |
| `gpa` | number | Средний балл | 0-5 |
| `phone` | string | Телефон | Формат телефона |

### Примеры запросов

#### cURL
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

#### JavaScript (fetch)
```javascript
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
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const updateData = {
  firstName: 'Иван',
  gpa: 4.5,
  phone: '+7-999-987-65-43'
};

updateStudent('student_id', updateData)
  .then(student => console.log('Студент обновлен:', student))
  .catch(error => console.error('Ошибка:', error.message));
```

### Ответ при успехе
```json
{
  "id": "student_id",
  "firstName": "Иван",
  "lastName": "Петров",
  "email": "ivan.petrov@university.edu",
  "studentId": "2024001",
  "yearOfStudy": 3,
  "major": "Информатика",
  "gpa": 4.5,
  "phone": "+7-999-987-65-43",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z",
  "skills": []
}
```

## 🗑️ Удаление студента

### Эндпоинт
```
DELETE /universities/students/:id
```

### Примеры запросов

#### cURL
```bash
curl -X DELETE http://localhost:3000/universities/students/student_id \
  -H "Authorization: Bearer <token>"
```

#### JavaScript (fetch)
```javascript
async function deleteStudent(studentId) {
  const response = await fetch(`/universities/students/${studentId}`, {
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
deleteStudent('student_id')
  .then(result => console.log('Результат удаления:', result))
  .catch(error => console.error('Ошибка удаления:', error.message));
```

### Ответ при успехе
```json
{
  "message": "Студент успешно удален"
}
```

## 🎯 Управление навыками студентов

### Добавление навыка студенту

#### Эндпоинт
```
POST /skills/student/:studentId
```

#### Параметры запроса

| Поле | Тип | Обязательное | Описание | Валидация |
|------|-----|---------------|----------|-----------|
| `skillId` | string | ✅ | ID навыка | Существующий навык |
| `level` | number | ✅ | Уровень владения | 1-5 |

#### Примеры запросов

##### cURL
```bash
curl -X POST http://localhost:3000/skills/student/student_id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "skill_id",
    "level": 4
  }'
```

##### JavaScript (fetch)
```javascript
async function addSkillToStudent(studentId, skillId, level) {
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
addSkillToStudent('student_id', 'skill_id', 4)
  .then(result => console.log('Навык добавлен:', result))
  .catch(error => console.error('Ошибка:', error.message));
```

### Получение навыков студента

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
  "message": "У вас нет прав для просмотра этого студента",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Студент не найден",
  "error": "Not Found"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Студент с таким studentId уже существует",
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
      "field": "yearOfStudy",
      "message": "Курс должен быть от 1 до 6"
    }
  ]
}
```

### JavaScript обработка ошибок

```javascript
async function handleStudentOperation(operation) {
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
          alert('Студент не найден');
          break;
        case 409:
          alert('Студент с таким номером студенческого билета уже существует');
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
handleStudentOperation(() => getStudent('student_id'))
  .then(student => console.log('Студент:', student))
  .catch(error => console.error('Ошибка:', error));
```

## 🔒 Безопасность

### Проверка ролей

Студенты доступны только пользователям с соответствующими ролями:

- **UNIVERSITY** - управление своими студентами
- **ADMIN** - доступ ко всем студентам
- **MODERATOR** - просмотр статистики

### Валидация данных

Все входящие данные проходят валидацию:

- **Email** - валидный формат email
- **Телефоны** - формат телефона
- **Курс** - от 1 до 6
- **GPA** - от 0 до 5
- **Студенческий билет** - уникальный в рамках университета

### Изоляция данных

- Университеты видят только своих студентов
- Нет доступа к студентам других университетов
- Проверка прав на каждом запросе

## 📱 React Hook пример

```typescript
import { useState, useEffect } from 'react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  yearOfStudy: number;
  major: string;
  gpa?: number;
  phone?: string;
  skills: Array<{
    id: string;
    level: number;
    skill: {
      id: string;
      name: string;
      category: string;
    };
  }>;
}

interface UseStudentsReturn {
  students: Student[];
  loading: boolean;
  error: string | null;
  createStudent: (data: Partial<Student>) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  searchStudents: (skillIds: string[], minLevel?: number) => Promise<void>;
  getStats: () => Promise<any>;
}

export function useStudents(): UseStudentsReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/universities/students', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        throw new Error('Ошибка загрузки студентов');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (data: Partial<Student>) => {
    try {
      setError(null);
      
      const response = await fetch('/universities/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const newStudent = await response.json();
        setStudents(prev => [...prev, newStudent]);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    try {
      setError(null);
      
      const response = await fetch(`/universities/students/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const updatedStudent = await response.json();
        setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/universities/students/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setStudents(prev => prev.filter(s => s.id !== id));
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const searchStudents = async (skillIds: string[], minLevel?: number) => {
    try {
      setLoading(true);
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
        const data = await response.json();
        setStudents(data);
      } else {
        throw new Error('Ошибка поиска студентов');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    try {
      setError(null);
      
      const response = await fetch('/universities/students/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Ошибка загрузки статистики');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    getStats
  };
}
```

## 📊 Мониторинг и аналитика

### Отслеживание действий со студентами

```javascript
// Логирование создания студента
function logStudentCreation(studentId, universityId) {
  analytics.track('student_created', {
    studentId,
    universityId,
    timestamp: new Date().toISOString()
  });
}

// Логирование обновления студента
function logStudentUpdate(studentId, universityId, updatedFields) {
  analytics.track('student_updated', {
    studentId,
    universityId,
    updatedFields,
    timestamp: new Date().toISOString()
  });
}

// Логирование удаления студента
function logStudentDeletion(studentId, universityId) {
  analytics.track('student_deleted', {
    studentId,
    universityId,
    timestamp: new Date().toISOString()
  });
}

// Логирование поиска студентов
function logStudentSearch(universityId, skillIds, resultsCount) {
  analytics.track('students_searched', {
    universityId,
    skillIds,
    resultsCount,
    timestamp: new Date().toISOString()
  });
}
```

## 🎯 Лучшие практики

### Управление студентами

1. **Регулярное обновление данных** - поддерживайте актуальность информации о студентах
2. **Валидация email** - убедитесь, что email адреса студентов корректны
3. **Уникальные студенческие билеты** - каждый студент должен иметь уникальный номер
4. **Отслеживание навыков** - регулярно обновляйте навыки студентов

### Производительность

1. **Пагинация** - используйте пагинацию для больших списков студентов
2. **Кэширование** - кэшируйте часто запрашиваемые данные
3. **Индексация** - используйте индексы для быстрого поиска по навыкам

### Безопасность

1. **Проверка прав** - всегда проверяйте права доступа
2. **Валидация данных** - валидируйте все входящие данные
3. **Логирование** - ведите логи всех операций со студентами
