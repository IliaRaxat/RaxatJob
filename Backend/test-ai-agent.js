const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const OLLAMA_URL = 'http://109.73.193.10:11434';

// Тестовые данные
const testResume = `
Иван Петров
Email: ivan.petrov@email.com
Телефон: +7 (999) 123-45-67

ОПЫТ РАБОТЫ:
2020-2023 - Senior Developer в TechCorp
- Разработка веб-приложений на React и Node.js
- Управление командой из 5 разработчиков
- Интеграция с внешними API

2018-2020 - Middle Developer в StartupXYZ
- Разработка мобильных приложений
- Работа с базами данных PostgreSQL
- Участие в архитектурных решениях

ОБРАЗОВАНИЕ:
2014-2018 - МГУ, Факультет ВМК, Специальность "Прикладная математика и информатика"

НАВЫКИ:
JavaScript, TypeScript, React, Node.js, PostgreSQL, Git, Docker, AWS
`;

const testJobRequirements = {
  title: "Senior Full-Stack Developer",
  company: "InnovationTech",
  requirements: [
    "5+ лет опыта разработки",
    "Знание JavaScript, TypeScript, React, Node.js",
    "Опыт работы с базами данных",
    "Опыт управления командой",
    "Знание Docker и облачных технологий"
  ],
  responsibilities: [
    "Разработка веб-приложений",
    "Управление командой разработчиков",
    "Архитектурные решения",
    "Интеграция с внешними сервисами"
  ]
};

async function testOllamaConnection() {
  console.log('🔍 Проверяем подключение к Ollama...');
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`);
    console.log('✅ Ollama доступен');
    console.log('📋 Доступные модели:', response.data.models?.map(m => m.name) || []);
    return true;
  } catch (error) {
    console.log('❌ Ollama недоступен:', error.message);
    return false;
  }
}

async function testAiHealth() {
  console.log('\n🔍 Проверяем AI сервис...');
  try {
    const response = await axios.get(`${BASE_URL}/ai/health`);
    console.log('✅ AI сервис работает');
    console.log('📊 Статус:', response.data);
    return true;
  } catch (error) {
    console.log('❌ AI сервис недоступен:', error.message);
    return false;
  }
}

async function testResumeAnalysis() {
  console.log('\n📄 Тестируем анализ резюме...');
  try {
    const response = await axios.post(`${BASE_URL}/ai/analyze-resume`, {
      resumeText: testResume
    });
    
    if (response.data.success) {
      console.log('✅ Анализ резюме успешен');
      console.log('📊 Результат:', JSON.stringify(response.data.data, null, 2));
    } else {
      console.log('❌ Ошибка анализа:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.response?.data || error.message);
  }
}

async function testJobDescriptionGeneration() {
  console.log('\n💼 Тестируем генерацию описания вакансии...');
  try {
    const response = await axios.post(`${BASE_URL}/ai/generate-job-description`, {
      requirements: "Нужен Senior Full-Stack Developer с опытом React, Node.js, PostgreSQL. Опыт управления командой обязателен."
    });
    
    if (response.data.success) {
      console.log('✅ Генерация описания успешна');
      console.log('📝 Описание:', response.data.data.description);
    } else {
      console.log('❌ Ошибка генерации:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.response?.data || error.message);
  }
}

async function testJobMatch() {
  console.log('\n🎯 Тестируем анализ соответствия...');
  try {
    const candidateProfile = {
      name: "Иван Петров",
      skills: ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"],
      experience: "5+ лет",
      leadership: true
    };
    
    const response = await axios.post(`${BASE_URL}/ai/analyze-job-match`, {
      candidateProfile,
      jobRequirements: testJobRequirements
    });
    
    if (response.data.success) {
      console.log('✅ Анализ соответствия успешен');
      console.log('📊 Результат:', JSON.stringify(response.data.data, null, 2));
    } else {
      console.log('❌ Ошибка анализа:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.response?.data || error.message);
  }
}

async function testChat() {
  console.log('\n💬 Тестируем чат с AI...');
  try {
    const response = await axios.post(`${BASE_URL}/ai/chat`, {
      message: "Привет! Расскажи о себе и своих возможностях."
    });
    
    if (response.data.success) {
      console.log('✅ Чат работает');
      console.log('🤖 Ответ AI:', response.data.data.response);
    } else {
      console.log('❌ Ошибка чата:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Запускаем тесты AI агента...\n');
  
  // Проверяем подключение к Ollama
  const ollamaAvailable = await testOllamaConnection();
  if (!ollamaAvailable) {
    console.log('\n❌ Ollama недоступен. Убедитесь, что сервер запущен на http://109.73.193.10:11434');
    return;
  }
  
  // Проверяем AI сервис
  const aiAvailable = await testAiHealth();
  if (!aiAvailable) {
    console.log('\n❌ AI сервис недоступен. Убедитесь, что приложение запущено на http://localhost:3000');
    return;
  }
  
  // Запускаем тесты
  await testResumeAnalysis();
  await testJobDescriptionGeneration();
  await testJobMatch();
  await testChat();
  
  console.log('\n🎉 Все тесты завершены!');
}

// Запускаем тесты
runAllTests().catch(console.error);
