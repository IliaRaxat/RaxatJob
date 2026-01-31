// Простой тест AI агента
const axios = require('axios');

async function testOllamaDirect() {
  console.log('🔍 Тестируем прямое подключение к Ollama...');
  
  try {
    const response = await axios.get('http://109.73.193.10:11434/api/tags');
    console.log('✅ Ollama доступен');
    console.log('📋 Модели:', response.data.models?.map(m => m.name) || []);
    return true;
  } catch (error) {
    console.log('❌ Ollama недоступен:', error.message);
    return false;
  }
}

async function testOllamaGenerate() {
  console.log('\n🤖 Тестируем генерацию текста...');
  
  try {
    const response = await axios.post('http://109.73.193.10:11434/api/generate', {
      model: 'llama2',
      prompt: 'Привет! Как дела?',
      stream: false
    });
    
    console.log('✅ Генерация работает');
    console.log('🤖 Ответ:', response.data.response);
    return true;
  } catch (error) {
    console.log('❌ Ошибка генерации:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Запускаем тест AI агента...\n');
  
  const ollamaOk = await testOllamaDirect();
  if (ollamaOk) {
    await testOllamaGenerate();
  }
  
  console.log('\n🎉 Тест завершен!');
}

runTest().catch(console.error);
