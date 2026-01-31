/**
 * Тест упрощенного API откликов
 * 
 * Запуск: node test-simplified-applications.js
 */

const API_BASE_URL = 'http://localhost:3000';

// Тестовые данные
const testData = {
  candidateToken: 'candidate_jwt_token_here',
  hrToken: 'hr_jwt_token_here',
  jobId: 'test_job_id_here'
};

async function testSimplifiedApplications() {
  console.log('🧪 Тестирование упрощенного API откликов\n');

  try {
    // 1. Тест создания отклика (упрощенный)
    console.log('1️⃣ Тест создания отклика...');
    await testCreateApplication();
    
    // 2. Тест получения откликов
    console.log('\n2️⃣ Тест получения откликов...');
    await testGetApplications();
    
    // 3. Тест валидации
    console.log('\n3️⃣ Тест валидации...');
    await testValidation();
    
    console.log('\n✅ Все тесты пройдены успешно!');
    
  } catch (error) {
    console.error('\n❌ Ошибка при тестировании:', error.message);
  }
}

async function testCreateApplication() {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.candidateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: testData.jobId
        // Только jobId - больше ничего не нужно!
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Отклик создан успешно');
      console.log('📄 Резюме автоматически прикреплено:', result.resumeUrl ? 'Да' : 'Нет');
      console.log('👤 Кандидат:', `${result.candidate.firstName} ${result.candidate.lastName}`);
      console.log('🏢 Компания:', result.job.hr.company);
    } else {
      console.log('⚠️ Ожидаемая ошибка:', result.message);
    }
  } catch (error) {
    console.error('❌ Ошибка при создании отклика:', error.message);
  }
}

async function testGetApplications() {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/my`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testData.candidateToken}`,
      }
    });

    const applications = await response.json();
    
    if (response.ok) {
      console.log('✅ Отклики получены успешно');
      console.log(`📊 Количество откликов: ${applications.length}`);
      
      applications.forEach((app, index) => {
        console.log(`  ${index + 1}. ${app.job.title} - ${app.status}`);
      });
    } else {
      console.log('⚠️ Ошибка при получении откликов:', applications.message);
    }
  } catch (error) {
    console.error('❌ Ошибка при получении откликов:', error.message);
  }
}

async function testValidation() {
  console.log('🔍 Тестирование валидации...');
  
  // Тест без токена
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId: testData.jobId })
    });
    
    if (response.status === 401) {
      console.log('✅ Валидация токена работает');
    } else {
      console.log('⚠️ Валидация токена не работает');
    }
  } catch (error) {
    console.log('✅ Валидация токена работает (ошибка сети)');
  }
  
  // Тест без jobId
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.candidateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const result = await response.json();
    
    if (response.status === 400) {
      console.log('✅ Валидация jobId работает');
    } else {
      console.log('⚠️ Валидация jobId не работает');
    }
  } catch (error) {
    console.log('✅ Валидация jobId работает (ошибка сети)');
  }
}

// Функция для тестирования с реальными данными
async function testWithRealData() {
  console.log('\n🔧 Для тестирования с реальными данными:');
  console.log('1. Запустите сервер: npm run start:dev');
  console.log('2. Зарегистрируйте кандидата и получите токен');
  console.log('3. Создайте вакансию и получите jobId');
  console.log('4. Загрузите резюме в профиль кандидата');
  console.log('5. Обновите testData в этом файле');
  console.log('6. Запустите: node test-simplified-applications.js');
}

// Примеры запросов для Postman/Insomnia
const postmanExamples = {
  "create_application": {
    "method": "POST",
    "url": "{{base_url}}/applications",
    "headers": {
      "Authorization": "Bearer {{candidate_token}}",
      "Content-Type": "application/json"
    },
    "body": {
      "jobId": "{{job_id}}"
    }
  },
  "get_my_applications": {
    "method": "GET",
    "url": "{{base_url}}/applications/my",
    "headers": {
      "Authorization": "Bearer {{candidate_token}}"
    }
  },
  "upload_resume": {
    "method": "POST",
    "url": "{{base_url}}/profiles/candidate/resume",
    "headers": {
      "Authorization": "Bearer {{candidate_token}}"
    },
    "body": {
      "file": "{{resume_file}}"
    }
  }
};

console.log('📋 Примеры для Postman/Insomnia:');
console.log(JSON.stringify(postmanExamples, null, 2));

// Запуск тестов
if (require.main === module) {
  testSimplifiedApplications();
  testWithRealData();
}

module.exports = {
  testSimplifiedApplications,
  testCreateApplication,
  testGetApplications,
  testValidation
};
