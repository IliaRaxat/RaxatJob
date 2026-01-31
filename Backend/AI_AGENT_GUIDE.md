# AI Agent Guide - SmartMatch

## Обзор

AI Agent для SmartMatch - это интеллектуальный сервис, который использует Ollama для автоматизации различных задач в системе подбора персонала.

## Возможности

### 🤖 Основные функции

1. **Анализ резюме** - Автоматическое извлечение информации из резюме
2. **Генерация описаний вакансий** - Создание профессиональных описаний
3. **Анализ соответствия** - Оценка соответствия кандидата и вакансии
4. **Персональные рекомендации** - Советы для развития карьеры
5. **Анализ навыков** - Оценка и рекомендации по навыкам
6. **Генерация сопроводительных писем** - Персональные письма
7. **Чат с AI** - Интерактивное общение с агентом

## Установка и настройка

### 1. Переменные окружения

Добавьте в ваш `.env` файл:

```env
# AI Configuration
OLLAMA_BASE_URL=http://109.73.193.10:11434
```

### 2. Запуск сервера

```bash
npm run start:dev
```

### 3. Проверка работоспособности

```bash
node test-ai-agent.js
```

## API Endpoints

### Проверка здоровья

```http
GET /ai/health
```

**Ответ:**
```json
{
  "healthy": true,
  "models": ["llama2", "codellama", "mistral"]
}
```

### Анализ резюме

```http
POST /ai/analyze-resume
Content-Type: application/json
Authorization: Bearer <token>

{
  "resumeText": "Текст резюме..."
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "name": "Иван Петров",
    "email": "ivan@email.com",
    "phone": "+7 999 123-45-67",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": [...],
    "education": [...],
    "summary": "Опытный разработчик..."
  },
  "processingTime": 2500
}
```

### Генерация описания вакансии

```http
POST /ai/generate-job-description
Content-Type: application/json
Authorization: Bearer <token>

{
  "requirements": "Нужен Senior Developer с опытом React..."
}
```

### Анализ соответствия

```http
POST /ai/analyze-job-match
Content-Type: application/json
Authorization: Bearer <token>

{
  "candidateProfile": {
    "name": "Иван Петров",
    "skills": ["JavaScript", "React"],
    "experience": "5 лет"
  },
  "jobRequirements": {
    "title": "Senior Developer",
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "experience": "3+ года"
  }
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "match_score": 85,
    "strengths": ["Опыт с React", "Знание JavaScript"],
    "weaknesses": ["Нет опыта с Node.js"],
    "recommendations": ["Изучить Node.js", "Получить сертификацию"],
    "fit_level": "high"
  }
}
```

### Генерация рекомендаций

```http
POST /ai/generate-recommendations
Content-Type: application/json
Authorization: Bearer <token>

{
  "candidateProfile": {...},
  "targetJob": {...}
}
```

### Анализ навыков

```http
POST /ai/analyze-skills
Content-Type: application/json
Authorization: Bearer <token>

{
  "skills": ["JavaScript", "React"],
  "targetSkills": ["Node.js", "TypeScript", "Docker"]
}
```

### Генерация сопроводительного письма

```http
POST /ai/generate-cover-letter
Content-Type: application/json
Authorization: Bearer <token>

{
  "candidateProfile": {...},
  "jobDescription": "Описание вакансии..."
}
```

### Чат с AI

```http
POST /ai/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Привет! Расскажи о своих возможностях.",
  "model": "llama2"
}
```

### Получение списка моделей

```http
GET /ai/models
```

## Примеры использования

### 1. Анализ резюме кандидата

```javascript
const response = await fetch('/ai/analyze-resume', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    resumeText: resumeText
  })
});

const result = await response.json();
console.log('Извлеченные данные:', result.data);
```

### 2. Оценка соответствия кандидата

```javascript
const matchResult = await fetch('/ai/analyze-job-match', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    candidateProfile: candidate,
    jobRequirements: job
  })
});

const match = await matchResult.json();
console.log('Оценка соответствия:', match.data.match_score);
```

