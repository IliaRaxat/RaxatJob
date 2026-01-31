# API для изменения статуса стажировки

## 📝 Изменение статуса стажировки

**Эндпоинт:** `PATCH /internships/{id}`

**Авторизация:** `Bearer <JWT_TOKEN>`

**Content-Type:** `application/json`

> ⚠️ **Важно:** Используйте только стандартный эндпоинт `PATCH /internships/{id}` для всех изменений статуса. Специальных эндпоинтов типа `/publish` не существует.

### Запрос

```http
PATCH /internships/{id}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

### Параметры

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Да | ID стажировки |
| `status` | string | Да | Новый статус стажировки |

### Возможные статусы

| Статус | Описание |
|--------|----------|
| `DRAFT` | Черновик |
| `ACTIVE` | Активная |
| `PAUSED` | Приостановлена |
| `COMPLETED` | Завершена |
| `CANCELLED` | Отменена |

### Примеры запросов

#### 1. Публикация стажировки (DRAFT → ACTIVE)
```json
{
  "status": "ACTIVE"
}
```

#### 2. Приостановка стажировки (ACTIVE → PAUSED)
```json
{
  "status": "PAUSED"
}
```

#### 3. Возобновление стажировки (PAUSED → ACTIVE)
```json
{
  "status": "ACTIVE"
}
```

#### 4. Завершение стажировки (ACTIVE → COMPLETED)
```json
{
  "status": "COMPLETED"
}
```

#### 5. Отмена стажировки (ACTIVE/PAUSED → CANCELLED)
```json
{
  "status": "CANCELLED"
}
```

### Ответ

**Успешный ответ (200 OK):**
```json
{
  "id": "clx1234567890",
  "title": "Frontend стажировка",
  "description": "Описание стажировки",
  "status": "ACTIVE",
  "location": "Москва",
  "isRemote": false,
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-05-01T00:00:00.000Z",
  "duration": 90,
  "maxParticipants": 5,
  "currentParticipants": 2,
  "views": 45,
  "applicationsCount": 12,
  "moderationStatus": "APPROVED",
  "skills": ["JavaScript", "React", "TypeScript"],
  "tags": ["frontend", "стажировка"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z",
  "_count": {
    "applications": 12,
    "participants": 2
  }
}
```

### Ошибки

#### 400 Bad Request
```json
{
  "error": "Invalid status transition",
  "message": "Cannot change status from COMPLETED to ACTIVE"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You can only modify your own internships"
}
```

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Internship not found"
}
```

### Жизненный цикл статусов

```
DRAFT ──[publish]──→ ACTIVE ──[pause]──→ PAUSED
  │                    │         │
  │                    │         └─[resume]─→ ACTIVE
  │                    │
  │                    ├─[complete]─→ COMPLETED
  │                    │
  │                    └─[cancel]──→ CANCELLED
  │
  └─[cancel]──→ CANCELLED
```

### Ограничения переходов

- **DRAFT** → `ACTIVE`, `CANCELLED`
- **ACTIVE** → `PAUSED`, `COMPLETED`, `CANCELLED`
- **PAUSED** → `ACTIVE`, `CANCELLED`
- **COMPLETED** → ❌ (финальный статус)
- **CANCELLED** → ❌ (финальный статус)

### Использование в коде

```typescript
import { useUpdateInternshipStatusMutation } from '@/lib/api/internshipsApi';

const [updateStatus] = useUpdateInternshipStatusMutation();

// ✅ Правильный способ - единый эндпоинт для всех изменений статуса
const handleStatusChange = async (internshipId: string, newStatus: string) => {
  try {
    await updateStatus({ 
      id: internshipId, 
      status: newStatus as InternshipStatus 
    }).unwrap();
    console.log('Status updated successfully');
  } catch (error) {
    console.error('Failed to update status:', error);
  }
};

// Примеры использования:
// Публикация: handleStatusChange('cmgx3y4gt0005uku074b4mmc6', 'ACTIVE')
// Приостановка: handleStatusChange('cmgx3y4gt0005uku074b4mmc6', 'PAUSED')
// Завершение: handleStatusChange('cmgx3y4gt0005uku074b4mmc6', 'COMPLETED')
```

### ❌ Неправильные подходы

```typescript
// ❌ НЕ ИСПОЛЬЗУЙТЕ - такого эндпоинта не существует
fetch('/internships/{id}/publish', { method: 'POST' })

// ❌ НЕ ИСПОЛЬЗУЙТЕ - такого эндпоинта не существует  
fetch('/internships/{id}/status', { method: 'PATCH' })
```
