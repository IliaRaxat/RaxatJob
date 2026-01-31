// Пример использования новой системы структурированных резюме

const API_BASE = 'http://localhost:3000';
const CANDIDATE_TOKEN = 'your_candidate_jwt_token_here';

// Пример создания резюме Frontend Developer
async function createFrontendResume() {
  const resumeData = {
    title: "Frontend Developer",
    summary: "Опытный frontend разработчик с 5+ лет опыта в создании современных веб-приложений. Специализируюсь на React, TypeScript и современных инструментах разработки.",
    objective: "Ищу позицию Senior Frontend Developer в инновационной компании для работы над интересными проектами.",
    
    skills: [
      { name: "JavaScript", level: 5, category: "Programming" },
      { name: "TypeScript", level: 4, category: "Programming" },
      { name: "React", level: 5, category: "Framework" },
      { name: "Vue.js", level: 3, category: "Framework" },
      { name: "Node.js", level: 4, category: "Backend" },
      { name: "HTML/CSS", level: 5, category: "Frontend" },
      { name: "Git", level: 4, category: "Tools" },
      { name: "Webpack", level: 3, category: "Build Tools" }
    ],
    
    experiences: [
      {
        company: "TechCorp Solutions",
        position: "Senior Frontend Developer",
        startDate: "2021-03-01",
        endDate: "2024-01-15",
        isCurrent: false,
        description: "Разработка и поддержка веб-приложений для корпоративных клиентов",
        achievements: [
          "Увеличил производительность приложения на 40%",
          "Внедрил TypeScript в существующий проект",
          "Обучил команду из 3 junior разработчиков"
        ],
        technologies: ["React", "TypeScript", "Redux", "Jest", "Webpack"]
      },
      {
        company: "StartupXYZ",
        position: "Frontend Developer",
        startDate: "2019-06-01",
        endDate: "2021-02-28",
        isCurrent: false,
        description: "Разработка MVP для стартапа в сфере e-commerce",
        achievements: [
          "Создал с нуля frontend приложение",
          "Интегрировал с 5+ внешними API",
          "Достиг 95% покрытия тестами"
        ],
        technologies: ["Vue.js", "JavaScript", "Vuex", "Axios", "Bootstrap"]
      }
    ],
    
    educations: [
      {
        institution: "Московский Государственный Университет",
        degree: "Бакалавр",
        field: "Прикладная математика и информатика",
        startDate: "2015-09-01",
        endDate: "2019-06-30",
        isCurrent: false,
        gpa: 4.2,
        description: "Специализация в области алгоритмов и структур данных"
      },
      {
        institution: "Coursera",
        degree: "Сертификат",
        field: "Full Stack Web Development",
        startDate: "2020-01-01",
        endDate: "2020-06-30",
        isCurrent: false,
        description: "Специализация по современной веб-разработке"
      }
    ],
    
    projects: [
      {
        name: "E-commerce Platform",
        description: "Полнофункциональная платформа для онлайн-торговли с админ-панелью",
        startDate: "2023-01-01",
        endDate: "2023-08-31",
        isCurrent: false,
        technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Stripe"],
        url: "https://ecommerce-demo.com",
        githubUrl: "https://github.com/user/ecommerce-platform"
      },
      {
        name: "Task Management App",
        description: "Приложение для управления задачами с real-time обновлениями",
        startDate: "2022-06-01",
        endDate: "2022-12-31",
        isCurrent: false,
        technologies: ["Vue.js", "Socket.io", "Express", "MongoDB"],
        githubUrl: "https://github.com/user/task-manager"
      }
    ],
    
    achievements: [
      {
        title: "Лучший разработчик года",
        description: "Награда за выдающиеся достижения в разработке",
        date: "2023-12-15",
        category: "Professional"
      },
      {
        title: "Open Source Contributor",
        description: "Активный участник open source проектов",
        date: "2022-01-01",
        category: "Community"
      }
    ],
    
    languages: [
      { name: "Русский", level: "Native" },
      { name: "Английский", level: "Fluent", certification: "IELTS 7.5" },
      { name: "Немецкий", level: "Intermediate" }
    ],
    
    certifications: [
      {
        name: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        date: "2023-03-15",
        credentialId: "AWS-DEV-123456",
        url: "https://aws.amazon.com/certification/"
      },
      {
        name: "React Developer Certification",
        issuer: "Meta",
        date: "2022-09-20",
        credentialId: "META-REACT-789012"
      }
    ],
    
    isDefault: true,
    isPublic: true
  };

  try {
    const response = await fetch(`${API_BASE}/resumes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CANDIDATE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resumeData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create resume: ${error.message}`);
    }

    const result = await response.json();
    console.log('✅ Frontend resume created:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating frontend resume:', error.message);
    throw error;
  }
}

