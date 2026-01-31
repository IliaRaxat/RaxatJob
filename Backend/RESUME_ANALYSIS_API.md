# API для анализа резюме и получения предложений по улучшению

## Описание

Этот API endpoint позволяет пользователям отправлять текст своего резюме и получать детальный анализ с конкретными предложениями по улучшению от нейросети.

## Endpoints

### 1. Анализ резюме (с авторизацией)
```
POST /ai/analyze-resume
```

### 2. Анализ резюме (без авторизации)
```
POST /ai-public/analyze-resume
```

## Запрос

### Тело запроса (JSON)
```json
{
  "resumeText": "Текст резюме для анализа",
  "model": "gemma3:latest" // опционально, по умолчанию gemma3:latest
}
```

### Параметры
- `resumeText` (обязательный) - текст резюме для анализа
- `model` (опциональный) - модель нейросети для использования

## Ответ

### Успешный ответ (200)
```json
{
  "success": true,
  "data": {
    "overall_score": 7,
    "strengths": [
      "Хорошо структурированное резюме",
      "Указан релевантный опыт работы",
      "Присутствуют конкретные достижения"
    ],
    "weaknesses": [
      "Отсутствуют ключевые слова для ATS",
      "Нет количественных показателей достижений",
      "Слабо описаны технические навыки"
    ],
    "improvements": [
      "Добавьте ключевые слова из описания вакансии",
      "Укажите конкретные цифры достижений (например, 'увеличил продажи на 25%')",
      "Добавьте раздел с сертификатами и курсами"
    ],
    "structure_recommendations": [
      "Добавьте краткое резюме в начало",
      "Используйте единообразное форматирование дат",
      "Добавьте раздел с языками"
    ],
    "content_recommendations": [
      "Опишите конкретные проекты и их результаты",
      "Добавьте soft skills",
      "Укажите готовность к переезду/командировкам"
    ],
    "keywords_to_add": [
      "JavaScript",
      "React",
      "TypeScript",
      "Agile",
      "Scrum",
      "Git"
    ]
  },
  "processingTime": 2500
}
```

### Поля ответа
- `overall_score` - общая оценка резюме от 1 до 10
- `strengths` - сильные стороны резюме
- `weaknesses` - слабые стороны резюме
- `improvements` - конкретные предложения по улучшению
- `structure_recommendations` - рекомендации по структуре
- `content_recommendations` - советы по содержанию
- `keywords_to_add` - ключевые слова для добавления

## Примеры использования

### JavaScript (fetch)
```javascript
const response = await fetch('http://localhost:3000/ai-public/analyze-resume', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resumeText: `Иван Петров
Frontend Developer
Email: ivan.petrov@email.com

ОПЫТ РАБОТЫ:
- Frontend Developer в ООО "ТехКомпания" (2022-2024)
  Разработка веб-приложений на React, TypeScript
  Работа с REST API, Redux

НАВЫКИ:
- JavaScript, TypeScript
- React, Redux
- HTML, CSS`,
    model: 'gemma3:latest'
  })
});

const result = await response.json();
console.log(result);
```

### cURL
```bash
curl -X POST http://localhost:3000/ai-public/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Ваш текст резюме здесь",
    "model": "gemma3:latest"
  }'
```

### Python (requests)
```python
import requests

url = "http://localhost:3000/ai-public/analyze-resume"
data = {
    "resumeText": "Ваш текст резюме здесь",
    "model": "gemma3:latest"
}

response = requests.post(url, json=data)
result = response.json()
print(result)
```

## Тестирование

Для тестирования endpoint используйте файл `test-resume-analysis.js`:

```bash
node test-resume-analysis.js
```

## Обработка ошибок

### Ошибка 500 - Внутренняя ошибка сервера
```json
{
  "success": false,
  "error": "Failed to analyze resume",
  "processingTime": 1000
}
```

### Ошибка 400 - Неверные данные
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Особенности

1. **Без авторизации**: Публичный endpoint `/ai-public/analyze-resume` не требует токена авторизации
2. **С авторизацией**: Endpoint `/ai/analyze-resume` требует JWT токен в заголовке Authorization
3. **Модели**: Поддерживаются различные модели Ollama (gemma3:latest, llama2, и др.)
4. **Время обработки**: Указывается время обработки запроса в миллисекундах
5. **Детальный анализ**: AI предоставляет конкретные и практичные рекомендации

## Интеграция с фронтендом

Этот API идеально подходит для интеграции с веб-формами, где пользователи могут:
- Вставить текст резюме в текстовое поле
- Получить мгновенный анализ и рекомендации
- Улучшить свое резюме на основе предложений AI
- Сохранить улучшенную версию резюме
