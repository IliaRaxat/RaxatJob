const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Проверка пользователей в системе...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Всего пользователей: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ Пользователей не найдено');
      return;
    }
    
    console.log('\n👥 Список пользователей:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.isActive ? 'Активен' : 'Неактивен'}`);
    });
    
    // Проверяем, есть ли администраторы
    const admins = users.filter(user => user.role === 'ADMIN');
    console.log(`\n👑 Администраторов: ${admins.length}`);
    
    if (admins.length === 0) {
      console.log('⚠️ Администраторов не найдено!');
      console.log('💡 Нужно создать администратора для доступа к админ-панели');
    } else {
      console.log('✅ Администраторы найдены:');
      admins.forEach(admin => {
        console.log(`   - ${admin.email}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке пользователей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
