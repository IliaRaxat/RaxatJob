const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const OLLAMA_URL = 'http://109.73.193.10:11434';

async function checkOllamaStatus() {
  console.log('🔍 Проверяем статус Ollama...');
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`);
    console.log('✅ Ollama сервер доступен');
    console.log('📋 Установленные модели:', response.data.models || []);
    
    if (response.data.models && response.data.models.length === 0) {
      console.log('⚠️  Модели не установлены. Попробуем установить llama2...');
      return await installModel();
    }
    
    return true;
  } catch (error) {
    console.log('❌ Ollama недоступен:', error.message);
    return false;
  }
}

async function installModel() {
  console.log('📥 Устанавливаем модель llama2...');
  try {
    // Попробуем установить небольшую модель
    const response = await axios.post(`${OLLAMA_URL}/api/pull`, {
      name: 'llama2:7b'
    }, {
      timeout: 300000 // 5 минут на загрузку
    });
    
    console.log('✅ Модель установлена');
    return true;
  } catch (error) {
    console.log('❌ Ошибка установки модели:', error.message);
    console.log('💡 Попробуйте установить модель вручную:');
    console.log('   ollama pull llama2');
    return false;
  }
}

async function testOllamaGenerate() {
  console.log('\n🤖 Тестируем генерацию текста...');
  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama2',
      prompt: 'Привет! Как дела? Ответь кратко.',
      stream: false
    }, {
      timeout: 30000
    });
    
    console.log('✅ Генерация работает');
    console.log('🤖 Ответ AI:', response.data.response);
    return true;
  } catch (error) {
    console.log('❌ Ошибка генерации:', error.message);
    if (error.response?.status === 404) {
      console.log('💡 Возможно, модель не установлена');
    }
    return false;
  }
}

async function testAiHealth() {
  console.log('\n🔍 Проверяем AI сервис приложения...');
  try {
    const response = await axios.get(`${BASE_URL}/ai/health`);
    console.log('✅ AI сервис работает');
    console.log('📊 Статус:', response.data);
    return true;
  } catch (error) {
    console.log('❌ AI сервис недоступен:', error.message);
    console.log('💡 Убедитесь, что приложение запущено: npm run start:dev');
    return false;
  }
}

async function testResumeAnalysis() {
  console.log('\n📄 Тестируем анализ резюме...');
  
  const testResume = `
Иван Петров
Email: ivan.petrov@email.com
Телефон: +7 (999) 123-45-67

ОПЫТ РАБОТЫ:
2020-2023 - Senior Developer в TechCorp
- Разработка веб-приложений на React и Node.js
- Управление командой из 5 разработчиков

НАВЫКИ:
JavaScript, TypeScript, React, Node.js, PostgreSQL
`;

  try {
    const response = await axios.post(`${BASE_URL}/ai/analyze-resume`, {
      resumeText: testResume
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Добавим заголовок авторизации если нужно
        // 'Authorization': 'Bearer your-token'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Анализ резюме успешен');
      console.log('📊 Результат:', JSON.stringify(response.data.data, null, 2));
    } else {
      console.log('❌ Ошибка анализа:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Возможно, нужна авторизация');
    }
  }
}

async function testChat() {
  console.log('\n💬 Тестируем чат с AI...');
  try {
    const response = await axios.post(`${BASE_URL}/ai/chat`, {
      message: 'Привет! Расскажи о себе.'
    }, {
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Чат работает');
      console.log('🤖 Ответ AI:', response.data.data.response);
    } else {
      console.log('❌ Ошибка чата:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Ошибка чата:', error.response?.data || error.message);
  }
}

async function runLiveTest() {
  console.log('🚀 Запускаем живой тест AI агента...\n');
  
  // 1. Проверяем Ollama
  const ollamaOk = await checkOllamaStatus();
  if (!ollamaOk) {
    console.log('\n❌ Ollama недоступен. Завершаем тест.');
    return;
  }
  
  // 2. Тестируем генерацию
  const generateOk = await testOllamaGenerate();
  if (!generateOk) {
    console.log('\n⚠️  Генерация не работает, но продолжаем тест...');
  }
  
  // 3. Проверяем AI сервис приложения
  const aiServiceOk = await testAiHealth();
  if (!aiServiceOk) {
    console.log('\n❌ AI сервис недоступен. Завершаем тест.');
    return;
  }
  
  // 4. Тестируем функции AI
  await testResumeAnalysis();
  await testChat();
  
  console.log('\n🎉 Живой тест завершен!');
  console.log('\n📝 Следующие шаги:');
  console.log('1. Установите модель: ollama pull llama2');
  console.log('2. Запустите приложение: npm run start:dev');
  console.log('3. Получите JWT токен для авторизации');
  console.log('4. Протестируйте все функции AI агента');
}

runLiveTest().catch(console.error);
