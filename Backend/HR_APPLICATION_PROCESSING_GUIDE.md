# 🎯 Руководство по обработке заявок для HR

## 📋 Обзор системы

Система обработки заявок позволяет HR-специалистам эффективно управлять откликами кандидатов на вакансии. Включает в себя:

- **Просмотр откликов** - получение списка всех заявок
- **Фильтрация** - поиск по статусам, вакансиям, кандидатам
- **Управление статусами** - изменение статусов заявок
- **Заметки** - добавление комментариев к заявкам
- **Уведомления** - автоматические уведомления о изменениях

## 🔄 Статусы заявок

### Основные статусы:
- **`PENDING`** - Ожидает рассмотрения (новые заявки)
- **`REVIEWED`** - Рассмотрен HR
- **`ACCEPTED`** - Принят (кандидат подходит)
- **`REJECTED`** - Отклонен
- **`INTERVIEW_SCHEDULED`** - Запланировано собеседование
- **`HIRED`** - Принят на работу
- **`WITHDRAWN`** - Отозван кандидатом

### Workflow обработки:
```
PENDING → REVIEWED → ACCEPTED → INTERVIEW_SCHEDULED → HIRED
    ↓         ↓
REJECTED  WITHDRAWN
```

## 🚀 API Эндпоинты

### 1. Получение всех заявок

#### Эндпоинт
```http
GET /applications
Authorization: Bearer <hr_token>
```

#### Параметры запроса (опциональные)
| Параметр | Тип | Описание |
|----------|-----|----------|
| `status` | enum | Фильтр по статусу заявки |
| `jobId` | string | Фильтр по ID вакансии |
| `candidateId` | string | Фильтр по ID кандидата |

#### Примеры запросов

**cURL:**
```bash
# Все заявки
curl -X GET http://localhost:3000/applications \
  -H "Authorization: Bearer <hr_token>"

# Только новые заявки
curl -X GET "http://localhost:3000/applications?status=PENDING" \
  -H "Authorization: Bearer <hr_token>"

# Заявки на конкретную вакансию
curl -X GET "http://localhost:3000/applications?jobId=job_123" \
  -H "Authorization: Bearer <hr_token>"
```

**JavaScript:**
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
    headers: { 'Authorization': `Bearer ${hrToken}` }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Примеры использования
const newApplications = await getApplications({ status: 'PENDING' });
const jobApplications = await getApplications({ jobId: 'job_123' });
const allApplications = await getApplications();
```

#### Ответ при успехе
```json
[
  {
    "id": "application_123",
    "status": "PENDING",
    "coverLetter": "Здравствуйте! Меня заинтересовала вакансия...",
    "resume": {
      "id": "resume_id",
      "title": "Frontend Developer Resume",
      "summary": "Опытный разработчик с 5+ лет опыта",
      "isDefault": true
    },
    "appliedAt": "2024-01-15T00:00:00.000Z",
    "notes": null,
    "job": {
      "id": "job_123",
      "title": "Frontend Developer",
      "location": "Москва",
      "type": "FULL_TIME",
      "hr": {
        "company": "ООО Технологии"
      }
    },
    "candidate": {
      "id": "candidate_123",
      "firstName": "Анна",
      "lastName": "Смирнова",
      "phone": "+7-999-123-45-67",
      "user": {
        "email": "anna@example.com"
      }
    }
  }
]
```

### 2. Получение заявок на мои вакансии

#### Эндпоинт
```http
GET /applications/my
Authorization: Bearer <hr_token>
```

#### Пример запроса
```bash
curl -X GET http://localhost:3000/applications/my \
  -H "Authorization: Bearer <hr_token>"
```

### 3. Получение детальной информации о заявке

#### Эндпоинт
```http
GET /applications/:id
Authorization: Bearer <hr_token>
```

#### Пример запроса
```bash
curl -X GET http://localhost:3000/applications/application_123 \
  -H "Authorization: Bearer <hr_token>"