// Пример создания резюме Data Scientist
async function createDataScienceResume() {
  const resumeData = {
    title: "Data Scientist",
    summary: "Data Scientist с опытом в машинном обучении, статистическом анализе и работе с большими данными. Специализируюсь на Python, R и современных ML фреймворках.",
    objective: "Ищу позицию Senior Data Scientist для работы над проектами в области искусственного интеллекта и машинного обучения.",
    
    skills: [
      { name: "Python", level: 5, category: "Programming" },
      { name: "R", level: 4, category: "Programming" },
      { name: "SQL", level: 5, category: "Database" },
      { name: "Machine Learning", level: 5, category: "AI/ML" },
      { name: "TensorFlow", level: 4, category: "Framework" },
      { name: "PyTorch", level: 4, category: "Framework" },
      { name: "Pandas", level: 5, category: "Data Analysis" },
      { name: "Scikit-learn", level: 5, category: "ML Library" }
    ],
    
    experiences: [
      {
        company: "AI Solutions Inc",
        position: "Senior Data Scientist",
        startDate: "2022-01-01",
        endDate: "2024-01-15",
        isCurrent: false,
        description: "Разработка ML моделей для прогнозирования и классификации",
        achievements: [
          "Улучшил точность модели на 25%",
          "Внедрил автоматизированный pipeline для обучения моделей",
          "Обучил команду из 5 data scientists"
        ],
        technologies: ["Python", "TensorFlow", "PyTorch", "Apache Spark", "Docker"]
      }
    ],
    
    educations: [
      {
        institution: "МФТИ",
        degree: "Магистр",
        field: "Прикладная математика и физика",
        startDate: "2018-09-01",
        endDate: "2020-06-30",
        isCurrent: false,
        gpa: 4.8,
        description: "Специализация в области машинного обучения и нейронных сетей"
      }
    ],
    
    projects: [
      {
        name: "Recommendation System",
        description: "Система рекомендаций для e-commerce платформы с использованием collaborative filtering",
        startDate: "2023-03-01",
        endDate: "2023-09-30",
        isCurrent: false,
        technologies: ["Python", "TensorFlow", "Apache Kafka", "Redis", "PostgreSQL"],
        githubUrl: "https://github.com/user/recommendation-system"
      }
    ],
    
    isDefault: false,
    isPublic: true
  };

  try {
    const response = await fetch(`${API_BASE}/resumes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CANDIDATE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resumeData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create resume: ${error.message}`);
    }

    const result = await response.json();
    console.log('✅ Data Science resume created:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating data science resume:', error.message);
    throw error;
  }
}

// Получение всех резюме пользователя
async function getAllResumes() {
  try {
    const response = await fetch(`${API_BASE}/resumes`, {
      headers: {
        'Authorization': `Bearer ${CANDIDATE_TOKEN}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get resumes: ${error.message}`);
    }

    const result = await response.json();
    console.log('📋 All resumes:', result);
    return result;
  } catch (error) {
    console.error('❌ Error getting resumes:', error.message);
    throw error;
  }
}

// Получение основного резюме
async function getDefaultResume() {
  try {
    const response = await fetch(`${API_BASE}/resumes/default`, {
      headers: {
        'Authorization': `Bearer ${CANDIDATE_TOKEN}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get default resume: ${error.message}`);
    }

    const result = await response.json();
    console.log('⭐ Default resume:', result);
    return result;
  } catch (error) {
    console.error('❌ Error getting default resume:', error.message);
    throw error;
  }
}

// Обновление резюме
async function updateResume(resumeId, updateData) {
  try {
    const response = await fetch(`${API_BASE}/resumes/${resumeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CANDIDATE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update resume: ${error.message}`);
    }

    const result = await response.json();
    console.log('✅ Resume updated:', result);
    return result;
  } catch (error) {
    console.error('❌ Error updating resume:', error.message);
    throw error;
  }
}

// Дублирование резюме
async function duplicateResume(resumeId, newTitle) {
  try {
    const response = await fetch(`${API_BASE}/resumes/${resumeId}/duplicate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CANDIDATE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: newTitle })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to duplicate resume: ${error.message}`);
    }

    const result = await response.json();
    console.log('📋 Resume duplicated:', result);
    return result;
  } catch (error) {
    console.error('❌ Error duplicating resume:', error.message);
    throw error;
  }
}

