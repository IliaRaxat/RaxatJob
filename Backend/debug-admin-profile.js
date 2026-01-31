const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAdminProfile() {
  try {
    console.log('🔍 Проверяем профили администраторов...\n');

    // Получаем всех пользователей с ролью ADMIN
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`📊 Найдено пользователей с ролью ADMIN: ${adminUsers.length}`);
    
    if (adminUsers.length === 0) {
      console.log('❌ Пользователей с ролью ADMIN не найдено!');
      return;
    }

    // Проверяем профили для каждого администратора
    for (const user of adminUsers) {
      console.log(`\n👤 Пользователь: ${user.email} (ID: ${user.id})`);
      
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { userId: user.id },
        include: {
          avatar: true
        }
      });

      if (adminProfile) {
        console.log(`✅ Профиль администратора найден:`);
        console.log(`   - ID профиля: ${adminProfile.id}`);
        console.log(`   - Имя: ${adminProfile.firstName} ${adminProfile.lastName}`);
        console.log(`   - Должность: ${adminProfile.position || 'Не указана'}`);
        console.log(`   - Аватар: ${adminProfile.avatarId ? 'Есть' : 'Нет'}`);
      } else {
        console.log(`❌ Профиль администратора НЕ НАЙДЕН!`);
        console.log(`   Это причина ошибки при загрузке аватара.`);
        
        // Предлагаем создать профиль
        console.log(`\n🔧 Создаем профиль администратора...`);
        try {
          const newProfile = await prisma.adminProfile.create({
            data: {
              userId: user.id,
              firstName: 'Администратор',
              lastName: 'Системы',
              position: 'Системный администратор',
              department: 'IT',
            }
          });
          console.log(`✅ Профиль создан успешно! ID: ${newProfile.id}`);
        } catch (createError) {
          console.log(`❌ Ошибка при создании профиля: ${createError.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Ошибка при проверке профилей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAdminProfile();