```

#### Ответ при успехе
```json
{
  "id": "application_123",
  "status": "PENDING",
  "coverLetter": "Подробное сопроводительное письмо...",
    "resume": {
      "id": "resume_id",
      "title": "Frontend Developer Resume", 
      "summary": "Опытный разработчик с 5+ лет опыта",
      "isDefault": true
    },
  "appliedAt": "2024-01-15T00:00:00.000Z",
  "notes": null,
  "job": {
    "id": "job_123",
    "title": "Frontend Developer",
    "description": "Описание вакансии...",
    "location": "Москва",
    "type": "FULL_TIME",
    "status": "ACTIVE",
    "hr": {
      "id": "hr_id",
      "company": "ООО Технологии"
    }
  },
  "candidate": {
    "id": "candidate_123",
    "firstName": "Анна",
    "lastName": "Смирнова",
    "phone": "+7-999-123-45-67",
    "user": {
      "email": "anna@example.com"
    }
  }
}
```

### 4. Обновление статуса заявки (основной функционал)

#### Эндпоинт
```http
PATCH /applications/:id
Authorization: Bearer <hr_token>
Content-Type: application/json
```

#### Параметры запроса
| Поле | Тип | Обязательное | Описание |
|------|-----|---------------|----------|
| `status` | enum | ✅ | Новый статус заявки |
| `notes` | string | ❌ | Заметки HR (до 1000 символов) |

#### Примеры запросов

**cURL:**
```bash
# Отметить как рассмотренную
curl -X PATCH http://localhost:3000/applications/application_123 \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REVIEWED",
    "notes": "Кандидат подходит по требованиям"
  }'

# Принять кандидата
curl -X PATCH http://localhost:3000/applications/application_123 \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACCEPTED",
    "notes": "Отличный кандидат, приглашаем на собеседование"
  }'

# Отклонить кандидата
curl -X PATCH http://localhost:3000/applications/application_123 \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "notes": "Не подходит по опыту работы"
  }'

# Назначить собеседование
curl -X PATCH http://localhost:3000/applications/application_123 \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INTERVIEW_SCHEDULED",
    "notes": "Собеседование назначено на 20.01.2024 в 14:00"
  }'

# Нанять кандидата
curl -X PATCH http://localhost:3000/applications/application_123 \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "HIRED",
    "notes": "Кандидат принят на работу"
  }'
