# Управление файлами и хранилищем

Полное руководство по работе с файлами в SmartMatch API.

## 📁 Обзор

Система файлового хранилища включает:
- Загрузку и скачивание файлов
- Управление аватарами профилей
- Загрузку резюме и документов
- Presigned URLs для безопасного доступа
- S3-совместимое хранилище через MinIO

## 🔐 Аутентификация

Большинство операций требуют аутентификации:

```
Authorization: Bearer <JWT_TOKEN>
```

### Доступ:
- **Все** - просмотр публичных файлов
- **Аутентифицированные пользователи** - загрузка и управление своими файлами
- **ADMIN** - полный доступ ко всем файлам

## 📤 Загрузка файлов

### Основная загрузка

#### Эндпоинт
```
POST /storage/upload
```

#### Параметры запроса

| Параметр | Тип | Обязательное | Описание |
|----------|-----|---------------|----------|
| `file` | multipart/form-data | ✅ | Файл для загрузки |
| `path` | string | ❌ | Путь в хранилище |
| `type` | string | ❌ | Тип файла (AVATAR, RESUME, LOGO) |

#### Ограничения файлов

| Тип файла | Размер | Форматы | Описание |
|-----------|--------|----------|----------|
| Аватары | 10MB | jpg, jpeg, png, gif, webp | Изображения профилей |
| Резюме | 50MB | pdf, doc, docx | Документы резюме |
| Логотипы | 5MB | jpg, jpeg, png, svg | Логотипы компаний/университетов |
| Общие файлы | 100MB | Любые | Другие документы |

### Примеры запросов

#### cURL
```bash
# Загрузка аватара
curl -X POST http://localhost:3000/storage/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@avatar.jpg" \
  -F "type=AVATAR"

# Загрузка резюме
curl -X POST http://localhost:3000/storage/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@resume.pdf" \
  -F "type=RESUME" \
  -F "path=resumes"

# Загрузка логотипа
curl -X POST http://localhost:3000/storage/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@logo.png" \
  -F "type=LOGO" \
  -F "path=logos"
```

#### JavaScript (fetch)
```javascript
async function uploadFile(file, type = null, path = null) {
  const formData = new FormData();
  formData.append('file', file);
  
  if (type) formData.append('type', type);
  if (path) formData.append('path', path);
  
  const response = await fetch('/storage/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];

if (file) {
  uploadFile(file, 'AVATAR', 'avatars')
    .then(result => {
      console.log('Файл загружен:', result);
      // Использовать result.fileName в профиле
    })
    .catch(error => console.error('Ошибка загрузки:', error.message));
}
```

#### TypeScript (axios)
```typescript
interface UploadResponse {
  success: boolean;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  presignedUrl: string;
}

interface UploadOptions {
  type?: 'AVATAR' | 'RESUME' | 'LOGO';
  path?: string;
}

async function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.type) formData.append('type', options.type);
  if (options.path) formData.append('path', options.path);
  
  const response = await axios.post('/storage/upload', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
}

// Использование
const file = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
uploadFile(file, { type: 'AVATAR', path: 'avatars' })
  .then(result => console.log('Файл загружен:', result))
  .catch(error => console.error('Ошибка:', error.message));
```

#### Ответ при успехе
```json
{
  "success": true,
  "fileName": "avatars/avatar_123456.jpg",
  "originalName": "avatar.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg",
  "presignedUrl": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_123456.jpg?X-Amz-Algorithm=..."
}
```

### Загрузка аватара профиля

#### Эндпоинт
```
POST /profiles/avatar/upload
```

#### Примеры запросов

##### cURL
```bash
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@avatar.jpg"
```

##### JavaScript (fetch)
```javascript
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/profiles/avatar/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const avatarInput = document.getElementById('avatar-input');
const file = avatarInput.files[0];

if (file) {
  uploadAvatar(file)
    .then(result => {
      console.log('Аватар загружен:', result);
      // Обновить профиль с новым avatarId
      return updateProfile({ avatarId: result.fileName });
    })
    .catch(error => console.error('Ошибка загрузки аватара:', error.message));
}
```

#### Ответ при успехе
```json
{
  "success": true,
  "fileName": "avatars/avatar_123456.jpg",
  "avatarUrl": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_123456.jpg?X-Amz-Algorithm=...",
  "message": "Аватарка успешно загружена"
}
```

