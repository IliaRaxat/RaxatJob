#!/bin/bash

# RaxatJob Deployment Health Check Script

echo "🔍 Checking RaxatJob Deployment Status"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Docker not installed${NC}"
    exit 1
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Docker Compose not installed${NC}"
    exit 1
fi

echo ""
echo "📦 Checking Services..."
echo ""

# Check PostgreSQL
echo -n "PostgreSQL: "
if docker ps | grep -q raxatjob-postgres; then
    echo -e "${GREEN}Running${NC}"
else
    echo -e "${RED}Not running${NC}"
fi

# Check Backend
echo -n "Backend:    "
if docker ps | grep -q raxatjob-backend; then
    echo -e "${GREEN}Running${NC}"
    
    # Check backend health
    echo -n "  Health:   "
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}Not responding${NC}"
    fi
else
    echo -e "${RED}Not running${NC}"
fi

# Check Frontend
echo -n "Frontend:   "
if docker ps | grep -q raxatjob-frontend; then
    echo -e "${GREEN}Running${NC}"
    
    # Check frontend health
    echo -n "  Health:   "
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}Not responding${NC}"
    fi
else
    echo -e "${RED}Not running${NC}"
fi

echo ""
echo "🌐 Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""

# Check .env file
echo -n "Configuration (.env): "
if [ -f .env ]; then
    echo -e "${GREEN}Found${NC}"
else
    echo -e "${YELLOW}Not found (using defaults)${NC}"
fi

echo ""
echo "📊 Container Stats:"
docker-compose ps

echo ""
echo "💡 Useful Commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Restart services: docker-compose restart"
echo "  Stop services:    docker-compose down"
echo ""
