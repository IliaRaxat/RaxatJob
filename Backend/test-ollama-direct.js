const axios = require('axios');

const OLLAMA_URL = 'http://109.73.193.10:11434';

async function testDirectChat() {
  console.log('🤖 Тестируем прямой чат с Ollama...\n');
  
  const testMessages = [
    'Привет! Как дела?',
    'Расскажи о себе',
    'Что такое машинное обучение?',
    'Какие навыки нужны для Python разработчика?'
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`📤 Запрос ${i + 1}: ${message}`);
    
    try {
      const startTime = Date.now();
      
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'gemma3:latest',
        prompt: message,
        stream: false
      }, {
        timeout: 30000
      });
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Ответ ${i + 1}:`);
      console.log(`🤖 ${response.data.response}`);
      console.log(`⏱️  Время обработки: ${processingTime}ms`);
      
    } catch (error) {
      console.log(`❌ Ошибка: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testCustomMessage() {
  const customMessage = process.argv[2] || 'Привет! Как дела?';
  console.log(`📤 Ваше сообщение: ${customMessage}`);
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'gemma3:latest',
      prompt: customMessage,
      stream: false
    }, {
      timeout: 30000
    });
    
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Ответ AI:');
    console.log(`🤖 ${response.data.response}`);
    console.log(`⏱️  Время обработки: ${processingTime}ms`);
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Тестируем Ollama напрямую...\n');
  
  if (process.argv[2]) {
    await testCustomMessage();
  } else {
    await testDirectChat();
  }
  
  console.log('\n🎉 Тест завершен!');
  console.log('\n💡 Для отправки своего сообщения:');
  console.log('node test-ollama-direct.js "Ваше сообщение"');
}

main().catch(console.error);
