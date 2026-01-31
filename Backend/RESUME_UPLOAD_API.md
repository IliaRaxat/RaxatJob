# 📄 API для загрузки резюме

## 🎯 Endpoints для работы с резюме

### 1. Загрузка резюме
```http
POST /profiles/candidate/resume
Authorization: Bearer <candidate_jwt_token>
Content-Type: multipart/form-data

file: <resume_file>
```

### 2. Получение резюме
```http
GET /profiles/candidate/resume
Authorization: Bearer <candidate_jwt_token>
```

### 3. Получение URL резюме
```http
GET /profiles/candidate/resume/url
Authorization: Bearer <candidate_jwt_token>
```

### 4. Удаление резюме
```http
POST /profiles/candidate/resume/delete
Authorization: Bearer <candidate_jwt_token>
```

## 🔧 Примеры использования

### JavaScript (fetch)
```javascript
// Загрузка резюме
async function uploadResume(file, token) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/profiles/candidate/resume', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
}

// Получение URL резюме
async function getResumeUrl(token) {
  const response = await fetch('/profiles/candidate/resume/url', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

### HTML форма
```html
<!DOCTYPE html>
<html>
<head>
    <title>Загрузка резюме</title>
</head>
<body>
    <h1>Загрузите резюме в профиль</h1>
    
    <form id="resumeForm" enctype="multipart/form-data">
        <input type="file" id="resumeFile" accept=".pdf,.doc,.docx" required>
        <button type="submit">Загрузить резюме</button>
    </form>
    
    <div id="result"></div>

    <script>
        document.getElementById('resumeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const file = document.getElementById('resumeFile').files[0];
            const token = localStorage.getItem('auth_token');
            
            if (!file) {
                alert('Выберите файл резюме');
                return;
            }
            
            try {
                const result = await uploadResume(file, token);
                document.getElementById('result').innerHTML = 
                    `<p style="color: green;">✅ Резюме успешно загружено!</p>`;
            } catch (error) {
                document.getElementById('result').innerHTML = 
                    `<p style="color: red;">❌ Ошибка: ${error.message}</p>`;
            }
        });
        
        async function uploadResume(file, token) {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/profiles/candidate/resume', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            
            return response.json();
        }
    </script>
</body>
</html>
```

### cURL
```bash
# Загрузка резюме
curl -X POST http://localhost:3000/profiles/candidate/resume \
  -H "Authorization: Bearer your_jwt_token_here" \
  -F "file=@/path/to/your/resume.pdf"

# Получение URL резюме
curl -X GET http://localhost:3000/profiles/candidate/resume/url \
  -H "Authorization: Bearer your_jwt_token_here"

# Удаление резюме
curl -X POST http://localhost:3000/profiles/candidate/resume/delete \
  -H "Authorization: Bearer your_jwt_token_here"
```

## ✅ Ответы при успехе

### Загрузка резюме
```json
{
  "success": true,
  "fileName": "resumes/resume_1234567890.pdf",
  "resumeUrl": "https://storage.example.com/resumes/resume_1234567890.pdf",
  "mediaFileId": "media_file_id_123",
  "message": "Resume uploaded successfully"
}
```

### Получение URL резюме
```json
{
  "success": true,
  "resumeUrl": "https://storage.example.com/resumes/resume_1234567890.pdf",
  "fileName": "resumes/resume_1234567890.pdf",
  "originalName": "my_resume.pdf"
}
```

### Удаление резюме
```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

## ❌ Возможные ошибки

### 400 - Неверный формат файла
```json
{
  "statusCode": 400,
  "message": "Неподдерживаемый формат файла. Разрешены: PDF, DOC, DOCX"
}
```

### 400 - Файл слишком большой
```json
{
  "statusCode": 400,
  "message": "Файл слишком большой. Максимальный размер: 50MB"
}
```

### 401 - Не авторизован
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 - Не кандидат
```json
{
  "statusCode": 403,
  "message": "Only CANDIDATE users can upload resume"
}
```

### 404 - Резюме не найдено
```json
{
  "statusCode": 404,
  "message": "Resume not found"
}
```

## 📋 Поддерживаемые форматы

- **PDF** (.pdf)
- **Microsoft Word** (.doc, .docx)
- **Максимальный размер:** 50MB

## 🔄 Полный процесс для пользователя

1. **Загрузить резюме** (делается один раз):
```javascript
await uploadResume(resumeFile, token);
```

2. **Откликнуться на вакансию** (простая кнопка):
```javascript
await applyToJob(jobId, token);
```

Теперь резюме автоматически прикрепляется к каждому отклику! 🎯