```

**JavaScript:**
```javascript
async function updateApplicationStatus(applicationId, status, notes = null) {
  const response = await fetch(`/applications/${applicationId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${hrToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status,
      notes
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Примеры использования
await updateApplicationStatus('application_123', 'REVIEWED', 'Кандидат подходит');
await updateApplicationStatus('application_123', 'ACCEPTED', 'Приглашаем на собеседование');
await updateApplicationStatus('application_123', 'REJECTED', 'Не подходит по опыту');
await updateApplicationStatus('application_123', 'INTERVIEW_SCHEDULED', 
  'Собеседование 20.01.2024 в 14:00');
await updateApplicationStatus('application_123', 'HIRED', 'Кандидат принят на работу');
```

#### Ответ при успехе
```json
{
  "id": "application_123",
  "status": "REVIEWED",
  "notes": "Кандидат подходит по требованиям",
  "coverLetter": "Подробное сопроводительное письмо...",
    "resume": {
      "id": "resume_id",
      "title": "Frontend Developer Resume", 
      "summary": "Опытный разработчик с 5+ лет опыта",
      "isDefault": true
    },
  "appliedAt": "2024-01-15T00:00:00.000Z",
  "job": {
    "id": "job_123",
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

### 5. Удаление заявки

#### Эндпоинт
```http
DELETE /applications/:id
Authorization: Bearer <hr_token>
```

#### Пример запроса
```bash
curl -X DELETE http://localhost:3000/applications/application_123 \
  -H "Authorization: Bearer <hr_token>"
```

## 🎯 Практические сценарии использования

### Сценарий 1: Ежедневная обработка новых заявок

```javascript
// 1. Получить все новые заявки
const newApplications = await getApplications({ status: 'PENDING' });

console.log(`Найдено ${newApplications.length} новых заявок`);

// 2. Просмотреть каждую заявку
for (const application of newApplications) {
  console.log(`Заявка от ${application.candidate.firstName} ${application.candidate.lastName}`);
  console.log(`Вакансия: ${application.job.title}`);
  console.log(`Резюме: ${application.resumeUrl}`);
  console.log(`Сопроводительное письмо: ${application.coverLetter}`);
  console.log('---');
}

// 3. Обработать заявки
// Отметить как рассмотренные
await updateApplicationStatus('application_123', 'REVIEWED', 'Рассмотрено HR');

// Принять подходящих кандидатов
await updateApplicationStatus('application_456', 'ACCEPTED', 'Отличный кандидат!');

// Отклонить неподходящих
await updateApplicationStatus('application_789', 'REJECTED', 'Не подходит по опыту');
```

### Сценарий 2: Фильтрация и поиск заявок

```javascript
// Получить заявки по статусам
const pending = await getApplications({ status: 'PENDING' });
const reviewed = await getApplications({ status: 'REVIEWED' });
const accepted = await getApplications({ status: 'ACCEPTED' });
const rejected = await getApplications({ status: 'REJECTED' });

// Получить заявки на конкретную вакансию
const jobApplications = await getApplications({ jobId: 'job_123' });

// Получить заявки конкретного кандидата
const candidateApplications = await getApplications({ candidateId: 'candidate_123' });
```

### Сценарий 3: Полный цикл обработки заявки

```javascript
async function processApplication(applicationId) {
  try {
    // 1. Получить детали заявки
    const application = await fetch(`/applications/${applicationId}`, {
      headers: { 'Authorization': `Bearer ${hrToken}` }
    }).then(r => r.json());
    
    console.log(`Обработка заявки от ${application.candidate.firstName} ${application.candidate.lastName}`);
    
    // 2. Рассмотреть заявку
    await updateApplicationStatus(applicationId, 'REVIEWED', 'Заявка рассмотрена');
    
    // 3. Принять решение
    const decision = 'ACCEPTED'; // или 'REJECTED'
    const notes = 'Кандидат подходит по всем критериям';
    
    await updateApplicationStatus(applicationId, decision, notes);
    
    // 4. Если принят - назначить собеседование
    if (decision === 'ACCEPTED') {
      await updateApplicationStatus(applicationId, 'INTERVIEW_SCHEDULED', 
        'Собеседование назначено на 25.01.2024 в 15:00');
    }
    
    console.log(`Заявка ${applicationId} обработана со статусом ${decision}`);
    
  } catch (error) {
    console.error(`Ошибка при обработке заявки ${applicationId}:`, error.message);
  }
}
```

### Сценарий 4: Массовая обработка заявок

```javascript
async function bulkProcessApplications(applicationIds, status, notes) {
  const results = [];
  
  for (const applicationId of applicationIds) {
    try {
      const result = await updateApplicationStatus(applicationId, status, notes);
      results.push({ id: applicationId, success: true, result });
    } catch (error) {
      results.push({ id: applicationId, success: false, error: error.message });
    }
  }
  
  return results;
}

// Пример использования
const applicationIds = ['app_1', 'app_2', 'app_3'];
const results = await bulkProcessApplications(
  applicationIds, 
  'REVIEWED', 
  'Массово рассмотрено HR'
);

console.log('Результаты массовой обработки:', results);
```

## 📊 Аналитика и отчетность

### Получение статистики по заявкам

```javascript
async function getApplicationStats() {
  const allApplications = await getApplications();
  
  const stats = {
    total: allApplications.length,
    pending: allApplications.filter(app => app.status === 'PENDING').length,
    reviewed: allApplications.filter(app => app.status === 'REVIEWED').length,
    accepted: allApplications.filter(app => app.status === 'ACCEPTED').length,
    rejected: allApplications.filter(app => app.status === 'REJECTED').length,
    interviewScheduled: allApplications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length,
    hired: allApplications.filter(app => app.status === 'HIRED').length,
    withdrawn: allApplications.filter(app => app.status === 'WITHDRAWN').length
  };
  
  return stats;
}

// Использование
const stats = await getApplicationStats();
console.log('Статистика заявок:', stats);
```

### Анализ по вакансиям

```javascript
async function getJobApplicationStats(jobId) {
  const jobApplications = await getApplications({ jobId });
  
  return {
    jobId,
    totalApplications: jobApplications.length,
    statusBreakdown: {
      pending: jobApplications.filter(app => app.status === 'PENDING').length,
      accepted: jobApplications.filter(app => app.status === 'ACCEPTED').length,
      rejected: jobApplications.filter(app => app.status === 'REJECTED').length,
      hired: jobApplications.filter(app => app.status === 'HIRED').length
    }
  };
}
```

## 🔔 Уведомления

### Автоматические уведомления

Система автоматически отправляет уведомления при изменении статуса заявки:

- **Кандидату** - о изменении статуса его заявки
- **HR** - о новых заявках на вакансии
- **Администраторам** - о критических событиях

### Типы уведомлений:
- **EMAIL** - Email уведомления
- **PUSH** - Push уведомления в приложении
- **IN_APP** - Внутренние уведомления в системе
- **SMS** - SMS уведомления (опционально)

## 🛡️ Безопасность и права доступа

### Права HR:
- Просмотр всех заявок на свои вакансии
- Изменение статусов заявок
- Добавление заметок к заявкам
- Удаление заявок (в исключительных случаях)

### Ограничения:
- HR может изменять только заявки на свои вакансии
- Нельзя изменять заявки других HR
- Все действия логируются для аудита

## 🚨 Обработка ошибок

### Типичные ошибки:

```javascript
// 403 - Нет прав на изменение заявки
if (error.status === 403) {
  console.error('У вас нет прав для изменения этой заявки');
}

// 404 - Заявка не найдена
if (error.status === 404) {
  console.error('Заявка не найдена');
}

// 400 - Неверные параметры
if (error.status === 400) {
  console.error('Неверные параметры запроса:', error.message);
}
```

### Обработка ошибок в коде:

```javascript
async function safeUpdateApplication(applicationId, status, notes) {
  try {
    return await updateApplicationStatus(applicationId, status, notes);
  } catch (error) {
    if (error.status === 403) {
      console.error('Нет прав для изменения заявки');
    } else if (error.status === 404) {
      console.error('Заявка не найдена');
    } else {
      console.error('Неожиданная ошибка:', error.message);
    }
    throw error;
  }
}
```

## 📝 Лучшие практики

### 1. Регулярная обработка заявок
- Проверяйте новые заявки ежедневно
- Отвечайте кандидатам в течение 2-3 рабочих дней
- Используйте фильтры для быстрого поиска

### 2. Качественные заметки
- Добавляйте подробные заметки к заявкам
- Указывайте причины принятых решений
- Используйте стандартные шаблоны для ответов

### 3. Статусы и workflow
- Следуйте логической последовательности статусов
- Не пропускайте этапы (например, REVIEWED перед ACCEPTED)
- Своевременно обновляйте статусы

### 4. Аналитика
- Регулярно анализируйте статистику заявок
- Отслеживайте конверсию по этапам
- Используйте данные для улучшения процесса

## 🔧 Интеграция с другими системами

### CRM интеграция
```javascript
// Отправка данных в CRM при найме
async function notifyCRM(applicationId) {
  const application = await getApplication(applicationId);
  
  if (application.status === 'HIRED') {
    // Отправить данные в CRM
    await sendToCRM({
      candidate: application.candidate,
      job: application.job,
      hireDate: new Date()
    });
  }
}
```

### Email уведомления
```javascript
// Отправка email кандидату
async function notifyCandidate(applicationId, status) {
  const application = await getApplication(applicationId);
  
  const emailTemplate = getEmailTemplate(status);
  await sendEmail({
    to: application.candidate.user.email,
    subject: `Статус заявки на вакансию ${application.job.title}`,
    body: emailTemplate
  });
}
```

## 📚 Дополнительные ресурсы

- [API Guide](./API_GUIDE.md) - Полное руководство по API
- [Admin Dashboard](./ADMIN_DASHBOARD_API.md) - Административная панель
- [Moderation System](./MODERATION_SYSTEM_GUIDE.md) - Система модерации
- [Notifications](./NOTIFICATIONS.md) - Система уведомлений

---

**Примечание:** Все примеры кода используют современный JavaScript (ES6+) и могут быть адаптированы под ваш стек технологий.
