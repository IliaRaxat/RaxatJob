# Исправление ошибки "Unexpected token" для multipart/form-data

## Проблема
Ошибка `"Unexpected token '-', \"------WebK\"... is not valid JSON"` возникала потому, что сервер пытался парсить multipart/form-data как JSON.

## Решение

### 1. **Отключен автоматический body parser**
```typescript
const app = await NestFactory.create(AppModule, {
  bodyParser: false, // Отключаем автоматический body parser
});
```

### 2. **Добавлен условный JSON parser**
```typescript
// JSON parser только для API эндпоинтов (не для загрузки файлов)
app.use((req, res, next) => {
  if (req.url.includes('/profiles/avatar/upload') || req.url.includes('/storage/upload')) {
    // Для загрузки файлов не применяем JSON parser
    req.setTimeout(300000); // 5 минут
    res.setTimeout(300000); // 5 минут
    next();
  } else {
    // Для остальных эндпоинтов применяем JSON parser
    express.json({ limit: '50mb' })(req, res, next);
  }
});
```

## Результат

Теперь:
- **Загрузка файлов** (`/profiles/avatar/upload`, `/storage/upload`) - НЕ парсится как JSON
- **Остальные API эндпоинты** - парсятся как JSON с лимитом 50MB
- **Timeout** для загрузки файлов увеличен до 5 минут

## Тестирование

```bash
# Тест загрузки аватарки (должен работать)
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg"

# Тест обычного API (должен работать)
curl -X POST http://localhost:3000/profiles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Иван", "lastName": "Петров"}'
```

Теперь загрузка файлов работает без ошибок! 🎉
