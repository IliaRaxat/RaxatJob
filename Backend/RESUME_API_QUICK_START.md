# 🚀 Быстрый старт с API резюме

## 📋 Основные эндпоинты

### 1. Создание резюме
```http
POST /resumes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Frontend Developer",
  "summary": "Опытный разработчик с 5+ лет опыта",
  "skills": [
    {
      "name": "JavaScript",
      "level": 5,
      "category": "Programming"
    }
  ],
  "isDefault": true,
  "isPublic": true
}
```

### 2. Получение списка резюме
```http
GET /resumes?page=1&limit=10
Authorization: Bearer <token>
```

### 3. Получение резюме по ID
```http
GET /resumes/{id}
Authorization: Bearer <token>
```

### 4. Обновление резюме
```http
PUT /resumes/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "summary": "Updated Summary"
}
```

### 5. Удаление резюме
```http
DELETE /resumes/{id}
Authorization: Bearer <token>
```

## 🔍 Дополнительные возможности

### Поиск резюме
```http
GET /resumes/search?q=frontend
Authorization: Bearer <token>
```

### Публичные резюме
```http
GET /resumes/public?page=1&limit=10
```

### Статистика
```http
GET /resumes/stats
Authorization: Bearer <token>
```

### Дублирование
```http
POST /resumes/{id}/duplicate
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Copy of Resume"
}
```

### Установка основного
```http
POST /resumes/{id}/set-default
Authorization: Bearer <token>
```

## 📊 Структуры данных

### Навыки
```json
{
  "name": "JavaScript",
  "level": 5,
  "category": "Programming"
}
```

### Опыт работы
```json
{
  "company": "Tech Corp",
  "position": "Developer",
  "startDate": "2020-01-01",
  "endDate": "2023-12-31",
  "isCurrent": false,
  "description": "Work description",
  "technologies": ["React", "TypeScript"]
}
```

### Образование
```json
{
  "institution": "University",
  "degree": "Bachelor",
  "field": "Computer Science",
  "startDate": "2016-09-01",
  "endDate": "2020-06-30",
  "isCurrent": false,
  "gpa": 4.5
}
```

## 🎯 Примеры использования

### JavaScript
```javascript
// Создание резюме
const resume = await fetch('/resumes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Frontend Developer',
    summary: 'Experienced developer',
    skills: [
      { name: 'JavaScript', level: 5, category: 'Programming' }
    ],
    isDefault: true,
    isPublic: true
  })
});

// Получение списка
const resumes = await fetch('/resumes', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Поиск
const searchResults = await fetch('/resumes/search?q=frontend', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### cURL
```bash
# Создание
curl -X POST http://localhost:3000/resumes \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Developer", "isDefault": true}'

# Получение списка
curl -X GET http://localhost:3000/resumes \
  -H "Authorization: Bearer token"

# Поиск
curl -X GET "http://localhost:3000/resumes/search?q=developer" \
  -H "Authorization: Bearer token"
```

## ⚡ Быстрые команды

### Создать резюме из шаблона
```http
POST /resumes/from-template
Authorization: Bearer <token>
Content-Type: application/json

{
  "templateId": "frontend-developer",
  "title": "My Resume"
}
```

### Массовое обновление
```http
POST /resumes/bulk-update
Authorization: Bearer <token>
Content-Type: application/json

{
  "resumeIds": ["id1", "id2"],
  "updates": {"isPublic": false}
}
```

### Экспорт резюме
```http
POST /resumes/export/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "json"
}
```

## 🔗 Интеграция с откликами

При создании отклика основное резюме автоматически прикрепляется:

```javascript
// Создание отклика
const application = await fetch('/applications', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobId: 'job_123',
    coverLetter: 'I am interested in this position'
    // resumeId автоматически берется из основного резюме
  })
});
```

## 📈 Мониторинг

### Получение статистики
```javascript
const stats = await fetch('/resumes/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// stats содержит:
// - totalResumes: общее количество
// - publicResumes: публичные
// - privateResumes: приватные
// - hasDefault: есть ли основное
// - recentResumes: недавние
```

## 🎨 Шаблоны

### Доступные шаблоны
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
      "description": "Шаблон для frontend разработчиков"
    },
    {
      "id": "data-scientist", 
      "name": "Data Scientist",
      "description": "Шаблон для data scientists"
    },
    {
      "id": "backend-developer",
      "name": "Backend Developer", 
      "description": "Шаблон для backend разработчиков"
    }
  ]
}
```

## 🔒 Безопасность

- Все эндпоинты требуют JWT токен
- Пользователи видят только свои резюме
- Публичные резюме доступны всем
- Валидация всех входных данных

## ❌ Обработка ошибок

```javascript
try {
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
  
  const result = await response.json();
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

## 🚀 Следующие шаги

1. **Создайте первое резюме** используя POST /resumes
2. **Изучите шаблоны** через GET /resumes/templates
3. **Настройте основное резюме** через POST /resumes/{id}/set-default
4. **Используйте поиск** для быстрого доступа к резюме
5. **Экспортируйте данные** для резервного копирования

## 📚 Дополнительные ресурсы

- [Полная документация API](./COMPREHENSIVE_RESUME_API_DOCS.md)
- [Руководство по миграции](./RESUME_MIGRATION_GUIDE.md)
- [Примеры использования](./examples/structured-resume-example.js)
- [Структурированные резюме API](./STRUCTURED_RESUMES_API.md)
