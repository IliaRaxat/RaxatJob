# 🚀 Руководство по деплою RaxatJob

## Содержание
1. [Быстрый старт (локальный деплой)](#быстрый-старт)
2. [Деплой на VPS/сервер](#деплой-на-vps)
3. [Деплой на Vercel (Frontend) + Railway (Backend)](#деплой-vercel--railway)
4. [Деплой через Docker](#деплой-через-docker)

---

## Быстрый старт (локальный деплой)

### Требования
- Node.js 18+ 
- PostgreSQL 14+
- npm или yarn

### 1. Настройка базы данных

```bash
# Запустить PostgreSQL через Docker
docker-compose up -d

# Или установить PostgreSQL локально и создать БД
createdb raxatjob
```

### 2. Настройка Backend

```bash
cd Backend

# Установить зависимости
npm install

# Настроить .env файл
cp .env.example .env
# Отредактировать .env (см. ниже)

# Применить миграции
npx prisma migrate deploy

# Сгенерировать Prisma Client
npx prisma generate

# Заполнить тестовыми данными (опционально)
node seed-sample-data.js

# Собрать проект
npm run build

# Запустить в production режиме
npm run start:prod
```

**Backend .env для production:**
```env
DATABASE_URL="postgresql://postgres:STRONG_PASSWORD@localhost:5432/raxatjob?schema=public"
JWT_SECRET="GENERATE_STRONG_SECRET_MIN_32_CHARS"
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
SESSION_SECRET="GENERATE_STRONG_SESSION_SECRET"
OLLAMA_BASE_URL=http://109.73.193.10:11434
```

### 3. Настройка Frontend

```bash
cd Frontend

# Установить зависимости
npm install

# Настроить .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:3001" > .env.local
# Для production замените на URL вашего backend

# Собрать проект
npm run build

# Запустить в production режиме
npm start
```

**Frontend .env.local для production:**
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

---

## Деплой на VPS/сервер

### Требования
- Ubuntu 20.04+ / Debian 11+
- Root или sudo доступ
- Домен (опционально, но рекомендуется)

### 1. Подготовка сервера

```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установить PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Установить Nginx
sudo apt install -y nginx

# Установить PM2 (менеджер процессов)
sudo npm install -g pm2
```

### 2. Настройка PostgreSQL

```bash
# Войти в PostgreSQL
sudo -u postgres psql

# Создать пользователя и БД
CREATE USER raxatjob WITH PASSWORD 'STRONG_PASSWORD';
CREATE DATABASE raxatjob OWNER raxatjob;
GRANT ALL PRIVILEGES ON DATABASE raxatjob TO raxatjob;
\q
```

### 3. Деплой Backend

```bash
# Создать директорию для проекта
sudo mkdir -p /var/www/raxatjob
sudo chown -R $USER:$USER /var/www/raxatjob

# Клонировать проект
cd /var/www/raxatjob
git clone YOUR_REPO_URL .

# Настроить Backend
cd Backend
npm install
cp .env.example .env
nano .env  # Отредактировать настройки

# Применить миграции
npx prisma migrate deploy
npx prisma generate

# Собрать проект
npm run build

# Запустить через PM2
pm2 start dist/main.js --name raxatjob-backend
pm2 save
pm2 startup
```

### 4. Деплой Frontend

```bash
cd /var/www/raxatjob/Frontend
npm install

# Настроить .env.local
echo "NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com" > .env.local

# Собрать проект
npm run build

# Запустить через PM2
pm2 start npm --name raxatjob-frontend -- start
pm2 save
```

### 5. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/raxatjob
```

**Конфигурация Nginx:**
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активировать конфигурацию
sudo ln -s /etc/nginx/sites-available/raxatjob /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Настройка SSL (Let's Encrypt)

```bash
# Установить Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получить SSL сертификаты
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Автообновление сертификатов
sudo certbot renew --dry-run
```

---

## Деплой Vercel + Railway

### Frontend на Vercel

1. **Подготовка проекта:**
```bash
cd Frontend
# Создать vercel.json
```

2. **Создать `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_BACKEND_URL": "@backend-url"
  }
}
```

3. **Деплой:**
- Зайти на [vercel.com](https://vercel.com)
- Импортировать репозиторий
- Выбрать папку `Frontend`
- Добавить переменную окружения `NEXT_PUBLIC_BACKEND_URL`
- Deploy!

### Backend на Railway

1. **Подготовка:**
- Зайти на [railway.app](https://railway.app)
- Создать новый проект
- Добавить PostgreSQL database

2. **Настройка:**
- Добавить Backend из репозитория
- Указать Root Directory: `Backend`
- Добавить переменные окружения:
  ```
  DATABASE_URL=<из Railway PostgreSQL>
  JWT_SECRET=<сгенерировать>
  PORT=3001
  NODE_ENV=production
  ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
  SESSION_SECRET=<сгенерировать>
  ```

3. **Build команды:**
- Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- Start Command: `npm run start:prod`

---

## Деплой через Docker

### Быстрый старт

**Все файлы уже созданы!** Просто выполните:

```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

Выберите вариант 2 (Production) и следуйте инструкциям.

### Ручной деплой через Docker

### 1. Создать .env файл

```bash
# Скопировать пример
cp .env.example .env

# Отредактировать .env
nano .env
```

**Минимальная конфигурация .env:**
```env
POSTGRES_PASSWORD=strong_password_here
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
SESSION_SECRET=your-session-secret-key-min-32-chars
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
OLLAMA_BASE_URL=http://109.73.193.10:11434
```

### 2. Собрать и запустить

```bash
# Собрать и запустить все сервисы
docker-compose up -d --build

# Проверить статус
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### 3. Заполнить БД (опционально)

```bash
# Заполнить тестовыми данными
docker-compose exec backend node seed-sample-data.js
```

### 4. Проверка

```bash
# Проверить backend
curl http://localhost:3001/health

# Открыть frontend
# http://localhost:3000
```

### Управление

```bash
# Остановить все сервисы
docker-compose down

# Остановить и удалить данные
docker-compose down -v

# Перезапустить сервис
docker-compose restart backend
docker-compose restart frontend

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Выполнить команду в контейнере
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run build
```

### Структура файлов

Все необходимые файлы уже созданы:
- ✅ `Backend/Dockerfile` - Docker образ для Backend
- ✅ `Frontend/Dockerfile` - Docker образ для Frontend
- ✅ `docker-compose.yml` - Оркестрация сервисов
- ✅ `.env.example` - Пример конфигурации
- ✅ `Backend/.dockerignore` - Исключения для Backend
- ✅ `Frontend/.dockerignore` - Исключения для Frontend
- ✅ `deploy.sh` - Скрипт деплоя для Linux/Mac
- ✅ `deploy.bat` - Скрипт деплоя для Windows

---

## Проверка деплоя

### Backend
```bash
curl http://your-backend-url/health
# Должен вернуть статус OK
```

### Frontend
Откройте браузер и перейдите на ваш домен

### Тестовые пользователи
После запуска `seed-sample-data.js`:
- **HR**: hr@example.com / password123
- **Candidate**: candidate@example.com / password123
- **Admin**: admin@example.com / admin123

---

## Troubleshooting

### Backend не запускается
```bash
# Проверить логи PM2
pm2 logs raxatjob-backend

# Проверить подключение к БД
psql -U raxatjob -d raxatjob -h localhost
```

### Frontend не подключается к Backend
- Проверить CORS настройки в Backend/.env
- Проверить NEXT_PUBLIC_BACKEND_URL в Frontend/.env.local
- Проверить firewall правила

### Ошибки миграций
```bash
# Сбросить и применить заново
cd Backend
npx prisma migrate reset
npx prisma migrate deploy
```

---

## Мониторинг

### PM2 Dashboard
```bash
pm2 monit
```

### Логи
```bash
# Backend
pm2 logs raxatjob-backend

# Frontend
pm2 logs raxatjob-frontend

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Обновление проекта

```bash
cd /var/www/raxatjob

# Получить изменения
git pull

# Backend
cd Backend
npm install
npx prisma migrate deploy
npm run build
pm2 restart raxatjob-backend

# Frontend
cd ../Frontend
npm install
npm run build
pm2 restart raxatjob-frontend
```

---

## Безопасность

1. **Изменить все пароли по умолчанию**
2. **Использовать сильные JWT_SECRET и SESSION_SECRET**
3. **Настроить firewall (ufw)**
4. **Регулярно обновлять зависимости**
5. **Настроить автоматические бэкапы БД**
6. **Использовать HTTPS (SSL)**

---

## Поддержка

Если возникли проблемы:
1. Проверьте логи
2. Проверьте переменные окружения
3. Проверьте подключение к БД
4. Проверьте firewall и CORS настройки
