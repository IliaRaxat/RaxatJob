// Примеры работы с API профилей SmartMatch

class ProfileAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.token = null;
  }

  // Аутентификация
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Для HTTP-only куки
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка входа');
      }

      const data = await response.json();
      this.token = data.accessToken;
      return data;
    } catch (error) {
      console.error('Ошибка входа:', error.message);
      throw error;
    }
  }

  async register(email, password, role) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, role })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка регистрации');
      }

      const data = await response.json();
      this.token = data.accessToken;
      return data;
    } catch (error) {
      console.error('Ошибка регистрации:', error.message);
      throw error;
    }
  }

  // Получение заголовков для авторизованных запросов
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // ==================== HR ПРОФИЛЬ ====================

  async getHRProfile() {
    try {
      const response = await fetch(`${this.baseURL}/profiles/hr`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка получения HR профиля');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка получения HR профиля:', error.message);
      throw error;
    }
  }

  async createHRProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/profiles/hr`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка создания HR профиля');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка создания HR профиля:', error.message);
      throw error;
    }
  }

  async updateHRProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/profiles/hr`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка обновления HR профиля');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка обновления HR профиля:', error.message);
      throw error;
    }
  }

  // ==================== CANDIDATE ПРОФИЛЬ ====================

  async getCandidateProfile() {
    try {
      const response = await fetch(`${this.baseURL}/profiles/candidate`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка получения профиля кандидата');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка получения профиля кандидата:', error.message);
      throw error;
    }
  }

  async createCandidateProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/profiles/candidate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка создания профиля кандидата');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка создания профиля кандидата:', error.message);
      throw error;
    }
  }

  async updateCandidateProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/profiles/candidate`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка обновления профиля кандидата');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка обновления профиля кандидата:', error.message);
      throw error;
    }
  }

  // ==================== UNIVERSITY ПРОФИЛЬ ====================

  async getUniversityProfile() {
    try {
      const response = await fetch(`${this.baseURL}/profiles/university`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка получения профиля университета');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка получения профиля университета:', error.message);
      throw error;
    }
  }

  async createUniversityProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/profiles/university`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка создания профиля университета');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка создания профиля университета:', error.message);
      throw error;
    }
  }

  async updateUniversityProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/profiles/university`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка обновления профиля университета');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка обновления профиля университета:', error.message);
      throw error;
    }
  }

  // ==================== УНИВЕРСАЛЬНЫЙ ПРОФИЛЬ ====================

  async updateProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/profiles`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка обновления профиля');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка обновления профиля:', error.message);
      throw error;
    }
  }

  // ==================== ЗАГРУЗКА ФАЙЛОВ ====================

  async uploadFile(file, type = 'AVATAR') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${this.baseURL}/storage/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка загрузки файла');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка загрузки файла:', error.message);
      throw error;
    }
  }

  async getFileUrl(fileId) {
    return `${this.baseURL}/storage/file/${fileId}`;
  }
}

// ==================== ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ ====================

// Создание экземпляра API
const api = new ProfileAPI('http://localhost:3000');

// Пример 1: Регистрация и создание профиля кандидата
async function exampleCandidateRegistration() {
  try {
    // Регистрация
    const authResult = await api.register(
      'candidate@example.com',
      'Password123',
      'CANDIDATE'
    );
    console.log('Регистрация успешна:', authResult);

    // Создание профиля кандидата
    const profileData = {
      firstName: 'Анна',
      lastName: 'Смирнова',
      phone: '+7-999-123-45-67',
      dateOfBirth: '1995-05-15',
      location: 'Москва',
      bio: 'Frontend разработчик с 3 годами опыта',
      linkedinUrl: 'https://linkedin.com/in/anna-smirnova',
      githubUrl: 'https://github.com/anna-smirnova'
    };

    const profile = await api.createCandidateProfile(profileData);
    console.log('Профиль кандидата создан:', profile);

  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

// Пример 2: Вход и получение профиля HR
async function exampleHRLogin() {
  try {
    // Вход
    const authResult = await api.login('hr@company.com', 'Password123');
    console.log('Вход успешен:', authResult);

    // Получение HR профиля
    const profile = await api.getHRProfile();
    console.log('HR профиль:', profile);

  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

// Пример 3: Обновление профиля
async function exampleUpdateProfile() {
  try {
    // Вход
    await api.login('candidate@example.com', 'Password123');

    // Обновление профиля
    const updateData = {
      bio: 'Обновленное описание',
      location: 'Санкт-Петербург',
      linkedinUrl: 'https://linkedin.com/in/new-profile'
    };

    const updatedProfile = await api.updateProfile(updateData);
    console.log('Профиль обновлен:', updatedProfile);

  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

// Пример 4: Загрузка аватара
async function exampleUploadAvatar() {
  try {
    // Вход
    await api.login('candidate@example.com', 'Password123');

    // Загрузка файла
    const fileInput = document.getElementById('avatar-input');
    const file = fileInput.files[0];
    
    if (file) {
      const uploadResult = await api.uploadFile(file, 'AVATAR');
      console.log('Файл загружен:', uploadResult);

      // Обновление профиля с новым аватаром
      const updateData = {
        avatarId: uploadResult.id
      };

      const updatedProfile = await api.updateProfile(updateData);
      console.log('Профиль обновлен с аватаром:', updatedProfile);
    }

  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

// Пример 5: Полный цикл работы с университетом
async function exampleUniversityWorkflow() {
  try {
    // Регистрация университета
    const authResult = await api.register(
      'admin@university.edu',
      'Password123',
      'UNIVERSITY'
    );
    console.log('Университет зарегистрирован:', authResult);

    // Создание профиля университета
    const universityData = {
      name: 'Московский Государственный Университет',
      address: 'Москва, Ленинские горы, 1',
      phone: '+7-495-939-10-00',
      website: 'https://msu.ru'
    };

    const profile = await api.createUniversityProfile(universityData);
    console.log('Профиль университета создан:', profile);

    // Получение профиля с данными студентов
    const fullProfile = await api.getUniversityProfile();
    console.log('Полный профиль университета:', fullProfile);

  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

// ==================== ОБРАБОТКА ОШИБОК ====================

// Функция для безопасного выполнения API вызовов
async function safeApiCall(apiFunction, ...args) {
  try {
    const result = await apiFunction.apply(api, args);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: error
    };
  }
}

// Пример безопасного использования
async function safeExample() {
  const result = await safeApiCall(api.getCandidateProfile);
  
  if (result.success) {
    console.log('Профиль получен:', result.data);
  } else {
    console.error('Ошибка получения профиля:', result.error);
  }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProfileAPI };
}
