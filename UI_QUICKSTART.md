# 🎨 Room-in-a-Box UI Quick Start Guide

This guide will help you get the UI components up and running quickly.

## 📋 Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git installed

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd room-in-a-box

# Copy environment template
cp .env.template .env

# Edit .env with your API keys (optional for UI demo)
# At minimum, you can leave the API keys empty for the demo
```

### 2. Start the Platform

```bash
# Run the automated setup script
./setup.sh

# Or manually start services
docker-compose up -d
```

### 3. Access the UIs

Once all services are running, you can access:

#### 🌐 Next.js Admin Interface
- **URL**: http://localhost:3000
- **Features**:
  - Dashboard with agent status monitoring
  - Design creation interface
  - Product connector management
  - System analytics and charts

#### 📱 React Native Expo App
- **URL**: http://localhost:19000
- **Features**:
  - Mobile-optimized design interface
  - Room photo upload
  - Style selection
  - Design results viewing

## 🎯 UI Features Overview

### Next.js Admin Interface

#### Dashboard (`/`)
- Real-time agent health monitoring
- System statistics and metrics
- Request trends and product distribution charts
- Quick access to all platform features

#### Design Studio (`/design`)
- Step-by-step room design creation
- Room dimension input
- Style and budget selection
- Design generation and results

#### Connector Management (`/connectors`)
- Product data source management
- Amazon, Wayfair, Home Depot, Target connectors
- Connection status monitoring
- API key configuration

### React Native Mobile App

#### Home Screen
- Quick action buttons
- Design inspiration gallery
- User activity statistics
- Navigation to main features

#### Upload Screen
- Camera integration for room photos
- Gallery selection
- Photo preview and editing
- Tips for best results

#### Style Picker
- Multiple style selection
- Room type categorization
- Budget range slider
- Visual style previews

#### Results Screen
- Design overview with statistics
- Product shopping list
- Interactive room plan
- Product details and purchase links

## 🔧 Development

### Next.js Admin Development

```bash
cd frontend/nextjs-admin

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### React Native Expo Development

```bash
cd frontend/expo-app

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 🎨 UI Technologies

### Next.js Admin
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

### React Native App
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **Icons**: Expo Vector Icons
- **Animations**: React Native Reanimated
- **Image Handling**: Expo Image Picker
- **Styling**: StyleSheet API

## 🔗 API Integration

Both UIs connect to the backend agents:

- **Designer Agent**: http://localhost:3001
- **Data Agent**: http://localhost:3002
- **User Agent**: http://localhost:3003

### API Endpoints Used

#### Designer Agent
- `GET /health` - Health check
- `POST /run` - Generate inspiration specs
- `GET /trends` - Get design trends

#### Data Agent
- `GET /health` - Health check
- `POST /run` - Process product data
- `GET /products` - Search products
- `GET /connectors` - List connectors

#### User Agent
- `GET /health` - Health check
- `POST /run` - Process room design
- `GET /fit-check` - Validate furniture placement
- `GET /room-plan` - Generate room plans

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 3002, 3003, 19000 are available
2. **Docker issues**: Make sure Docker is running and has sufficient resources
3. **Node modules**: Run `npm install` in each frontend directory if needed
4. **Environment variables**: Check that `.env` file exists and has required values

### Health Checks

```bash
# Check all services
curl http://localhost:3000/api/health  # Next.js Admin
curl http://localhost:3001/health      # Designer Agent
curl http://localhost:3002/health      # Data Agent
curl http://localhost:3003/health      # User Agent
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f nextjs-admin
docker-compose logs -f expo-app
```

## 🎉 Success!

You should now have a fully functional UI for the Room-in-a-Box platform with:

- ✅ Beautiful admin dashboard
- ✅ Interactive design creation interface
- ✅ Mobile-optimized app
- ✅ Real-time system monitoring
- ✅ Product management tools

The UIs are ready for development and can be extended with additional features as needed!