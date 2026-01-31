/**
 * Пример использования упрощенного API откликов
 * 
 * Теперь для отклика на вакансию нужно только:
 * 1. Загрузить резюме в профиль (один раз)
 * 2. Нажать кнопку "Откликнуться" (только jobId)
 */

const API_BASE_URL = 'http://localhost:3000';

// Функция для отклика на вакансию (упрощенная)
async function applyToJob(jobId, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: jobId
        // Больше никаких полей не нужно!
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка при отклике');
    }

    const application = await response.json();
    console.log('✅ Отклик успешно отправлен!', application);
    return application;
  } catch (error) {
    console.error('❌ Ошибка при отклике:', error.message);
    throw error;
  }
}

// Функция для загрузки резюме в профиль (делается один раз)
async function uploadResumeToProfile(file, token) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/profiles/candidate/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка при загрузке резюме');
    }

    const result = await response.json();
    console.log('✅ Резюме успешно загружено в профиль!', result);
    return result;
  } catch (error) {
    console.error('❌ Ошибка при загрузке резюме:', error.message);
    throw error;
  }
}

// Функция для получения моих откликов
async function getMyApplications(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/my`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка при получении откликов');
    }

    const applications = await response.json();
    console.log('📋 Мои отклики:', applications);
    return applications;
  } catch (error) {
    console.error('❌ Ошибка при получении откликов:', error.message);
    throw error;
  }
}

// Пример использования
async function example() {
  const token = 'your_jwt_token_here';
  const jobId = 'job_id_here';

  try {
    // 1. Сначала загружаем резюме в профиль (делается один раз)
    const resumeFile = document.getElementById('resumeFile').files[0]; // HTML input file
    await uploadResumeToProfile(resumeFile, token);

    // 2. Теперь можем откликаться на вакансии простым способом
    await applyToJob(jobId, token);

    // 3. Посмотрим на наши отклики
    await getMyApplications(token);

  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

// HTML пример для фронтенда
const htmlExample = `
<!DOCTYPE html>
<html>
<head>
    <title>Упрощенные отклики на вакансии</title>
</head>
<body>
    <h1>Отклик на вакансию</h1>
    
    <!-- Загрузка резюме (делается один раз) -->
    <div>
        <h3>1. Загрузите резюме в профиль</h3>
        <input type="file" id="resumeFile" accept=".pdf,.doc,.docx">
        <button onclick="uploadResume()">Загрузить резюме</button>
    </div>
    
    <!-- Отклик на вакансию (простая кнопка) -->
    <div>
        <h3>2. Откликнуться на вакансию</h3>
        <input type="text" id="jobId" placeholder="ID вакансии">
        <button onclick="applyToJob()">Откликнуться</button>
    </div>
    
    <!-- Мои отклики -->
    <div>
        <h3>3. Мои отклики</h3>
        <button onclick="getMyApplications()">Показать мои отклики</button>
        <div id="applications"></div>
    </div>

    <script>
        const token = localStorage.getItem('auth_token');
        
        async function uploadResume() {
            const file = document.getElementById('resumeFile').files[0];
            if (!file) {
                alert('Выберите файл резюме');
                return;
            }
            await uploadResumeToProfile(file, token);
        }
        
        async function applyToJob() {
            const jobId = document.getElementById('jobId').value;
            if (!jobId) {
                alert('Введите ID вакансии');
                return;
            }
            await applyToJob(jobId, token);
        }
        
        async function getMyApplications() {
            const applications = await getMyApplications(token);
            const div = document.getElementById('applications');
            div.innerHTML = applications.map(app => 
                \`<div>Вакансия: \${app.job.title} - Статус: \${app.status}</div>\`
            ).join('');
        }
    </script>
</body>
</html>
`;

console.log('HTML пример:', htmlExample);

module.exports = {
  applyToJob,
  uploadResumeToProfile,
  getMyApplications
};
