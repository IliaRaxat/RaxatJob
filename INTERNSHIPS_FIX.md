# Исправление загрузки стажировок

## Проблема
Стажировки не загружались на странице `/companies`, отображалась ошибка "Не удалось загрузить стажировки. Используются демо-данные."

## Причины
1. **Backend**: Эндпоинт `/internships` требовал обязательную аутентификацию (`@UseGuards(JwtAuthGuard)`), что блокировало доступ для неавторизованных пользователей
2. **Frontend**: В `internshipsApi.ts` использовался кастомный `fetchFn` с `handleAuthError`, который мог вызывать редиректы при ошибках

## Исправления

### Backend (`Backend/src/modules/internships/internships.controller.ts`)
- Изменен guard с `JwtAuthGuard` на `OptionalJwtAuthGuard` для эндпоинтов:
  - `GET /internships` - получение всех стажировок
  - `GET /internships/:id` - получение стажировки по ID
- Это позволяет получать стажировки без аутентификации, но при наличии токена добавляет информацию о статусе откликов пользователя

### Frontend (`Frontend/src/entities/internship/api/internshipsApi.ts`)
- Удален кастомный `fetchFn` с обработкой ошибок через `handleAuthError`
- Используется стандартный `fetchBaseQuery` из RTK Query
- Удалены неиспользуемые импорты `handleAuthError` и `determineErrorContext`

## Результат
✅ Стажировки теперь загружаются корректно на странице `/companies`
✅ API возвращает список стажировок без требования аутентификации
✅ При наличии токена пользователь видит статус своих откликов на стажировки

## Тестирование
Запустите тестовый скрипт для проверки API:
```bash
cd Backend
node test-internships-api.js
```

Ожидаемый результат:
```
✅ Успешно получены стажировки:
Всего стажировок: 3
Количество на странице: 3
```

## Запуск приложения
1. Backend: `cd Backend && npm run start:dev`
2. Frontend: `cd Frontend && npm run dev`
3. Откройте браузер: `http://localhost:3000/companies`
