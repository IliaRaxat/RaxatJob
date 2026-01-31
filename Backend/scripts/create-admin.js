// Скрипт для создания администратора через базу данных
// Использование: node scripts/create-admin.js <email> <password>

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin(email, password) {
  try {
    console.log('🔧 Создание администратора...');
    
    // Проверяем, не существует ли уже пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`❌ Пользователь с email ${email} уже существует`);
      return;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем пользователя с ролью ADMIN
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      }
    });

    console.log(`✅ Администратор создан: ${user.email} (ID: ${user.id})`);

    // Создаем профиль администратора
    const adminProfile = await prisma.adminProfile.create({
      data: {
        userId: user.id,
        firstName: 'Системный',
        lastName: 'Администратор',
        position: 'Главный администратор',
        department: 'IT',
      }
    });

    console.log(`✅ Профиль администратора создан: ${adminProfile.id}`);
    console.log('\n🎉 Администратор успешно создан!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('\n⚠️  ВАЖНО: Сохраните эти данные в безопасном месте!');
    
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Получаем аргументы командной строки
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('❌ Использование: node scripts/create-admin.js <email> <password>');
  console.log('Пример: node scripts/create-admin.js admin@example.com admin123');
  process.exit(1);
}

const [email, password] = args;
createAdmin(email, password);
