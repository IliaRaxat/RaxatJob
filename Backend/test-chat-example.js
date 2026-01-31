const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testChat() {
  console.log('🤖 Тестируем чат с AI агентом...\n');
  
  const testMessages = [
    'Привет! Кто ты и что умеешь?',
    'Какие навыки нужны для frontend разработчика?',
    'Помоги написать резюме для junior разработчика',
    'Что такое машинное обучение?',
    'Как подготовиться к собеседованию на позицию Python разработчика?'
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`📤 Запрос ${i + 1}: ${message}`);
    
    try {
      const response = await axios.post(`${BASE_URL}/ai-test/chat`, {
        message: message,
        model: 'gemma3:latest'
      });
      
      if (response.data.success) {
        console.log(`✅ Ответ ${i + 1}:`);
        console.log(`🤖 ${response.data.data.response}`);
        console.log(`⏱️  Время обработки: ${response.data.processingTime}ms`);
      } else {
        console.log(`❌ Ошибка: ${response.data.error}`);
      }
    } catch (error) {
      console.log(`❌ Ошибка запроса: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testCustomMessage() {
  console.log('💬 Тестируем пользовательское сообщение...\n');
  
  const customMessage = process.argv[2] || 'Привет! Как дела?';
  console.log(`📤 Ваше сообщение: ${customMessage}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/ai-test/chat`, {
      message: customMessage,
      model: 'gemma3:latest'
    });
    
    if (response.data.success) {
      console.log('✅ Ответ AI:');
      console.log(`🤖 ${response.data.data.response}`);
      console.log(`⏱️  Время обработки: ${response.data.processingTime}ms`);
    } else {
      console.log(`❌ Ошибка: ${response.data.error}`);
    }
  } catch (error) {
    console.log(`❌ Ошибка запроса: ${error.message}`);
    console.log('💡 Убедитесь, что приложение запущено: npm run start:dev');
  }
}

async function main() {
  console.log('🚀 Запускаем тест чата с AI агентом...\n');
  
  // Проверяем, есть ли пользовательское сообщение
  if (process.argv[2]) {
    await testCustomMessage();
  } else {
    await testChat();
  }
  
  console.log('\n🎉 Тест завершен!');
  console.log('\n💡 Для отправки своего сообщения:');
  console.log('node test-chat-example.js "Ваше сообщение"');
}

main().catch(console.error);
