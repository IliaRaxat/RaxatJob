const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdminDirect() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Создание администратора напрямую через базу данных...');
    
    const email = 'admin@smartmatch.com';
    const password = 'AdminPassword123!';
    
    // Проверяем, не существует ли уже пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`⚠️ Пользователь с email ${email} уже существует`);
      console.log('📧 Email:', existingUser.email);
      console.log('🔑 Role:', existingUser.role);
      console.log('✅ Active:', existingUser.isActive);
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
    console.error('❌ Ошибка при создании администратора:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminDirect();
