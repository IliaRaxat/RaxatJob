# 🔄 Руководство по миграции резюме

## 📋 Обзор изменений

Система резюме была полностью переработана с файлового подхода на структурированные данные. Теперь резюме хранятся как объекты в базе данных с полями для опыта работы, навыков, образования и других данных.

## 🆚 Сравнение систем

### Старая система (файловая)
- ❌ Резюме как файлы (PDF, DOC, DOCX)
- ❌ Одно резюме на пользователя
- ❌ Нет структурированных данных
- ❌ Сложно анализировать содержимое
- ❌ Нет возможности поиска по содержимому

### Новая система (структурированная)
- ✅ Резюме как структурированные объекты
- ✅ Множественные резюме на пользователя
- ✅ Структурированные данные (опыт, навыки, образование)
- ✅ Легко анализировать и искать
- ✅ Мощные возможности поиска и фильтрации
- ✅ Автоматическое прикрепление к откликам

## 🗄️ Изменения в базе данных

### Новая модель Resume
```sql
CREATE TABLE resumes (
  id TEXT PRIMARY KEY,
  candidateId TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  objective TEXT,
  skills JSON,
  experiences JSON,
  educations JSON,
  projects JSON,
  achievements JSON,
  languages JSON,
  certifications JSON,
  isDefault BOOLEAN DEFAULT false,
  isPublic BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Изменения в Application
```sql
-- Добавлено поле resumeId
ALTER TABLE applications ADD COLUMN resumeId TEXT;
-- Удалено поле resumeUrl
ALTER TABLE applications DROP COLUMN resumeUrl;
```

### Изменения в CandidateProfile
```sql
-- Удалено поле resumeId (больше не нужно)
ALTER TABLE candidate_profiles DROP COLUMN resumeId;
```

## 🚀 Пошаговая миграция

### Шаг 1: Обновление схемы базы данных

```bash
# 1. Создание миграции
npx prisma migrate dev --name add_structured_resumes

# 2. Применение миграции
npx prisma migrate deploy
```

### Шаг 2: Обновление кода приложения

1. **Добавление нового модуля резюме:**
```typescript
// В app.module.ts
import { ResumesModule } from './modules/resumes/resumes.module';

@Module({
  imports: [
    // ... другие модули
    ResumesModule,
  ],
})
```

2. **Обновление сервиса откликов:**
```typescript
// В applications.service.ts
async createApplication(data: CreateApplicationDto) {
  // Получаем основное резюме кандидата
  const defaultResume = await this.resumesService.getDefaultResume(data.candidateId);
  
  return this.prisma.application.create({
    data: {
      ...data,
      resumeId: defaultResume?.id, // Автоматически прикрепляем резюме
    }
  });
}
```

### Шаг 3: Миграция существующих данных

```typescript
// Скрипт миграции данных
async function migrateExistingResumes() {
  const candidates = await prisma.candidateProfile.findMany({
    where: {
      resumeId: { not: null }
    },
    include: {
      resume: true
    }
  });

  for (const candidate of candidates) {
    if (candidate.resume) {
      // Создаем структурированное резюме на основе файлового
      await prisma.resume.create({
        data: {
          candidateId: candidate.id,
          title: `Resume from ${candidate.resume.originalName}`,
          summary: 'Migrated from file-based resume',
          isDefault: true,
          isPublic: true,
          // Можно добавить логику извлечения данных из файла
        }
      });
    }
  }
}
```

## 🔧 API Endpoints

### Новые endpoints для резюме

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/resumes` | Создание резюме |
| GET | `/resumes` | Список резюме |
| GET | `/resumes/default` | Основное резюме |
| GET | `/resumes/{id}` | Резюме по ID |
| PUT | `/resumes/{id}` | Обновление резюме |
| DELETE | `/resumes/{id}` | Удаление резюме |
| POST | `/resumes/{id}/set-default` | Установка основного |
| POST | `/resumes/{id}/duplicate` | Дублирование резюме |

### Устаревшие endpoints

| Метод | Endpoint | Статус |
|-------|----------|--------|
| POST | `/profiles/candidate/resume` | ⚠️ Устарел |
| GET | `/profiles/candidate/resume` | ⚠️ Устарел |
| GET | `/profiles/candidate/resume/url` | ⚠️ Устарел |
| POST | `/profiles/candidate/resume/delete` | ⚠️ Устарел |

## 📱 Обновление фронтенда

### 1. Обновление компонентов

```typescript
// Старый компонент загрузки файла
const FileUploadComponent = () => {
  // Устаревший код...
};

// Новый компонент структурированного резюме
const ResumeFormComponent = () => {
  const [resume, setResume] = useState({
    title: '',
    summary: '',
    skills: [],
    experiences: [],
    // ... другие поля
  });

  const handleSubmit = async () => {
    await createResume(resume);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={resume.title}
        onChange={(e) => setResume({...resume, title: e.target.value})}
        placeholder="Название резюме"
      />
      {/* Другие поля формы */}
    </form>
  );
};
```

### 2. Обновление API клиента

```typescript
// Старый API клиент
class OldResumeAPI {
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return fetch('/profiles/candidate/resume', {
      method: 'POST',
      body: formData
    });
  }
}

// Новый API клиент
class NewResumeAPI {
  async createResume(data: CreateResumeDto) {
    return fetch('/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async getResumes(filters?: ResumeFilters) {
    const params = new URLSearchParams(filters);
    return fetch(`/resumes?${params}`);
  }

  async updateResume(id: string, data: UpdateResumeDto) {
    return fetch(`/resumes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}
