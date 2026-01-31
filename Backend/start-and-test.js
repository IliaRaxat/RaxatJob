const { spawn } = require('child_process');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function waitForServer() {
  console.log('⏳ Ждем запуска сервера...');
  
  for (let i = 0; i < 30; i++) {
    try {
      await axios.get(`${BASE_URL}/ai-test/health`);
      console.log('✅ Сервер запущен!');
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('❌ Сервер не запустился за 30 секунд');
  return false;
}

async function testAiAgent() {
  console.log('\n🤖 Тестируем AI агент...');
  
  try {
    // Тест здоровья
    const health = await axios.get(`${BASE_URL}/ai-test/health`);
    console.log('✅ AI сервис работает');
    console.log('📊 Модели:', health.data.models);
    
    // Тест чата
    const chat = await axios.post(`${BASE_URL}/ai-test/chat`, {
      message: 'Привет! Как дела?'
    });
    console.log('✅ Чат работает');
    console.log('🤖 Ответ:', chat.data.data.response);
    
    // Тест анализа резюме
    const resume = await axios.post(`${BASE_URL}/ai-test/analyze-resume`, {
      resumeText: 'Иван Петров\nEmail: ivan@email.com\nНавыки: JavaScript, React'
    });
    console.log('✅ Анализ резюме работает');
    console.log('📊 Результат:', JSON.stringify(resume.data.data, null, 2));
    
    console.log('\n🎉 AI агент полностью работает!');
    return true;
  } catch (error) {
    console.log('❌ Ошибка тестирования:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Запускаем приложение и тестируем AI агент...\n');
  
  // Запускаем приложение
  console.log('📱 Запускаем NestJS приложение...');
  const app = spawn('npm', ['run', 'start:dev'], {
    stdio: 'pipe',
    shell: true
  });
  
  app.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Application is running on')) {
      console.log('✅ Приложение запущено');
    }
  });
  
  app.stderr.on('data', (data) => {
    console.log('⚠️  Ошибка:', data.toString());
  });
  
  // Ждем запуска
  const serverReady = await waitForServer();
  if (!serverReady) {
    app.kill();
    return;
  }
  
  // Тестируем AI агент
  const testPassed = await testAiAgent();
  
  if (testPassed) {
    console.log('\n🎯 AI агент готов к использованию!');
    console.log('\n📝 Доступные эндпоинты:');
    console.log('GET  /ai-test/health - Проверка здоровья');
    console.log('POST /ai-test/chat - Чат с AI');
    console.log('POST /ai-test/analyze-resume - Анализ резюме');
    console.log('GET  /ai-test/models - Список моделей');
  }
  
  // Оставляем приложение запущенным
  console.log('\n🔄 Приложение продолжает работать...');
  console.log('💡 Нажмите Ctrl+C для остановки');
}

main().catch(console.error);