## 📥 Скачивание файлов

### Прямое скачивание

#### Эндпоинт
```
GET /storage/download/:fileName
```

#### Примеры запросов

##### cURL
```bash
curl -X GET http://localhost:3000/storage/download/avatars/avatar_123456.jpg \
  --output avatar.jpg
```

##### JavaScript (fetch)
```javascript
async function downloadFile(fileName) {
  const response = await fetch(`/storage/download/${fileName}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.blob();
}

// Использование
downloadFile('avatars/avatar_123456.jpg')
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'avatar.jpg';
    a.click();
    URL.revokeObjectURL(url);
  })
  .catch(error => console.error('Ошибка скачивания:', error.message));
```

### Получение аватара профиля

#### Эндпоинт
```
GET /profiles/avatar
```

#### Пример
```bash
curl -X GET http://localhost:3000/profiles/avatar \
  -H "Authorization: Bearer <token>" \
  --output avatar.jpg
```

### Получение URL аватара

#### Эндпоинт
```
GET /profiles/avatar/url
```

#### Пример
```bash
curl -X GET http://localhost:3000/profiles/avatar/url \
  -H "Authorization: Bearer <token>"
```

#### Ответ при успехе
```json
{
  "success": true,
  "avatarUrl": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_123456.jpg?X-Amz-Algorithm=...",
  "fileName": "avatars/avatar_123456.jpg"
}
```

#### Ответ если аватар не найден
```json
{
  "success": false,
  "message": "Аватарка не найдена"
}
```

## 🔗 Presigned URLs

### Получение presigned URL для скачивания

#### Эндпоинт
```
GET /storage/presigned/:fileName
```

#### Параметры запроса

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `expiry` | number | Время жизни ссылки в секундах | 3600 (1 час) |

#### Примеры запросов

##### cURL
```bash
curl -X GET http://localhost:3000/storage/presigned/avatars/avatar_123456.jpg \
  -H "Content-Type: application/json" \
  -d '{"expiry": 7200}'
