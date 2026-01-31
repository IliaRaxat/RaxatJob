# Быстрый старт: Логирование валидации резюме

## 🚀 Что было добавлено

1. **Подробное логирование** в ResumesService и ResumesController
2. **Middleware валидации** для проверки данных на уровне запроса
3. **Улучшенная обработка ошибок** с детальным логированием
4. **Тестовый скрипт** для проверки различных сценариев

## 🔧 Как запустить

### 1. Запустите сервер с подробным логированием

```bash
# Установите уровень логирования DEBUG
export LOG_LEVEL=debug
npm run start:dev
```

### 2. Запустите тестовый скрипт

```bash
# Установите токен в test-resume-validation.js
# Замените 'your-jwt-token-here' на реальный токен
node test-resume-validation.js
```

## 📊 Что вы увидите в логах

### При успешном создании резюме:
```
[ResumesService] Creating resume for candidate: user-123
[ResumesService] CreateResumeDto received: {...}
[ResumesService] Looking up candidate profile for userId: user-123
[ResumesService] Found candidate: candidate-456, user role: CANDIDATE
[ResumesService] Resume created successfully with ID: resume-789
```

### При ошибке валидации:
```
[ValidationLoggingMiddleware] Processing POST request to /resumes
[ValidationLoggingMiddleware] Missing required fields: title
[ValidationLoggingMiddleware] Invalid type for skills: expected array, got object
[GlobalExceptionFilter] Exception caught: Validation failed
```

## 🐛 Типичные проблемы

### 1. Отсутствует title
```json
// ❌ Неправильно
{"summary": "Resume summary"}

// ✅ Правильно
{"title": "My Resume", "summary": "Resume summary"}
```

### 2. Неправильная структура skills
```json
// ❌ Неправильно
{"skills": {"name": "JavaScript"}}

// ✅ Правильно
{"skills": [{"name": "JavaScript", "level": 5}]}
```

### 3. Неправильные boolean поля
```json
// ❌ Неправильно
{"isDefault": "yes", "isPublic": "no"}

// ✅ Правильно
{"isDefault": true, "isPublic": false}
```

## 📝 Файлы с логированием

- `src/modules/resumes/resumes.service.ts` - Логирование в сервисе
- `src/modules/resumes/resumes.controller.ts` - Логирование в контроллере
- `src/middleware/validation-logging.middleware.ts` - Middleware валидации
- `src/filters/global-exception.filter.ts` - Обработка ошибок
- `test-resume-validation.js` - Тестовый скрипт

## 🔍 Как найти проблему

1. **Запустите сервер** с уровнем логирования DEBUG
2. **Сделайте запрос** к API резюме
3. **Посмотрите логи** - они покажут:
   - Какие данные пришли
   - Где произошла ошибка
   - Какие поля неправильные
   - Какой тип данных ожидался

## 📚 Подробная документация

Смотрите `RESUME_VALIDATION_LOGGING.md` для полной документации по логированию.