### 3. Генерация персональных рекомендаций

```javascript
const recommendations = await fetch('/ai/generate-recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    candidateProfile: candidate,
    targetJob: targetJob
  })
});

const recs = await recommendations.json();
console.log('Рекомендации:', recs.data);
```

## Интеграция с существующими модулями

### С модулем резюме

```typescript
// В resumes.service.ts
import { AiService } from '../ai/ai.service';

@Injectable()
export class ResumesService {
  constructor(
    private aiService: AiService,
    // ... другие сервисы
  ) {}

  async processResumeWithAI(resumeText: string) {
    const analysis = await this.aiService.analyzeResume(resumeText);
    
    if (analysis.success) {
      // Сохраняем извлеченные данные
      return this.saveResumeData(analysis.data);
    }
    
    throw new Error('AI analysis failed');
  }
}
```

### С модулем заявок

```typescript
// В applications.service.ts
async evaluateApplication(applicationId: string) {
  const application = await this.getApplication(applicationId);
  const job = await this.getJob(application.jobId);
  
  const match = await this.aiService.analyzeJobMatch(
    application.candidateProfile,
    job.requirements
  );
  
  if (match.success) {
    await this.updateApplicationScore(applicationId, match.data.match_score);
  }
}
```

## Настройка моделей

### Доступные модели

- **llama2** - Универсальная модель для общих задач
- **codellama** - Специализированная для программирования
- **mistral** - Быстрая и эффективная модель

### Выбор модели

```javascript
// Для анализа резюме
const response = await fetch('/ai/analyze-resume', {
  method: 'POST',
  body: JSON.stringify({
    resumeText: text,
    model: 'llama2' // или 'mistral'
  })
});
```

## Мониторинг и логирование

### Логи

AI сервис автоматически логирует:
- Время обработки запросов
- Ошибки подключения к Ollama
- Результаты анализа

### Метрики

```javascript
// Получение статистики
const health = await fetch('/ai/health');
const stats = await health.json();

console.log('Время отклика:', stats.processingTime);
console.log('Доступные модели:', stats.models);
```

## Обработка ошибок

### Типичные ошибки

1. **Ollama недоступен**
   ```json
   {
     "success": false,
     "error": "Ollama server is not available"
   }
   ```

2. **Таймаут запроса**
   ```json
   {
     "success": false,
     "error": "Request timeout"
   }
   ```

3. **Ошибка парсинга JSON**
   ```json
   {
     "success": false,
     "error": "Failed to parse analysis result"
   }
   ```

### Обработка в коде

```javascript
try {
  const result = await aiService.analyzeResume(text);
  
  if (!result.success) {
    console.error('AI анализ не удался:', result.error);
    // Fallback к ручному анализу
    return await manualAnalysis(text);
  }
  
  return result.data;
} catch (error) {
  console.error('Критическая ошибка AI:', error);
  throw new Error('AI service unavailable');
}
```

## Производительность

### Оптимизация

1. **Кэширование результатов**
2. **Батчинг запросов**
3. **Асинхронная обработка**

### Рекомендации

- Используйте таймауты для долгих запросов
- Кэшируйте часто используемые результаты
- Мониторьте использование ресурсов Ollama

## Безопасность

### Аутентификация

Все эндпоинты требуют JWT токен:

```javascript
headers: {
  'Authorization': 'Bearer ' + token
}
```

### Валидация данных

Все входные данные валидируются через DTO:

```typescript
export class ResumeAnalysisDto {
  @IsString()
  resumeText: string;
}
```

## Развертывание

### Docker

```dockerfile
# В Dockerfile
ENV OLLAMA_BASE_URL=http://ollama:11434
```

### Production

```env
OLLAMA_BASE_URL=https://your-ollama-server.com
```

## Поддержка

При возникновении проблем:

1. Проверьте доступность Ollama сервера
2. Убедитесь в правильности переменных окружения
3. Проверьте логи приложения
4. Запустите тестовый скрипт `test-ai-agent.js`
