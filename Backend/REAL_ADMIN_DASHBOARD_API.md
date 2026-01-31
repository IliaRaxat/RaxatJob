# 📊 РЕАЛЬНЫЙ API для дашборда администратора

## ⚠️ ВАЖНО: Это реальная структура данных из кода!

---

## 🔐 Аутентификация
```
Authorization: Bearer <admin_jwt_token>
```

**Требования:** Роль `ADMIN`

---

## 📈 1. Общая статистика (Overview)

### GET /admin/analytics/overview
**Реальный ответ:**
```json
{
  "overview": {
    "totalUsers": 1250,
    "totalJobs": 340,
    "totalApplications": 2100,
    "totalCompanies": 45,
    "totalUniversities": 25,
    "pendingModeration": 15
  },
  "recentActivity": [
    {
      "id": "event_id",
      "type": "USER_LOGIN",
      "description": "Пользователь вошел в систему",
      "createdAt": "2025-10-18T16:49:17.000Z",
      "user": {
        "email": "user@example.com",
        "role": "HR"
      }
    }
  ]
}
```

---

## 👥 2. Управление пользователями

### GET /admin/users
**Параметры:**
```
?role=HR&isActive=true&page=1&limit=50
```

**Реальный ответ:**
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "role": "HR",
      "isActive": true,
      "lastLogin": "2025-10-18T16:49:17.000Z",
      "createdAt": "2025-10-18T16:49:17.000Z",
      "hrProfile": {
        "company": "IT Company"
      },
      "universityProfile": null
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3
}
```

### PATCH /admin/users/{id}/role
**Тело запроса:**
```json
{
  "role": "ADMIN"
}
```

**Ответ:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "ADMIN",
  "isActive": true,
  "updatedAt": "2025-10-18T16:49:17.000Z"
}
```

---

## 🔍 3. Модерация вакансий

### GET /admin/moderation/jobs
**Параметры:**
```
?status=PENDING&page=1&limit=20
```

**Реальный ответ:**
```json
{
  "jobs": [
    {
      "id": "job_id",
      "title": "Frontend Developer",
      "description": "Описание вакансии...",
      "status": "DRAFT",
      "moderationStatus": "PENDING",
      "createdAt": "2025-10-18T16:49:17.000Z",
      "hr": {
        "company": "IT Company",
        "firstName": "Иван",
        "lastName": "Петров"
      },
      "skills": [
        {
          "skill": {
            "id": "skill_id",
            "name": "React",
            "category": "Frontend"
          }
        }
      ],
      "_count": {
        "applications": 5
      }
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### PATCH /admin/moderation/jobs/{id}/approve
**Тело запроса:**
```json
{
  "comment": "Вакансия одобрена"
}
```

**Ответ:**
```json
{
  "id": "job_id",
  "moderationStatus": "APPROVED",
  "approvedAt": "2025-10-18T16:49:17.000Z",
  "approvedBy": "admin_id"
}
```

### GET /admin/moderation/stats
**Реальный ответ:**
```json
{
  "totalPending": 15,
  "totalApproved": 280,
  "totalRejected": 45,
  "todayPending": 3,
  "thisWeekPending": 12,
  "averageModerationTime": "2.5 hours"
}
```

---

## 📊 4. Аналитика (реальная реализация)

### GET /admin/analytics/companies
**Реальный ответ:**
```json
{
  "totalCompanies": 45,
  "companies": [
    {
      "company": "IT Company",
      "jobsCount": 12,
      "lastActivity": "2025-10-18T16:49:17.000Z"
    }
  ]
}
```

### GET /admin/analytics/universities
**Реальный ответ:**
```json
{
  "totalUniversities": 25,
  "universities": [
    {
      "name": "МГУ",
      "studentsCount": 156,
      "lastActivity": "2025-10-18T16:49:17.000Z"
    }
  ]
}
```

### GET /admin/analytics/skills
**Реальный ответ:**
```json
{
  "totalSkills": 150,
  "skills": [
    {
      "name": "JavaScript",
      "count": 156,
      "category": "Frontend"
    },
    {
      "name": "React",
      "count": 134,
      "category": "Frontend"
    }
  ]
}
```

---

## ⚙️ 5. Системные настройки

### GET /admin/settings
**Реальный ответ:**
```json
{
  "settings": [
    {
      "key": "max_file_size",
      "value": "10485760",
      "description": "Максимальный размер файла"
    }
  ]
}
```

---

## 🧪 Реальные примеры использования

### 1. Получить общую статистику
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/admin/analytics/overview
```

**Реальный ответ:**
```json
{
  "overview": {
    "totalUsers": 1250,
    "totalJobs": 340,
    "totalApplications": 2100,
    "totalCompanies": 45,
    "totalUniversities": 25,
    "pendingModeration": 15
  },
  "recentActivity": [...]
}
```

### 2. Получить пользователей
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:3000/admin/users?page=1&limit=20"
```

**Реальный ответ:**
```json
{
  "users": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### 3. Получить вакансии на модерацию
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:3000/admin/moderation/jobs?status=PENDING"
```

**Реальный ответ:**
```json
{
  "jobs": [...],
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

## 🔧 Правильная структура для фронтенда

### Главная страница дашборда:
```javascript
// 1. Загрузить общую статистику
const response = await fetch('/admin/analytics/overview');
const data = await response.json();

// Использовать данные:
const overview = data.overview; // { totalUsers, totalJobs, ... }
const recentActivity = data.recentActivity; // массив событий

// Отобразить метрики:
console.log(`Пользователей: ${overview.totalUsers}`);
console.log(`Вакансий: ${overview.totalJobs}`);
console.log(`На модерации: ${overview.pendingModeration}`);
```

### Раздел "Пользователи":
```javascript
// Загрузить пользователей
const response = await fetch('/admin/users?page=1&limit=20');
const data = await response.json();

// Использовать данные:
const users = data.users; // массив пользователей
const pagination = {
  total: data.total,
  page: data.page,
  limit: data.limit,
  totalPages: data.totalPages
};
```

### Раздел "Модерация":
```javascript
// Загрузить вакансии на модерацию
const response = await fetch('/admin/moderation/jobs?status=PENDING');
const data = await response.json();

// Использовать данные:
const jobs = data.jobs; // массив вакансий
const pagination = {
  total: data.total,
  page: data.page,
  limit: data.limit,
  totalPages: data.totalPages
};
```

---

## ⚠️ Ключевые отличия от документации

1. **Общая статистика** возвращается в объекте `overview`, а не напрямую
2. **Пользователи** возвращаются в массиве `users` с пагинацией
3. **Вакансии** возвращаются в массиве `jobs` с пагинацией
4. **Активность** возвращается в массиве `recentActivity`
5. **Все списки** имеют пагинацию: `total`, `page`, `limit`, `totalPages`

---

## 🎯 Рекомендуемые компоненты UI

### Карточки метрик:
```javascript
const metrics = [
  { title: 'Пользователи', value: overview.totalUsers, icon: '👥' },
  { title: 'Вакансии', value: overview.totalJobs, icon: '💼' },
  { title: 'Отклики', value: overview.totalApplications, icon: '📝' },
  { title: 'На модерации', value: overview.pendingModeration, icon: '⏳' }
];
```

### Таблицы с пагинацией:
```javascript
const tableData = {
  items: users, // или jobs
  pagination: {
    current: page,
    total: totalPages,
    onPageChange: (newPage) => loadData(newPage)
  }
};
```

**Теперь документация соответствует реальному API!** 🚀
