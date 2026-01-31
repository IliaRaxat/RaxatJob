import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static isConnected = false;

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Настройки логирования
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    if (PrismaService.isConnected) {
      return;
    }

    try {
      await this.$connect();
      PrismaService.isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (!PrismaService.isConnected) {
      return;
    }

    try {
      await this.$disconnect();
      PrismaService.isConnected = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection error:', error);
    }
  }

  // Метод для проверки состояния соединения
  async isConnected(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  // Метод для безопасного выполнения запросов с обработкой ошибок соединения
  async safeExecute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error.message?.includes('too many clients')) {
        console.warn('⚠️ Too many database connections, retrying...');
        // Небольшая задержка перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 100));
        return await operation();
      }
      throw error;
    }
  }

  // Метод для отладки пользователей
  async debugUser(userId: string) {
    try {
      console.log('🔍 Debug: Checking user with ID:', userId);
      
      const user = await this.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true
        }
      });
      
      if (user) {
        console.log('✅ Debug: User found:', user);
        return user;
      } else {
        console.log('❌ Debug: User not found');
        
        // Check total users
        const userCount = await this.user.count();
        console.log('📊 Debug: Total users in database:', userCount);
        
        if (userCount > 0) {
          const recentUsers = await this.user.findMany({
            take: 3,
            select: { id: true, email: true, role: true },
            orderBy: { createdAt: 'desc' }
          });
          console.log('👥 Debug: Recent users:', recentUsers);
        }
        
        return null;
      }
    } catch (error) {
      console.error('❌ Debug: Database error:', error);
      throw error;
    }
  }
}