```

## 🔄 План миграции для пользователей

### Этап 1: Подготовка
1. Уведомить пользователей о предстоящих изменениях
2. Создать инструкции по новой системе
3. Подготовить инструменты миграции

### Этап 2: Параллельная работа
1. Запустить новую систему параллельно со старой
2. Позволить пользователям создавать структурированные резюме
3. Сохранить доступ к старым файловым резюме

### Этап 3: Миграция данных
1. Предложить пользователям мигрировать данные
2. Предоставить инструменты для копирования данных
3. Автоматически создавать структурированные резюме

### Этап 4: Переход
1. Сделать новую систему основной
2. Отключить старые endpoints
3. Удалить файловые резюме

## 🛠️ Инструменты миграции

### Скрипт автоматической миграции

```typescript
// scripts/migrate-resumes.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateResumes() {
  console.log('🔄 Starting resume migration...');

  const candidates = await prisma.candidateProfile.findMany({
    where: {
      resumeId: { not: null }
    },
    include: {
      resume: true,
      user: true
    }
  });

  console.log(`📋 Found ${candidates.length} candidates with file resumes`);

  for (const candidate of candidates) {
    try {
      // Создаем структурированное резюме
      const structuredResume = await prisma.resume.create({
        data: {
          candidateId: candidate.id,
          title: `Resume from ${candidate.resume.originalName}`,
          summary: 'Migrated from file-based resume',
          isDefault: true,
          isPublic: true,
          // Можно добавить извлечение данных из файла
        }
      });

      console.log(`✅ Created structured resume for ${candidate.user.email}`);

      // Обновляем отклики, чтобы они ссылались на новое резюме
      await prisma.application.updateMany({
        where: {
          candidateId: candidate.id,
          resumeUrl: { not: null }
        },
        data: {
          resumeId: structuredResume.id,
          resumeUrl: null
        }
      });

    } catch (error) {
      console.error(`❌ Error migrating resume for ${candidate.user.email}:`, error);
    }
  }

  console.log('✅ Resume migration completed!');
}

migrateResumes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Утилита для пользователей

```typescript
// utils/resume-migration.ts
export class ResumeMigrationHelper {
  static async migrateUserResume(userId: string) {
    // 1. Получить файловое резюме пользователя
    const fileResume = await this.getFileResume(userId);
    
    // 2. Извлечь данные из файла (если возможно)
    const extractedData = await this.extractDataFromFile(fileResume);
    
    // 3. Создать структурированное резюме
    const structuredResume = await this.createStructuredResume(extractedData);
    
    // 4. Уведомить пользователя
    await this.notifyUser(userId, structuredResume);
    
    return structuredResume;
  }

  private static async extractDataFromFile(fileResume: any) {
    // Логика извлечения данных из файла
    // Можно использовать AI для парсинга PDF/DOC файлов
    return {
      title: 'Extracted Resume',
      summary: 'Data extracted from file',
      // ... другие поля
    };
  }
}
```

## 📊 Мониторинг миграции

### Метрики для отслеживания

```typescript
// analytics/migration-metrics.ts
export class MigrationMetrics {
  static async getMigrationStats() {
    const totalCandidates = await prisma.candidateProfile.count();
    const candidatesWithFileResumes = await prisma.candidateProfile.count({
      where: { resumeId: { not: null } }
    });
    const candidatesWithStructuredResumes = await prisma.candidateProfile.count({
      where: {
        resumes: { some: {} }
      }
    });

    return {
      totalCandidates,
      candidatesWithFileResumes,
      candidatesWithStructuredResumes,
      migrationProgress: (candidatesWithStructuredResumes / totalCandidates) * 100
    };
  }
}
```

## ✅ Чеклист миграции

### Для разработчиков
- [ ] Обновить схему базы данных
- [ ] Создать новые API endpoints
- [ ] Обновить сервисы и контроллеры
- [ ] Написать тесты для новой функциональности
- [ ] Создать скрипты миграции данных
- [ ] Обновить документацию

### Для пользователей
- [ ] Уведомить о предстоящих изменениях
- [ ] Предоставить инструкции по новой системе
- [ ] Создать инструменты для миграции данных
- [ ] Обеспечить поддержку в процессе миграции
- [ ] Провести обучение пользователей

### Для администраторов
- [ ] Создать план миграции
- [ ] Подготовить резервные копии
- [ ] Настроить мониторинг процесса
- [ ] Подготовить план отката
- [ ] Протестировать миграцию на тестовой среде

## 🎯 Результат миграции

После успешной миграции пользователи получат:

1. **Множественные резюме** - возможность создавать разные резюме для разных позиций
2. **Структурированные данные** - легкий ввод и редактирование информации
3. **Автоматическое прикрепление** - основное резюме автоматически прикрепляется к откликам
4. **Мощный поиск** - возможность поиска по содержимому резюме
5. **Гибкость** - легкое обновление отдельных секций резюме

## 🚨 Важные замечания

1. **Обратная совместимость** - старые файловые резюме остаются доступными
2. **Постепенный переход** - пользователи могут мигрировать в удобное время
3. **Поддержка** - предоставить помощь в процессе миграции
4. **Тестирование** - тщательно протестировать новую систему
5. **Документация** - обновить всю документацию и примеры
