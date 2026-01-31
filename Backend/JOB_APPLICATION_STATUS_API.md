# API для отображения статуса отклика в деталях вакансии

## Обзор

При просмотре деталей вакансии API теперь возвращает информацию о том, откликался ли текущий пользователь на эту вакансию и какой у неё статус.

## Эндпоинт

### GET /jobs/:id

Получение деталей вакансии с информацией о статусе отклика.

#### Параметры

- `id` (string) - ID вакансии

#### Заголовки

- `Authorization: Bearer <token>` (опционально) - JWT токен для аутентифицированных пользователей

#### Ответ

##### Для аутентифицированных пользователей

```json
{
  "id": "job_123",
  "title": "Frontend Developer",
  "description": "Разработка пользовательских интерфейсов...",
  "location": "Москва",
  "type": "FULL_TIME",
  "experienceLevel": "JUNIOR",
  "status": "ACTIVE",
  "moderationStatus": "APPROVED",
  "views": 15,
  "applicationsCount": 3,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  
  // Информация о статусе отклика
  "hasApplied": true,
  "applicationStatus": "PENDING",
  "appliedAt": "2024-01-15T12:00:00Z",
  "applicationId": "app_456",
  "applicationCoverLetter": "Заинтересован в данной позиции...",
  "applicationNotes": null,
  
  // Дополнительная информация
  "hr": {
    "company": "Tech Corp",
    "firstName": "Иван",
    "lastName": "Петров"
  },
  "skills": [
    {
      "skill": {
        "id": "skill_1",
        "name": "JavaScript",
        "category": "PROGRAMMING"
      },
      "required": true
    }
  ]
}
```

##### Для анонимных пользователей

```json
{
  "id": "job_123",
  "title": "Frontend Developer",
  "description": "Разработка пользовательских интерфейсов...",
  "location": "Москва",
  "type": "FULL_TIME",
  "experienceLevel": "JUNIOR",
  "status": "ACTIVE",
  "moderationStatus": "APPROVED",
  "views": 15,
  "applicationsCount": 3,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  
  // Информация о статусе отклика (всегда false для анонимных)
  "hasApplied": false,
  "applicationStatus": null,
  "appliedAt": null,
  "applicationId": null,
  "applicationCoverLetter": null,
  "applicationNotes": null,
  
  // Дополнительная информация
  "hr": {
    "company": "Tech Corp",
    "firstName": "Иван",
    "lastName": "Петров"
  },
  "skills": [
    {
      "skill": {
        "id": "skill_1",
        "name": "JavaScript",
        "category": "PROGRAMMING"
      },
      "required": true
    }
  ]
}
```

## Поля ответа

### Основные поля вакансии

- `id` - ID вакансии
- `title` - Название вакансии
- `description` - Описание вакансии
- `location` - Местоположение
- `type` - Тип работы (FULL_TIME, PART_TIME, etc.)
- `experienceLevel` - Уровень опыта (ENTRY, JUNIOR, MIDDLE, etc.)
- `status` - Статус вакансии (ACTIVE, PAUSED, CLOSED, etc.)
- `moderationStatus` - Статус модерации (PENDING, APPROVED, REJECTED)
- `views` - Количество просмотров
- `applicationsCount` - Количество откликов
- `createdAt` - Дата создания
- `updatedAt` - Дата обновления

### Поля статуса отклика

- `hasApplied` (boolean) - Откликался ли пользователь на вакансию
- `applicationStatus` (string|null) - Статус отклика:
  - `PENDING` - Ожидает рассмотрения
  - `REVIEWED` - Рассмотрен
  - `ACCEPTED` - Принят
  - `REJECTED` - Отклонен
  - `INTERVIEW_SCHEDULED` - Запланировано собеседование
  - `HIRED` - Принят на работу
  - `WITHDRAWN` - Отозван
- `appliedAt` (string|null) - Дата отклика (ISO 8601)
- `applicationId` (string|null) - ID отклика
- `applicationCoverLetter` (string|null) - Сопроводительное письмо
- `applicationNotes` (string|null) - Заметки HR

## Примеры использования

### JavaScript/TypeScript

```javascript
// Получение деталей вакансии с проверкой статуса отклика
async function getJobWithApplicationStatus(jobId, token) {
  try {
    const response = await fetch(`/api/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const job = await response.json();
    
    if (job.hasApplied) {
      console.log(`✅ Откликнулся на "${job.title}"`);
      console.log(`📊 Статус: ${job.applicationStatus}`);
      console.log(`📅 Дата отклика: ${job.appliedAt}`);
      
      // Показать кнопку "Просмотреть статус" вместо "Откликнуться"
      showApplicationStatusButton(job);
    } else {
      console.log(`❌ Не откликался на "${job.title}"`);
      // Показать кнопку "Откликнуться"
      showApplyButton(job);
    }
    
    return job;
  } catch (error) {
    console.error('Ошибка при получении деталей вакансии:', error);
  }
}

