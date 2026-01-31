const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const OLLAMA_URL = 'http://109.73.193.10:11434';

async function testOllamaDirect() {
  console.log('🔍 Проверяем Ollama напрямую...');
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`);
    console.log('✅ Ollama доступен');
    console.log('📋 Модели:', response.data.models || []);
    return response.data.models && response.data.models.length > 0;
  } catch (error) {
    console.log('❌ Ollama недоступен:', error.message);
    return false;
  }
}

async function testOllamaGenerate() {
  console.log('\n🤖 Тестируем генерацию через Ollama...');
  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'gemma3:latest',
      prompt: 'Привет! Ответь кратко.',
      stream: false
    }, {
      timeout: 30000
    });
    
    console.log('✅ Генерация работает');
    console.log('🤖 Ответ:', response.data.response);
    return true;
  } catch (error) {
    console.log('❌ Ошибка генерации:', error.message);
    return false;
  }
}

async function testAiHealth() {
  console.log('\n🔍 Проверяем AI сервис приложения...');
  try {
    const response = await axios.get(`${BASE_URL}/ai-test/health`);
    console.log('✅ AI сервис работает');
    console.log('📊 Статус:', response.data);
    return true;
  } catch (error) {
    console.log('❌ AI сервис недоступен:', error.message);
    return false;
  }
}

async function testAiChat() {
  console.log('\n💬 Тестируем чат через AI сервис...');
  try {
    const response = await axios.post(`${BASE_URL}/ai-test/chat`, {
      message: 'Привет! Как дела?'
    });
    
    console.log('✅ Чат работает');
    console.log('🤖 Ответ AI:', response.data.data.response);
    return true;
  } catch (error) {
    console.log('❌ Ошибка чата:', error.response?.data || error.message);
    return false;
  }
}

async function testResumeAnalysis() {
  console.log('\n📄 Тестируем анализ резюме...');
  
  const testResume = `
Иван Петров
Email: ivan@email.com
Телефон: +7 999 123-45-67

ОПЫТ:
2020-2023 - Senior Developer в TechCorp
- React, Node.js, PostgreSQL
- Управление командой

НАВЫКИ:
JavaScript, TypeScript, React, Node.js
`;

  try {
    const response = await axios.post(`${BASE_URL}/ai-test/analyze-resume`, {
      resumeText: testResume
    });
    
    console.log('✅ Анализ резюме работает');
    console.log('📊 Результат:', JSON.stringify(response.data.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Ошибка анализа:', error.response?.data || error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Запускаем тест AI агента...\n');
  
  // 1. Проверяем Ollama
  const ollamaOk = await testOllamaDirect();
  if (!ollamaOk) {
    console.log('\n❌ Ollama недоступен или нет моделей');
    console.log('💡 Установите модель: ollama pull llama2');
    return;
  }
  
  // 2. Тестируем генерацию
  const generateOk = await testOllamaGenerate();
  if (!generateOk) {
    console.log('\n⚠️  Генерация не работает');
  }
  
  // 3. Проверяем AI сервис
  const aiOk = await testAiHealth();
  if (!aiOk) {
    console.log('\n❌ AI сервис недоступен');
    console.log('💡 Запустите приложение: npm run start:dev');
    return;
  }
  
  // 4. Тестируем функции
  await testAiChat();
  await testResumeAnalysis();
  
  console.log('\n🎉 Тест завершен!');
}

runTest().catch(console.error);