// Установка основного резюме
async function setDefaultResume(resumeId) {
  try {
    const response = await fetch(`${API_BASE}/resumes/${resumeId}/set-default`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CANDIDATE_TOKEN}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to set default resume: ${error.message}`);
    }

    const result = await response.json();
    console.log('⭐ Default resume set:', result);
    return result;
  } catch (error) {
    console.error('❌ Error setting default resume:', error.message);
    throw error;
  }
}

// Полный пример использования
async function fullExample() {
  try {
    console.log('🚀 Starting structured resumes example...\n');

    // 1. Создаем Frontend резюме
    console.log('1. Creating Frontend Developer resume...');
    const frontendResume = await createFrontendResume();
    console.log(`   Created resume: ${frontendResume.title} (ID: ${frontendResume.id})\n`);

    // 2. Создаем Data Science резюме
    console.log('2. Creating Data Scientist resume...');
    const dataScienceResume = await createDataScienceResume();
    console.log(`   Created resume: ${dataScienceResume.title} (ID: ${dataScienceResume.id})\n`);

    // 3. Получаем все резюме
    console.log('3. Getting all resumes...');
    const allResumes = await getAllResumes();
    console.log(`   Found ${allResumes.total} resumes\n`);

    // 4. Получаем основное резюме
    console.log('4. Getting default resume...');
    const defaultResume = await getDefaultResume();
    console.log(`   Default resume: ${defaultResume.title}\n`);

    // 5. Обновляем Data Science резюме
    console.log('5. Updating Data Science resume...');
    const updateData = {
      summary: "Обновленное описание: Data Scientist с расширенным опытом в deep learning и NLP",
      skills: [
        { name: "Deep Learning", level: 5, category: "AI/ML" },
        { name: "NLP", level: 4, category: "AI/ML" }
      ]
    };
    await updateResume(dataScienceResume.id, updateData);
    console.log('   Resume updated successfully\n');

    // 6. Дублируем Frontend резюме
    console.log('6. Duplicating Frontend resume...');
    const duplicatedResume = await duplicateResume(
      frontendResume.id, 
      "Frontend Developer - React Specialist"
    );
    console.log(`   Duplicated resume: ${duplicatedResume.title} (ID: ${duplicatedResume.id})\n`);

    // 7. Устанавливаем Data Science резюме как основное
    console.log('7. Setting Data Science resume as default...');
    await setDefaultResume(dataScienceResume.id);
    console.log('   Default resume changed\n');

    // 8. Финальная проверка
    console.log('8. Final check - getting all resumes...');
    const finalResumes = await getAllResumes();
    console.log(`   Total resumes: ${finalResumes.total}`);
    finalResumes.resumes.forEach((resume, index) => {
      console.log(`   ${index + 1}. ${resume.title} ${resume.isDefault ? '(DEFAULT)' : ''}`);
    });

    console.log('\n✅ Example completed successfully!');

  } catch (error) {
    console.error('❌ Example failed:', error.message);
  }
}

// Экспорт функций для использования
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createFrontendResume,
    createDataScienceResume,
    getAllResumes,
    getDefaultResume,
    updateResume,
    duplicateResume,
    setDefaultResume,
    fullExample
  };
}

// Запуск примера, если файл выполняется напрямую
if (typeof window === 'undefined' && require.main === module) {
  fullExample();
}
