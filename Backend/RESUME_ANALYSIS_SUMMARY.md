# Анализ резюме с советами по улучшению - Краткая сводка

## 🎯 Что делает
AI анализирует резюме пользователя и дает детальные советы по улучшению для повышения шансов быть замеченным HR.

## 📤 Что отправлять

### POST `/ai/analyze-resume-improvement`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "resumeText": "Текст резюме",           // ОБЯЗАТЕЛЬНО
  "targetPosition": "Frontend Developer",  // ОПЦИОНАЛЬНО
  "yearsOfExperience": 3                  // ОПЦИОНАЛЬНО
}
```

## 📥 Что получать

**Успешный ответ (200):**
```json
{
  "success": true,
  "data": {
    "overallScore": 7,                    // Оценка 1-10
    "strengths": ["..."],                 // Сильные стороны
    "weaknesses": ["..."],                // Слабые стороны  
    "improvementTips": ["..."],           // Советы по улучшению
    "keywordSuggestions": ["..."],        // Ключевые слова для ATS
    "structureTips": ["..."],             // Советы по структуре
    "experienceTips": ["..."],           // Советы по опыту
    "skillsTips": ["..."],               // Советы по навыкам
    "readinessLevel": "medium",           // low/medium/high
    "priorityActions": ["..."]           // Приоритетные действия
  },
  "processingTime": 2500
}
```

## 🚀 Быстрый тест

**Без авторизации (тестовый эндпоинт):**
```bash
curl -X POST http://localhost:3000/ai-test/analyze-resume-improvement \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Ваше резюме здесь..."
  }'
```

**С авторизацией:**
```bash
curl -X POST http://localhost:3000/ai/analyze-resume-improvement \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Ваше резюме здесь..."
  }'
```

## 📋 Пример использования в JavaScript

```javascript
const response = await fetch('/ai/analyze-resume-improvement', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resumeText: "Иван Петров\nFrontend Developer\n...",
    targetPosition: "Senior Frontend Developer",
    yearsOfExperience: 3
  })
});

const result = await response.json();
console.log('Оценка:', result.data.overallScore);
console.log('Советы:', result.data.improvementTips);
```

## ✨ Ключевые возможности

- **Оценка резюме** от 1 до 10
- **Детальные советы** по улучшению
- **Ключевые слова** для ATS-систем
- **Структурные рекомендации**
- **Приоритетные действия**
- **Анализ под целевую позицию**

## 🔧 Тестирование

**Быстрый тест:**
```bash
node test-resume.js
```

## 📚 Полная документация

См. файл `RESUME_IMPROVEMENT_API.md` для детального описания.
