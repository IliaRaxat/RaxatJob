# Устранение проблем с загрузкой файлов

## Проблема: "No file provided"

### Причины:
1. **Неправильный Content-Type** - должен быть `multipart/form-data`
2. **Неправильное имя поля** - должно быть `file`
3. **Middleware блокирует** multipart данные

## Решение

### 1. **Правильный запрос для загрузки аватарки:**

```bash
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg"
```

**Важно:**
- Используйте `-F` (form-data) вместо `-d` (JSON)
- Поле должно называться `file`
- Не указывайте `Content-Type` вручную - curl автоматически установит `multipart/form-data`

### 2. **JavaScript/TypeScript (Frontend):**

```javascript
// Правильный способ
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/profiles/avatar/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // НЕ указывайте Content-Type - браузер установит автоматически
  },
  body: formData
});
```

### 3. **Неправильные примеры:**

```bash
# ❌ НЕПРАВИЛЬНО - JSON вместо form-data
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"file": "avatar.jpg"}'

# ❌ НЕПРАВИЛЬНО - неправильное имя поля
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@avatar.jpg"

# ❌ НЕПРАВИЛЬНО - неправильный Content-Type
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -F "file=@avatar.jpg"
```

## Исправления в коде

### 1. **Main.ts** - улучшена обработка multipart данных:
```typescript
// Проверяем Content-Type для multipart данных
if (req.headers['content-type']?.includes('multipart/form-data')) {
  // Для multipart данных не применяем JSON parser
  req.setTimeout(300000); // 5 минут
  res.setTimeout(300000); // 5 минут
  next();
}
```

### 2. **ProfilesController** - улучшено сообщение об ошибке:
```typescript
if (!file) {
  throw new Error('No file provided. Please ensure you are sending a file with the field name "file" and Content-Type: multipart/form-data');
}
```

## Тестирование

### 1. **Проверка Content-Type:**
```bash
curl -v -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg"
```

Должно показать:
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

### 2. **Проверка размера файла:**
```bash
# Файл до 50MB должен загружаться без проблем
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@large_image.jpg"
```

## Ограничения

- **Максимальный размер:** 50MB
- **Тип файлов:** только изображения (`image/*`)
- **Количество файлов:** 1 файл за раз
- **Timeout:** 5 минут

## Отладка

Если файл все еще не загружается, проверьте:

1. **Content-Type** в запросе
2. **Имя поля** (`file`)
3. **Размер файла** (не больше 50MB)
4. **Тип файла** (только изображения)
5. **Авторизация** (валидный JWT токен)

Теперь загрузка файлов должна работать корректно! 🎉
