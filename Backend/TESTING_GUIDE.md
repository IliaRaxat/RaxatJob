# Руководство по тестированию исправления

## Проблема
При создании вакансии возникала ошибка: `Foreign key constraint violated on the constraint: jobs_hrId_fkey`

## Исправление
1. **Проблема**: `Job.hrId` ссылается на `HRProfile.id`, но передавался `User.id`
2. **Решение**: Добавлено автоматическое создание HR профиля при создании вакансии

## Как протестировать

### 1. Авторизация
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "chugaev.2006@gmail.com",
    "password": "your_password"
  }'
```

### 2. Создание вакансии
```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=your_token" \
  -d '{
    "title": "Frontend Developer",
    "description": "Разработка пользовательских интерфейсов",
    "requirements": "Знание React, TypeScript",
    "responsibilities": "Разработка компонентов",
    "benefits": "Удаленная работа",
    "salaryMin": 80000,
    "salaryMax": 120000,
    "location": "Москва",
    "type": "FULL_TIME",
    "experienceLevel": "JUNIOR",
    "remote": true
  }'
```

### 3. Веб-интерфейс
Откройте `test-job-creation.html` в браузере для удобного тестирования.

## Ожидаемый результат
- ✅ Вакансия создается успешно
- ✅ Автоматически создается HR профиль (если не существует)
- ✅ Нет ошибок внешнего ключа

## Что изменилось в коде

### JobsService.create()
- Добавлена проверка существования HR профиля
- Автоматическое создание базового HR профиля
- Использование `HRProfile.id` вместо `User.id`

### Безопасность
- Проверка роли пользователя (только HR)
- Валидация данных профиля