```

##### JavaScript (fetch)
```javascript
async function getPresignedUrl(fileName, expiry = 3600) {
  const response = await fetch(`/storage/presigned/${fileName}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ expiry })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
getPresignedUrl('avatars/avatar_123456.jpg', 7200)
  .then(result => {
    console.log('Presigned URL:', result.url);
    // Использовать URL для отображения изображения
    const img = document.createElement('img');
    img.src = result.url;
    document.body.appendChild(img);
  })
  .catch(error => console.error('Ошибка получения URL:', error.message));
```

#### Ответ при успехе
```json
{
  "success": true,
  "url": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_123456.jpg?X-Amz-Algorithm=..."
}
```

### Получение presigned URL для загрузки

#### Эндпоинт
```
GET /storage/presigned-upload/:fileName
```

#### Пример
```bash
curl -X GET http://localhost:3000/storage/presigned-upload/avatars/new-avatar.jpg \
  -H "Content-Type: application/json" \
  -d '{"expiry": 3600}'
```

## 📋 Информация о файлах

### Получение метаданных файла

#### Эндпоинт
```
GET /storage/info/:fileName
```

#### Примеры запросов

##### cURL
```bash
curl -X GET http://localhost:3000/storage/info/avatars/avatar_123456.jpg
```

##### JavaScript (fetch)
```javascript
async function getFileInfo(fileName) {
  const response = await fetch(`/storage/info/${fileName}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
getFileInfo('avatars/avatar_123456.jpg')
  .then(info => {
    console.log('Размер файла:', info.size);
    console.log('Тип файла:', info.mimeType);
    console.log('Дата изменения:', info.lastModified);
  })
  .catch(error => console.error('Ошибка получения информации:', error.message));
```

#### Ответ при успехе
```json
{
  "success": true,
  "fileName": "avatars/avatar_123456.jpg",
  "size": 1024000,
  "lastModified": "2024-01-15T10:30:00.000Z",
  "etag": "\"abc123def456\"",
  "metaData": {
    "content-type": "image/jpeg"
  }
}
```

### Список файлов

#### Эндпоинт
```
GET /storage/list
```

#### Параметры запроса

| Параметр | Тип | Описание |
|----------|-----|----------|
| `prefix` | string | Префикс для фильтрации файлов |

#### Примеры запросов

##### cURL
```bash
curl -X GET http://localhost:3000/storage/list \
  -H "Content-Type: application/json" \
  -d '{"prefix": "avatars/"}'
```

##### JavaScript (fetch)
```javascript
async function listFiles(prefix = null) {
  const response = await fetch('/storage/list', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ prefix })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
listFiles('avatars/')
  .then(result => {
    console.log('Файлы:', result.files);
    result.files.forEach(file => {
      console.log(`Файл: ${file.name}, Размер: ${file.size}`);
    });
  })
  .catch(error => console.error('Ошибка получения списка:', error.message));
```

#### Ответ при успехе
```json
{
  "success": true,
  "files": [
    {
      "name": "avatars/avatar_123456.jpg",
      "size": 1024000,
      "lastModified": "2024-01-15T10:30:00.000Z",
      "etag": "\"abc123def456\""
    },
    {
      "name": "avatars/avatar_789012.png",
      "size": 2048000,
      "lastModified": "2024-01-15T11:00:00.000Z",
      "etag": "\"def456ghi789\""
    }
  ]
}
```

## 🗑️ Удаление файлов

### Удаление файла

#### Эндпоинт
```
DELETE /storage/:fileName
```

#### Примеры запросов

##### cURL
```bash
curl -X DELETE http://localhost:3000/storage/avatars/avatar_123456.jpg \
  -H "Authorization: Bearer <token>"
```

##### JavaScript (fetch)
```javascript
async function deleteFile(fileName) {
  const response = await fetch(`/storage/${fileName}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
deleteFile('avatars/avatar_123456.jpg')
  .then(result => console.log('Файл удален:', result.message))
  .catch(error => console.error('Ошибка удаления:', error.message));
```

#### Ответ при успехе
```json
{
  "success": true,
  "message": "File avatars/avatar_123456.jpg deleted successfully"
}
```

### Удаление аватара профиля

#### Эндпоинт
```
POST /profiles/avatar/delete
```

#### Пример
```bash
curl -X POST http://localhost:3000/profiles/avatar/delete \
  -H "Authorization: Bearer <token>"
```

#### Ответ при успехе
```json
{
  "success": true,
  "message": "Аватарка успешно удалена"
}
```

## ❌ Обработка ошибок

### Возможные ошибки

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Файл слишком большой",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Неверный или отсутствующий токен",
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Файл не найден",
  "error": "Not Found"
}
```

#### 413 Payload Too Large
```json
{
  "statusCode": 413,
  "message": "Размер файла превышает максимально допустимый",
  "error": "Payload Too Large"
}
```

#### 415 Unsupported Media Type
```json
{
  "statusCode": 415,
  "message": "Неподдерживаемый тип файла",
  "error": "Unsupported Media Type"
}
```

### JavaScript обработка ошибок

```javascript
async function handleFileOperation(operation) {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          alert(`Ошибка запроса: ${data.message}`);
          break;
        case 401:
          window.location.href = '/login';
          break;
        case 404:
          alert('Файл не найден');
          break;
        case 413:
          alert('Файл слишком большой. Максимальный размер: 10MB');
          break;
        case 415:
          alert('Неподдерживаемый тип файла. Разрешены: jpg, jpeg, png, gif, webp');
          break;
        default:
          alert(`Произошла ошибка: ${data.message}`);
      }
    } else {
      alert('Ошибка сети. Проверьте подключение к интернету.');
    }
    
    throw error;
  }
}
```

## 📱 React Hook пример

```typescript
import { useState } from 'react';

interface FileUploadOptions {
  type?: 'AVATAR' | 'RESUME' | 'LOGO';
  path?: string;
}

