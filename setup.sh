#!/bin/bash

# Room-in-a-Box Platform Setup Script
# This script sets up the entire platform for local development

set -e

echo "🚀 Setting up Room-in-a-Box Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Check if Docker Compose is installed
check_docker_compose() {
    print_status "Checking Docker Compose installation..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker Compose is installed"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Setup environment file
setup_env() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp .env.template .env
        print_warning "Environment file created from template. Please edit .env with your actual API keys."
    else
        print_success "Environment file already exists"
    fi
}

# Install dependencies for all agents
install_dependencies() {
    print_status "Installing dependencies for all agents..."
    
    # Designer Agent
    print_status "Installing Designer Agent dependencies..."
    cd designer-agent
    npm install
    cd ..
    
    # Data Agent
    print_status "Installing Data Agent dependencies..."
    cd data-agent
    npm install
    cd ..
    
    # User Agent
    print_status "Installing User Agent dependencies..."
    cd user-agent
    npm install
    cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    
    # Next.js Admin
    print_status "Installing Next.js Admin dependencies..."
    cd frontend/nextjs-admin
    npm install
    cd ../..
    
    # Expo App
    print_status "Installing Expo App dependencies..."
    cd frontend/expo-app
    npm install
    cd ../..
    
    print_success "All dependencies installed"
}

# Build all agents
build_agents() {
    print_status "Building all agents..."
    
    # Designer Agent
    print_status "Building Designer Agent..."
    cd designer-agent
    npm run build
    cd ..
    
    # Data Agent
    print_status "Building Data Agent..."
    cd data-agent
    npm run build
    cd ..
    
    # User Agent
    print_status "Building User Agent..."
    cd user-agent
    npm run build
    cd ..
    
    print_success "All agents built successfully"
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services (PostgreSQL, RabbitMQ)..."
    
    docker-compose up -d postgres rabbitmq redis
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    until docker-compose exec -T postgres pg_isready -U postgres; do
        print_status "Waiting for PostgreSQL..."
        sleep 2
    done
    
    # Check if RabbitMQ is ready
    until curl -f http://localhost:15672/api/overview &> /dev/null; do
        print_status "Waiting for RabbitMQ..."
        sleep 2
    done
    
    print_success "Infrastructure services are ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait a bit more for PostgreSQL to be fully ready
    sleep 5
    
    # Run the migration SQL file
    docker-compose exec -T postgres psql -U postgres -d room_in_a_box -f /docker-entrypoint-initdb.d/001_initial_schema.sql
    
    print_success "Database migrations completed"
}

# Start all services
start_services() {
    print_status "Starting all services..."
    
    docker-compose up -d
    
    print_success "All services started"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check Designer Agent
    if curl -f http://localhost:3001/health &> /dev/null; then
        print_success "Designer Agent is healthy"
    else
        print_error "Designer Agent health check failed"
    fi
    
    # Check Data Agent
    if curl -f http://localhost:3002/health &> /dev/null; then
        print_success "Data Agent is healthy"
    else
        print_error "Data Agent health check failed"
    fi
    
    # Check User Agent
    if curl -f http://localhost:3003/health &> /dev/null; then
        print_success "User Agent is healthy"
    else
        print_error "User Agent health check failed"
    fi
    
    # Check Next.js Admin
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        print_success "Next.js Admin is healthy"
    else
        print_error "Next.js Admin health check failed"
    fi
}

# Main setup function
main() {
    print_status "Starting Room-in-a-Box platform setup..."
    
    # Check prerequisites
    check_docker
    check_docker_compose
    check_node
    
    # Setup environment
    setup_env
    
    # Install dependencies
    install_dependencies
    
    # Build agents
    build_agents
    
    # Start infrastructure
    start_infrastructure
    
    # Run migrations
    run_migrations
    
    # Start all services
    start_services
    
    # Health check
    health_check
    
    print_success "🎉 Room-in-a-Box platform setup completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Edit .env file with your actual API keys"
    echo "2. Access the services:"
    echo "   - Designer Agent: http://localhost:3001"
    echo "   - Data Agent: http://localhost:3002"
    echo "   - User Agent: http://localhost:3003"
    echo "   - Next.js Admin: http://localhost:3000"
    echo "   - Expo App: http://localhost:19000"
    echo "   - RabbitMQ Management: http://localhost:15672 (admin/password)"
    echo "3. Run 'docker-compose logs -f' to view logs"
    echo "4. Run 'docker-compose down' to stop all services"
    echo ""
    echo "📚 Documentation: See README.md for more details"
}

# Run main function
main "$@"