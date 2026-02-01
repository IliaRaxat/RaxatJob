#!/bin/bash

# RaxatJob Quick Deployment Script
# This script helps you deploy the application quickly

set -e

echo "🚀 RaxatJob Deployment Script"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration!"
    echo ""
    echo "IMPORTANT: Edit .env and change:"
    echo "  - POSTGRES_PASSWORD"
    echo "  - JWT_SECRET"
    echo "  - SESSION_SECRET"
    echo "  - ALLOWED_ORIGINS (add your domain)"
    echo "  - NEXT_PUBLIC_BACKEND_URL (if deploying to production)"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Ask deployment type
echo "Select deployment type:"
echo "1) Development (with hot reload)"
echo "2) Production (optimized build)"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo ""
        echo "🔧 Starting development environment..."
        echo ""
        
        # Start PostgreSQL
        docker-compose up -d postgres
        
        echo "⏳ Waiting for PostgreSQL to be ready..."
        sleep 5
        
        # Run migrations
        echo "📦 Running database migrations..."
        cd Backend
        npm install
        npx prisma migrate deploy
        npx prisma generate
        
        # Seed data (optional)
        read -p "Do you want to seed sample data? (y/n): " seed_choice
        if [ "$seed_choice" = "y" ]; then
            echo "🌱 Seeding database..."
            node seed-sample-data.js
        fi
        
        cd ..
        
        echo ""
        echo "✅ Development environment is ready!"
        echo ""
        echo "To start the servers:"
        echo "  Backend:  cd Backend && npm run start:dev"
        echo "  Frontend: cd Frontend && npm run dev"
        echo ""
        ;;
    2)
        echo ""
        echo "🏗️  Building and starting production environment..."
        echo ""
        
        # Build and start all services
        docker-compose up -d --build
        
        echo "⏳ Waiting for services to start..."
        sleep 10
        
        # Check if services are running
        if docker ps | grep -q raxatjob-backend && docker ps | grep -q raxatjob-frontend; then
            echo ""
            echo "✅ Deployment successful!"
            echo ""
            echo "🌐 Application URLs:"
            echo "  Frontend: http://localhost:3000"
            echo "  Backend:  http://localhost:3001"
            echo ""
            echo "📊 View logs:"
            echo "  All services: docker-compose logs -f"
            echo "  Backend:      docker-compose logs -f backend"
            echo "  Frontend:     docker-compose logs -f frontend"
            echo ""
            echo "🛑 Stop services:"
            echo "  docker-compose down"
            echo ""
            
            # Seed data (optional)
            read -p "Do you want to seed sample data? (y/n): " seed_choice
            if [ "$seed_choice" = "y" ]; then
                echo "🌱 Seeding database..."
                docker-compose exec backend node seed-sample-data.js
                echo "✅ Database seeded!"
            fi
        else
            echo ""
            echo "❌ Deployment failed. Check logs:"
            echo "  docker-compose logs"
            exit 1
        fi
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Done!"