interface UseFileUploadReturn {
  uploading: boolean;
  error: string | null;
  uploadFile: (file: File, options?: FileUploadOptions) => Promise<string>;
  deleteFile: (fileName: string) => Promise<void>;
  getPresignedUrl: (fileName: string, expiry?: number) => Promise<string>;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, options: FileUploadOptions = {}): Promise<string> => {
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      if (options.type) formData.append('type', options.type);
      if (options.path) formData.append('path', options.path);
      
      const response = await fetch('/storage/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.fileName;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileName: string): Promise<void> => {
    try {
      setError(null);
      
      const response = await fetch(`/storage/${fileName}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getPresignedUrl = async (fileName: string, expiry: number = 3600): Promise<string> => {
    try {
      setError(null);
      
      const response = await fetch(`/storage/presigned/${fileName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ expiry })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.url;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    uploading,
    error,
    uploadFile,
    deleteFile,
    getPresignedUrl
  };
}
```

## 🔒 Безопасность

### Ограничения файлов

| Тип | Максимальный размер | Разрешенные форматы | Описание |
|-----|-------------------|-------------------|----------|
| Аватары | 10MB | jpg, jpeg, png, gif, webp | Изображения профилей |
| Резюме | 50MB | pdf, doc, docx | Документы резюме |
| Логотипы | 5MB | jpg, jpeg, png, svg | Логотипы компаний |
| Общие файлы | 100MB | Любые | Другие документы |

### Presigned URLs

- Время жизни по умолчанию: 1 час
- Максимальное время жизни: 7 дней
- Автоматическая очистка истекших ссылок
- Защита от несанкционированного доступа

### Валидация файлов

```javascript
// Проверка размера файла
function validateFileSize(file, maxSize) {
  if (file.size > maxSize) {
    throw new Error(`Файл слишком большой. Максимальный размер: ${maxSize / 1024 / 1024}MB`);
  }
}

// Проверка типа файла
function validateFileType(file, allowedTypes) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Неподдерживаемый тип файла. Разрешены: ${allowedTypes.join(', ')}`);
  }
}

// Проверка изображения
function validateImage(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  validateFileType(file, allowedTypes);
  validateFileSize(file, maxSize);
}

// Проверка резюме
function validateResume(file) {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  validateFileType(file, allowedTypes);
  validateFileSize(file, maxSize);
}
```

## 📊 Мониторинг и аналитика

### Отслеживание действий с файлами

```javascript
// Логирование загрузки файла
function logFileUpload(fileName, fileSize, fileType) {
  analytics.track('file_uploaded', {
    fileName,
    fileSize,
    fileType,
    timestamp: new Date().toISOString()
  });
}

// Логирование скачивания файла
function logFileDownload(fileName) {
  analytics.track('file_downloaded', {
    fileName,
    timestamp: new Date().toISOString()
  });
}

// Логирование удаления файла
function logFileDelete(fileName) {
  analytics.track('file_deleted', {
    fileName,
    timestamp: new Date().toISOString()
  });
}
```

## ⚙️ Конфигурация MinIO

### Настройки сервера

```env
# MinIO конфигурация
MINIO_ENDPOINT=storage.vchugaev.ru
MINIO_PORT=9001
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=smartmatch
```

### Настройки клиента

```typescript
// Конфигурация MinIO клиента
const minioConfig = {
  endPoint: 'storage.vchugaev.ru',
  port: 9001,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
};

// Создание клиента
import { Client } from 'minio';
const minioClient = new Client(minioConfig);
```

## 🚀 Примеры использования

### Полный цикл работы с аватаром

```javascript
// 1. Загрузка аватара
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/profiles/avatar/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  
  const result = await response.json();
  return result.fileName;
}

// 2. Обновление профиля с новым аватаром
async function updateProfileWithAvatar(avatarFileName) {
  const response = await fetch('/profiles', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ avatarId: avatarFileName })
  });
  
  return await response.json();
}

// 3. Получение URL аватара для отображения
async function getAvatarUrl() {
  const response = await fetch('/profiles/avatar/url', {
    credentials: 'include'
  });
  
  const result = await response.json();
  return result.avatarUrl;
}

// 4. Удаление аватара
async function deleteAvatar() {
  const response = await fetch('/profiles/avatar/delete', {
    method: 'POST',
    credentials: 'include'
  });
  
  return await response.json();
}

// Полный цикл
async function handleAvatarUpload(file) {
  try {
    // Загружаем файл
    const fileName = await uploadAvatar(file);
    
    // Обновляем профиль
    await updateProfileWithAvatar(fileName);
    
    // Получаем URL для отображения
    const avatarUrl = await getAvatarUrl();
    
    // Обновляем UI
    const img = document.getElementById('avatar-img');
    img.src = avatarUrl;
    
    console.log('Аватар успешно загружен и обновлен');
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error.message);
  }
}
```