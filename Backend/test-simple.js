const axios = require('axios');

async function test() {
  try {
    console.log('🧪 Тестирование...');
    
    const response = await axios.post('http://localhost:3000/ai-test/analyze-resume-improvement', {
      resumeText: "Тест резюме"
    });
    
    console.log('✅ Успех!', response.data);
  } catch (error) {
    console.error('❌ Ошибка:', error.response?.data || error.message);
  }
}

test();
