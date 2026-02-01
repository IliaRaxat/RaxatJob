const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('Starting to seed sample data...\n');
    
    // First, check if we have any HR users
    const hrUsers = await prisma.user.findMany({
      where: { role: 'HR' },
      include: { hrProfile: true }
    });
    
    console.log(`Found ${hrUsers.length} HR users`);
    
    if (hrUsers.length === 0) {
      console.log('\nNo HR users found. Creating a sample HR user...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const hrUser = await prisma.user.create({
        data: {
          email: 'hr@example.com',
          password: hashedPassword,
          role: 'HR',
          isActive: true,
          hrProfile: {
            create: {
              firstName: 'Иван',
              lastName: 'Петров',
              company: 'ТехноКомпания',
              position: 'HR Менеджер',
              phone: '+7 (999) 123-45-67'
            }
          }
        },
        include: {
          hrProfile: true
        }
      });
      
      console.log(`Created HR user: ${hrUser.email}`);
      hrUsers.push(hrUser);
    }
    
    const hrProfile = hrUsers[0].hrProfile;
    
    if (!hrProfile) {
      console.error('HR profile not found!');
      return;
    }
    
    console.log(`\nUsing HR profile: ${hrProfile.firstName} ${hrProfile.lastName} from ${hrProfile.company}`);
    
    // Create some skills
    console.log('\nCreating skills...');
    const skills = await Promise.all([
      prisma.skill.upsert({
        where: { name: 'JavaScript' },
        update: {},
        create: { name: 'JavaScript', category: 'Programming', isActive: true }
      }),
      prisma.skill.upsert({
        where: { name: 'TypeScript' },
        update: {},
        create: { name: 'TypeScript', category: 'Programming', isActive: true }
      }),
      prisma.skill.upsert({
        where: { name: 'React' },
        update: {},
        create: { name: 'React', category: 'Framework', isActive: true }
      }),
      prisma.skill.upsert({
        where: { name: 'Node.js' },
        update: {},
        create: { name: 'Node.js', category: 'Backend', isActive: true }
      }),
      prisma.skill.upsert({
        where: { name: 'Python' },
        update: {},
        create: { name: 'Python', category: 'Programming', isActive: true }
      }),
      prisma.skill.upsert({
        where: { name: 'SQL' },
        update: {},
        create: { name: 'SQL', category: 'Database', isActive: true }
      })
    ]);
    
    console.log(`Created ${skills.length} skills`);
    
    // Create sample jobs
    console.log('\nCreating sample jobs...');
    
    const jobs = [
      {
        title: 'Frontend разработчик',
        description: 'Ищем опытного Frontend разработчика для работы над современными веб-приложениями. Работа в команде профессионалов, интересные задачи, возможность профессионального роста.',
        requirements: 'Опыт работы с React от 2 лет, знание TypeScript, понимание принципов REST API',
        responsibilities: 'Разработка пользовательских интерфейсов, оптимизация производительности, code review',
        benefits: 'ДМС, гибкий график, удаленная работа, корпоративное обучение',
        salaryMin: 150000,
        salaryMax: 250000,
        location: 'Москва',
        type: 'FULL_TIME',
        experienceLevel: 'MIDDLE',
        remote: true,
        skillIds: [skills[0].id, skills[1].id, skills[2].id]
      },
      {
        title: 'Backend разработчик Node.js',
        description: 'Требуется Backend разработчик для создания высоконагруженных API и микросервисов.',
        requirements: 'Опыт с Node.js от 3 лет, знание PostgreSQL, опыт с Docker',
        responsibilities: 'Проектирование и разработка API, оптимизация баз данных, написание тестов',
        benefits: 'Конкурентная зарплата, ДМС, офис в центре города',
        salaryMin: 180000,
        salaryMax: 300000,
        location: 'Санкт-Петербург',
        type: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        remote: false,
        skillIds: [skills[0].id, skills[3].id, skills[5].id]
      },
      {
        title: 'Python разработчик',
        description: 'Разработка backend-сервисов на Python для финтех-проектов.',
        requirements: 'Python 3.x, Django/FastAPI, опыт работы с SQL базами данных',
        responsibilities: 'Разработка и поддержка backend-сервисов, интеграция с внешними API',
        benefits: 'Гибкий график, удаленная работа, бонусы',
        salaryMin: 160000,
        salaryMax: 280000,
        location: 'Новосибирск',
        type: 'FULL_TIME',
        experienceLevel: 'MIDDLE',
        remote: true,
        skillIds: [skills[4].id, skills[5].id]
      },
      {
        title: 'Fullstack разработчик',
        description: 'Ищем универсального разработчика для работы над стартап-проектом.',
        requirements: 'Опыт с React и Node.js, знание TypeScript приветствуется',
        responsibilities: 'Разработка frontend и backend частей приложения',
        benefits: 'Опционы компании, гибкий график, молодая команда',
        salaryMin: 120000,
        salaryMax: 200000,
        location: 'Казань',
        type: 'FULL_TIME',
        experienceLevel: 'JUNIOR',
        remote: true,
        skillIds: [skills[0].id, skills[1].id, skills[2].id, skills[3].id]
      },
      {
        title: 'Junior Frontend разработчик',
        description: 'Отличная возможность начать карьеру в IT. Обучение и менторство.',
        requirements: 'Базовые знания HTML, CSS, JavaScript. Желание учиться и развиваться',
        responsibilities: 'Разработка UI компонентов под руководством senior разработчиков',
        benefits: 'Обучение, менторство, карьерный рост',
        salaryMin: 80000,
        salaryMax: 120000,
        location: 'Екатеринбург',
        type: 'FULL_TIME',
        experienceLevel: 'ENTRY',
        remote: false,
        skillIds: [skills[0].id, skills[2].id]
      }
    ];
    
    for (const jobData of jobs) {
      const { skillIds, ...jobInfo } = jobData;
      
      const job = await prisma.job.create({
        data: {
          ...jobInfo,
          hrId: hrProfile.id,
          status: 'ACTIVE',
          moderationStatus: 'APPROVED',
          publishedAt: new Date(),
          views: Math.floor(Math.random() * 100),
          applicationsCount: Math.floor(Math.random() * 10)
        }
      });
      
      // Add skills to job
      for (const skillId of skillIds) {
        await prisma.jobSkill.create({
          data: {
            jobId: job.id,
            skillId: skillId,
            required: true
          }
        });
      }
      
      console.log(`  ✓ Created job: ${job.title}`);
    }
    
    // Create sample internships
    console.log('\nCreating sample internships...');
    
    const internships = [
      {
        title: 'Стажировка Frontend разработчика',
        description: 'Трехмесячная стажировка для начинающих разработчиков. Работа с React и TypeScript.',
        requirements: 'Базовые знания JavaScript, желание учиться',
        responsibilities: 'Разработка UI компонентов, участие в code review',
        benefits: 'Стипендия, менторство, возможность трудоустройства',
        salaryMin: 40000,
        salaryMax: 60000,
        location: 'Москва',
        isRemote: true,
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // через месяц
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // через 4 месяца
        duration: 90,
        maxParticipants: 5,
        currentParticipants: 0
      },
      {
        title: 'Стажировка Backend разработчика',
        description: 'Практическая стажировка по разработке серверных приложений на Node.js.',
        requirements: 'Знание JavaScript/TypeScript, базовое понимание баз данных',
        responsibilities: 'Разработка API endpoints, работа с базами данных',
        benefits: 'Стипендия, реальные проекты, сертификат',
        salaryMin: 45000,
        salaryMax: 65000,
        location: 'Санкт-Петербург',
        isRemote: false,
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 135 * 24 * 60 * 60 * 1000),
        duration: 90,
        maxParticipants: 3,
        currentParticipants: 0
      },
      {
        title: 'Летняя стажировка для студентов',
        description: 'Летняя программа стажировки для студентов технических специальностей.',
        requirements: 'Студент 3-4 курса, знание любого языка программирования',
        responsibilities: 'Участие в разработке реальных проектов',
        benefits: 'Стипендия, гибкий график, возможность удаленной работы',
        salaryMin: 35000,
        salaryMax: 50000,
        location: 'Новосибирск',
        isRemote: true,
        startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        duration: 90,
        maxParticipants: 10,
        currentParticipants: 0
      }
    ];
    
    for (const internshipData of internships) {
      const internship = await prisma.internship.create({
        data: {
          ...internshipData,
          hrId: hrProfile.id,
          status: 'ACTIVE',
          moderationStatus: 'APPROVED',
          publishedAt: new Date(),
          views: Math.floor(Math.random() * 50),
          applicationsCount: Math.floor(Math.random() * 5)
        }
      });
      
      console.log(`  ✓ Created internship: ${internship.title}`);
    }
    
    console.log('\n✅ Sample data seeded successfully!');
    console.log('\nSummary:');
    console.log(`  - Jobs created: ${jobs.length}`);
    console.log(`  - Internships created: ${internships.length}`);
    console.log(`  - Skills created: ${skills.length}`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