// Функция для отображения кнопки статуса
function showApplicationStatusButton(job) {
  const button = document.getElementById('apply-button');
  
  switch (job.applicationStatus) {
    case 'PENDING':
      button.textContent = 'Ожидает рассмотрения';
      button.className = 'btn btn-warning';
      break;
    case 'ACCEPTED':
      button.textContent = 'Принят';
      button.className = 'btn btn-success';
      break;
    case 'REJECTED':
      button.textContent = 'Отклонен';
      button.className = 'btn btn-danger';
      break;
    case 'INTERVIEW_SCHEDULED':
      button.textContent = 'Собеседование назначено';
      button.className = 'btn btn-info';
      break;
    default:
      button.textContent = 'Отклик отправлен';
      button.className = 'btn btn-secondary';
  }
  
  button.disabled = true;
}

// Функция для отображения кнопки отклика
function showApplyButton(job) {
  const button = document.getElementById('apply-button');
  button.textContent = 'Откликнуться';
  button.className = 'btn btn-primary';
  button.disabled = false;
  button.onclick = () => applyToJob(job.id);
}
```

### React компонент

```jsx
import React, { useState, useEffect } from 'react';

function JobDetails({ jobId, token }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const jobData = await response.json();
      setJob(jobData);
    } catch (error) {
      console.error('Ошибка при загрузке деталей вакансии:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (!job?.hasApplied) {
      return 'Откликнуться';
    }
    
    switch (job.applicationStatus) {
      case 'PENDING':
        return 'Ожидает рассмотрения';
      case 'ACCEPTED':
        return 'Принят';
      case 'REJECTED':
        return 'Отклонен';
      case 'INTERVIEW_SCHEDULED':
        return 'Собеседование назначено';
      default:
        return 'Отклик отправлен';
    }
  };

  const getButtonClass = () => {
    if (!job?.hasApplied) return 'btn-primary';
    
    switch (job.applicationStatus) {
      case 'PENDING':
        return 'btn-warning';
      case 'ACCEPTED':
        return 'btn-success';
      case 'REJECTED':
        return 'btn-danger';
      case 'INTERVIEW_SCHEDULED':
        return 'btn-info';
      default:
        return 'btn-secondary';
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!job) return <div>Вакансия не найдена</div>;

  return (
    <div className="job-details">
      <h1>{job.title}</h1>
      <p>{job.description}</p>
      <p>Местоположение: {job.location}</p>
      <p>Тип: {job.type}</p>
      
      {job.hasApplied && (
        <div className="application-status">
          <h3>Статус отклика</h3>
          <p>Статус: {job.applicationStatus}</p>
          <p>Дата отклика: {new Date(job.appliedAt).toLocaleDateString()}</p>
          {job.applicationCoverLetter && (
            <p>Сопроводительное письмо: {job.applicationCoverLetter}</p>
          )}
        </div>
      )}
      
      <button 
        className={`btn ${getButtonClass()}`}
        disabled={job.hasApplied}
        onClick={() => job.hasApplied ? null : applyToJob(job.id)}
      >
        {getButtonText()}
      </button>
    </div>
  );
}

export default JobDetails;
```

## Обработка ошибок

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Job not found",
  "error": "Not Found"
}
```

### 401 Unauthorized (для защищенных операций)
```json
{
  "statusCode": 401,
  "message": "Неверный или отсутствующий токен",
  "error": "Unauthorized"
}
```

## Примечания

1. **Анонимные пользователи** видят базовую информацию о вакансии без статуса отклика
2. **Аутентифицированные пользователи** видят полную информацию, включая статус своих откликов
3. **Статус отклика** возвращается только для пользователей с ролью `CANDIDATE`
4. **Поля отклика** (`hasApplied`, `applicationStatus`, etc.) всегда присутствуют в ответе для единообразия API
5. **Счетчик просмотров** увеличивается только для уникальных просмотров (по пользователю или IP+UserAgent)

## Тестирование

Для тестирования функциональности используйте:

```bash
node test-job-application-status.js
```

Этот тест проверяет:
- Создание пользователя и вакансии
- Просмотр деталей вакансии без отклика
- Создание отклика
- Просмотр деталей вакансии с откликом
- Анонимный просмотр
