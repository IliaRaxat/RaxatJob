const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdminSimple() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Создание администратора...');
    
    // Проверяем существующих пользователей
    const existingUsers = await prisma.user.findMany({
      select: { email: true, role: true }
    });
    
    console.log('👥 Существующие пользователи:');
    existingUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
    // Проверяем, есть ли уже администратор
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('✅ Администратор уже существует:', existingAdmin.email);
      return;
    }
    
    // Создаем администратора
    const email = 'admin@smartmatch.com';
    const password = 'AdminPassword123!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      }
    });
    
    console.log('✅ Администратор создан:', user.email);
    
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
    
    console.log('✅ Профиль администратора создан');
    console.log('\n🎉 Готово! Теперь вы можете войти как администратор:');
    console.log('📧 Email: admin@smartmatch.com');
    console.log('🔑 Password: AdminPassword123!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminSimple();
