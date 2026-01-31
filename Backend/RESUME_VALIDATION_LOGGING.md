# Resume Validation Logging Guide

## Обзор

Добавлено подробное логирование для отладки проблем с валидацией при сохранении и обновлении резюме. Логирование поможет выявить конкретные проблемы с данными и исправить их.

## Что было добавлено

### 1. Логирование в ResumesService

- **Создание резюме**: Логируется каждый шаг процесса создания
- **Обновление резюме**: Детальное логирование процесса обновления
- **Валидация данных**: Проверка структуры входящих данных
- **Ошибки базы данных**: Подробное логирование ошибок Prisma

### 2. Логирование в ResumesController

- **Входящие запросы**: Логирование всех POST/PUT запросов к резюме
- **Валидация DTO**: Проверка корректности данных перед передачей в сервис
- **Ошибки HTTP**: Детальное логирование HTTP ошибок

### 3. Middleware для валидации

- **ValidationLoggingMiddleware**: Проверяет структуру данных на уровне middleware
- **Типы данных**: Валидация типов полей (string, array, boolean)
- **Обязательные поля**: Проверка наличия обязательных полей
- **Структура массивов**: Валидация структуры skills, experiences, educations

### 4. Улучшенный GlobalExceptionFilter

- **Детальное логирование**: Полная информация об ошибках
- **Контекст запроса**: URL, метод, тело запроса, параметры
- **Стек ошибок**: Полный стек вызовов для отладки

## Уровни логирования

### DEBUG уровень
- Детальная информация о валидации
- Структура входящих данных
- Промежуточные результаты

### INFO уровень
- Основные операции (создание, обновление)
- Успешные операции

### ERROR уровень
- Ошибки валидации
- Ошибки базы данных
- Критические ошибки

## Как использовать

### 1. Запуск с подробным логированием

```bash
# Установите уровень логирования DEBUG
export LOG_LEVEL=debug
npm run start:dev
```

### 2. Просмотр логов

```bash
# Фильтрация логов по резюме
npm run start:dev | grep -i resume

# Фильтрация логов по валидации
npm run start:dev | grep -i validation
```

### 3. Тестирование валидации

```bash
# Запустите тестовый скрипт
node test-resume-validation.js
```

## Примеры логов

### Успешное создание резюме

```
[ResumesService] Creating resume for candidate: user-123
[ResumesService] CreateResumeDto received: {"title":"Test Resume","skills":[...]}
[ResumesService] Looking up candidate profile for userId: user-123
[ResumesService] Found candidate: candidate-456, user role: CANDIDATE
[ResumesService] Checking existing resumes for candidate: candidate-456
[ResumesService] Found 0 existing resumes
[ResumesService] Resume will be default: true
[ResumesService] Resume data prepared: {...}
[ResumesService] Creating resume in database
[ResumesService] Resume created successfully with ID: resume-789
```

### Ошибка валидации

```
[ValidationLoggingMiddleware] Processing POST request to /resumes
[ValidationLoggingMiddleware] Request body: {"title":"","skills":[...]}
[ValidationLoggingMiddleware] Missing required fields for resume creation: title
[ValidationLoggingMiddleware] Invalid type for skills: expected array, got object
[GlobalExceptionFilter] Exception caught: Validation failed
[GlobalExceptionFilter] Request details: {"url":"/resumes","method":"POST","body":{...}}
```

## Типичные проблемы и решения

### 1. Отсутствует title

**Проблема**: `Missing required fields for resume creation: title`

**Решение**: Убедитесь, что поле `title` присутствует и не пустое

```json
{
  "title": "My Resume",
  "summary": "Resume summary"
}
```

### 2. Неправильная структура skills

**Проблема**: `Invalid type for skills: expected array, got object`

**Решение**: Передавайте skills как массив объектов

```json
{
  "skills": [
    {"name": "JavaScript", "level": 5, "category": "Programming"},
    {"name": "React", "level": 4, "category": "Framework"}
  ]
}
```

### 3. Неправильные типы boolean полей

**Проблема**: `Invalid type for isDefault: expected boolean, got string`

**Решение**: Используйте true/false вместо "yes"/"no"

```json
{
  "isDefault": true,
  "isPublic": false
}
```

### 4. Неправильная структура experiences

**Проблема**: `Experience at index 0 is missing company field`

**Решение**: Убедитесь, что все обязательные поля присутствуют

```json
{
  "experiences": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "2020-01-01",
      "endDate": "2023-12-31",
      "isCurrent": false
    }
  ]
}
```

## Мониторинг в продакшене

### 1. Настройка логирования

```typescript
// В main.ts
app.useLogger(new Logger('Application'));

// Настройка уровней логирования
const logger = new Logger();
logger.setLogLevels(['error', 'warn', 'log', 'debug', 'verbose']);
```

### 2. Фильтрация логов

```bash
# Только ошибки валидации
grep "Validation failed" logs/app.log

# Только ошибки резюме
grep "ResumesService\|ResumesController" logs/app.log

# Ошибки конкретного пользователя
grep "user-123" logs/app.log
```

### 3. Алерты

Настройте мониторинг для отслеживания:
- Частых ошибок валидации
- Ошибок базы данных
- Неожиданных типов данных

## Дополнительные инструменты

### 1. Тестовый скрипт

Используйте `test-resume-validation.js` для тестирования различных сценариев валидации.

### 2. Валидация в реальном времени

Middleware автоматически проверяет данные и логирует проблемы.

### 3. Отладка в IDE

Используйте breakpoints в методах сервиса для пошаговой отладки.

## Заключение

Добавленное логирование поможет:

1. **Быстро выявлять** проблемы с валидацией
2. **Понимать** структуру входящих данных
3. **Отлаживать** сложные сценарии
4. **Мониторить** качество данных в продакшене

Все логи структурированы и легко читаемы, что упрощает отладку и поддержку системы.
