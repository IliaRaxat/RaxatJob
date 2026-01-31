const axios = require('axios');

// Конфигурация
const BASE_URL = 'http://localhost:3000';
const API_TOKEN = 'your-jwt-token-here'; // Замените на реальный токен

// Тестовые данные с различными ошибками валидации
const testCases = [
  {
    name: 'Valid Resume Data',
    data: {
      title: 'Test Resume',
      summary: 'Test summary',
      skills: [
        { name: 'JavaScript', level: 5, category: 'Programming' },
        { name: 'React', level: 4, category: 'Framework' }
      ],
      experiences: [
        {
          company: 'Test Company',
          position: 'Developer',
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          isCurrent: false,
          description: 'Test description'
        }
      ],
      educations: [
        {
          institution: 'Test University',
          degree: 'Bachelor',
          field: 'Computer Science',
          startDate: '2016-09-01',
          endDate: '2020-06-30',
          isCurrent: false
        }
      ],
      isDefault: true,
      isPublic: true
    }
  },
  {
    name: 'Missing Title',
    data: {
      summary: 'Test summary without title'
    }
  },
  {
    name: 'Invalid Skills Structure',
    data: {
      title: 'Test Resume',
      skills: [
        { name: 'JavaScript' }, // Missing level
        { level: 5 }, // Missing name
        { name: 'React', level: 10 } // Invalid level (should be 1-5)
      ]
    }
  },
  {
    name: 'Invalid Experiences Structure',
    data: {
      title: 'Test Resume',
      experiences: [
        { company: 'Test Company' }, // Missing position and startDate
        { position: 'Developer' }, // Missing company and startDate
        {
          company: 'Test Company',
          position: 'Developer',
          startDate: 'invalid-date', // Invalid date format
          isCurrent: 'yes' // Should be boolean
        }
      ]
    }
  },
  {
    name: 'Invalid Educations Structure',
    data: {
      title: 'Test Resume',
      educations: [
        { institution: 'Test University' }, // Missing degree and startDate
        { degree: 'Bachelor' }, // Missing institution and startDate
        {
          institution: 'Test University',
          degree: 'Bachelor',
          startDate: 'invalid-date', // Invalid date format
          isCurrent: 'yes' // Should be boolean
        }
      ]
    }
  },
  {
    name: 'Invalid Boolean Fields',
    data: {
      title: 'Test Resume',
      isDefault: 'yes', // Should be boolean
      isPublic: 'no' // Should be boolean
    }
  },
  {
    name: 'Empty Request Body',
    data: {}
  }
];

async function testResumeValidation() {
  console.log('🚀 Starting Resume Validation Tests...\n');

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log('─'.repeat(50));
    
    try {
      const response = await axios.post(`${BASE_URL}/resumes`, testCase.data, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ SUCCESS:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      if (error.response) {
        console.log('❌ VALIDATION ERROR:', error.response.status);
        console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('❌ NETWORK ERROR:', error.message);
      }
    }
    
    // Небольшая пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 Testing completed!');
  console.log('\n📝 Check your server logs for detailed validation information.');
}

// Функция для тестирования обновления резюме
async function testResumeUpdate() {
  console.log('\n🔄 Testing Resume Update...\n');
  
  const updateData = {
    title: 'Updated Resume Title',
    summary: 'Updated summary',
    skills: [
      { name: 'TypeScript', level: 5, category: 'Programming' }
    ]
  };
  
  try {
    const response = await axios.put(`${BASE_URL}/resumes/test-resume-id`, updateData, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ UPDATE SUCCESS:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('❌ UPDATE ERROR:', error.response.status);
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ NETWORK ERROR:', error.message);
    }
  }
}

// Запуск тестов
async function runTests() {
  console.log('🔧 Resume Validation Testing Tool');
  console.log('=====================================');
  console.log('Make sure your server is running on http://localhost:3000');
  console.log('Update the API_TOKEN variable with a valid JWT token\n');
  
  await testResumeValidation();
  await testResumeUpdate();
}

// Проверяем, что сервер запущен
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('Please start your server first');
    return false;
  }
}

// Основная функция
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main().catch(console.error);
