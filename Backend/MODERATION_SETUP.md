# Настройка системы модерации

## Шаги для запуска

### 1. Обновление базы данных
```bash
# Применить миграцию для добавления роли MODERATOR
npx prisma migrate dev --name add_moderator_role

# Перегенерировать Prisma клиент
npx prisma generate
```

### 2. Создание пользователей с ролями

#### Создание админа
```sql
INSERT INTO users (id, email, password, role, "isActive", "createdAt", "updatedAt")
VALUES ('admin-id', 'admin@example.com', '$2b$10$...', 'ADMIN', true, NOW(), NOW());
```

#### Создание модератора
```sql
INSERT INTO users (id, email, password, role, "isActive", "createdAt", "updatedAt")
VALUES ('moderator-id', 'moderator@example.com', '$2b$10$...', 'MODERATOR', true, NOW(), NOW());
```

### 3. Тестирование API

#### Регистрация HR пользователя
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@company.com",
    "password": "password123",
    "role": "HR",
    "firstName": "Иван",
    "lastName": "Петров",
    "company": "ООО Компания"
  }'
```

#### Создание вакансии (требует модерации)
```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <hr_token>" \
  -d '{
    "title": "Frontend Developer",
    "description": "Разработка пользовательских интерфейсов",
    "requirements": "React, TypeScript",
    "salaryMin": 80000,
    "salaryMax": 120000,
    "location": "Москва",
    "type": "FULL_TIME",
    "experienceLevel": "MIDDLE"
  }'
```

#### Просмотр вакансий на модерацию (Модератор)
```bash
curl -X GET http://localhost:3000/moderator/jobs \
  -H "Authorization: Bearer <moderator_token>"
```

#### Одобрение вакансии (Модератор)
```bash
curl -X PATCH http://localhost:3000/moderator/jobs/{job_id}/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <moderator_token>" \
  -d '{
    "notes": "Вакансия соответствует требованиям"
  }'
```

#### Просмотр статистики модерации
```bash
curl -X GET http://localhost:3000/moderator/stats \
  -H "Authorization: Bearer <moderator_token>"
```

#### Админ панель - общая статистика
```bash
curl -X GET http://localhost:3000/admin/analytics/overview \
  -H "Authorization: Bearer <admin_token>"
```

#### Массовое одобрение вакансий (Админ)
```bash
curl -X PATCH http://localhost:3000/admin/moderation/bulk-approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "jobIds": ["job1", "job2", "job3"]
  }'
```

## Проверка работы системы

### 1. Создание вакансии
- HR создает вакансию
- Вакансия получает статус `PENDING` (на модерации)
- Статус вакансии `DRAFT` (не опубликована)

### 2. Модерация
- Модератор видит вакансию в списке на модерацию
- Может одобрить, отклонить или вернуть на доработку
- При одобрении вакансия становится `ACTIVE` и публикуется

### 3. Публичный доступ
- Только одобренные вакансии видны в публичном списке
- Пользователи могут откликаться только на активные вакансии

## Роли и права

| Роль | Создание вакансий | Модерация | Админ панель | Просмотр всех вакансий |
|------|------------------|-----------|--------------|----------------------|
| HR | ✅ (на модерацию) | ❌ | ❌ | ❌ |
| MODERATOR | ❌ | ✅ | ❌ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| CANDIDATE | ❌ | ❌ | ❌ | ✅ (только активные) |

## Мониторинг

### Логи модерации
```sql
SELECT * FROM audit_logs 
WHERE action IN ('JOB_APPROVED', 'JOB_REJECTED', 'JOB_RETURNED')
ORDER BY "createdAt" DESC;
```

### Статистика модерации
```sql
SELECT 
  moderation_status,
  COUNT(*) as count
FROM jobs 
GROUP BY moderation_status;
```

### Активность модераторов
```sql
SELECT 
  u.email,
  COUNT(*) as moderated_jobs
FROM jobs j
JOIN users u ON j.moderator_id = u.id
WHERE j.moderated_at IS NOT NULL
GROUP BY u.id, u.email;
```

## Настройка уведомлений

Можно добавить уведомления при изменении статуса модерации:

```typescript
// В ModeratorService после одобрения/отклонения
await this.notificationService.create({
  userId: job.hr.userId,
  type: 'JOB_MODERATED',
  title: 'Вакансия одобрена',
  message: `Вакансия "${job.title}" была одобрена модератором`,
});
```

## Безопасность

- Все эндпоинты защищены JWT аутентификацией
- Проверка ролей на уровне контроллера
- Аудит всех действий модерации
- Валидация входных данных
- Защита от CSRF атак
