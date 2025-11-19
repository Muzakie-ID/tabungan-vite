#!/bin/bash
# deploy.sh - Automated deployment script

set -e

echo "🚀 Tabungan Bersama - Docker Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_warning "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_status "Docker is installed"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_status "Docker Compose is installed"
}

# Setup environment
setup_environment() {
    print_warning "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f .env.docker ]; then
            cp .env.docker .env
            print_status "Created .env from template"
        else
            print_error ".env.docker template not found"
            exit 1
        fi
    else
        print_status ".env already exists"
    fi
    
    # Prompt for sensitive data
    echo ""
    echo "Please configure environment variables:"
    read -p "Enter JWT_SECRET (or press Enter for auto-generate): " JWT_SECRET
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32)
        print_status "Generated JWT_SECRET"
    fi
    sed -i.bak "s|your-super-secret-jwt-key-change-this-in-production|$JWT_SECRET|g" .env
    rm -f .env.bak
    
    read -p "Enter DB_PASSWORD (or press Enter for default): " DB_PASSWORD
    if [ -n "$DB_PASSWORD" ]; then
        sed -i.bak "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|g" .env
        rm -f .env.bak
    fi
}

# Build images
build_images() {
    print_warning "Building Docker images..."
    docker-compose build
    print_status "Images built successfully"
}

# Start services
start_services() {
    print_warning "Starting services..."
    docker-compose up -d
    print_status "Services started"
}

# Wait for services
wait_for_services() {
    print_warning "Waiting for services to be ready..."
    
    # Wait for MySQL
    for i in {1..30}; do
        if docker-compose exec -T mysql mysqladmin ping -h localhost &> /dev/null; then
            print_status "MySQL is ready"
            break
        fi
        echo "Waiting for MySQL... ($i/30)"
        sleep 2
    done
    
    # Wait for Backend
    for i in {1..30}; do
        if curl -f http://localhost:5000/health &> /dev/null; then
            print_status "Backend is ready"
            break
        fi
        echo "Waiting for Backend... ($i/30)"
        sleep 2
    done
    
    # Wait for Frontend
    for i in {1..30}; do
        if curl -f http://localhost:3000 &> /dev/null; then
            print_status "Frontend is ready"
            break
        fi
        echo "Waiting for Frontend... ($i/30)"
        sleep 2
    done
}

# Run migrations
run_migrations() {
    print_warning "Running database migrations..."
    docker-compose exec -T backend npx prisma migrate deploy
    print_status "Migrations completed"
}

# Display info
display_info() {
    echo ""
    echo "================================================"
    echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
    echo "================================================"
    echo ""
    echo "Services are now running:"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:5000"
    echo "  Adminer:   http://localhost:8080"
    echo ""
    echo "Database credentials:"
    echo "  User:     tabungan"
    echo "  Database: tabungan"
    echo ""
    echo "Useful commands:"
    echo "  View logs:       docker-compose logs -f"
    echo "  Stop services:   docker-compose down"
    echo "  Restart:         docker-compose restart"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    setup_environment
    build_images
    start_services
    wait_for_services
    run_migrations
    display_info
}

# Run main function
main
