# Тест загрузки аватарки

## Проблема была исправлена!

### Что было исправлено:
1. **Убрали глобальный multer middleware** - он конфликтовал с FileInterceptor
2. **Вернули FileInterceptor** в контроллеры профилей и storage
3. **Упростили main.ts** - убрали сложную логику парсинга
4. **Включили стандартный bodyParser** NestJS

### Как протестировать:

#### 1. Запустите сервер:
```bash
npm run start:dev
```

#### 2. Используйте Postman или curl:

**Postman:**
- Метод: POST
- URL: `http://localhost:3000/profiles/avatar/upload`
- Headers: 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
- Body: 
  - Type: form-data
  - Key: `file` (тип: File)
  - Value: выберите изображение

**curl:**
```bash
curl -X POST \
  http://localhost:3000/profiles/avatar/upload \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'file=@/path/to/your/image.jpg'
```

#### 3. Ожидаемый ответ:
```json
{
  "success": true,
  "fileName": "generated-filename.jpg",
  "avatarUrl": "https://presigned-url...",
  "message": "Аватарка успешно загружена"
}
```

### Если все еще не работает:
1. Проверьте, что JWT токен валидный
2. Убедитесь, что файл отправляется с полем `file`
3. Проверьте Content-Type: `multipart/form-data`
4. Убедитесь, что файл - это изображение (jpg, png, gif, etc.)

### Удаление тестового файла:
```bash
rm test-avatar-upload.js
```
