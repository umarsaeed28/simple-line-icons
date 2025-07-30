# Room-in-a-Box: AI-Powered Interior Design Platform

A production-ready, multi-agent interior design platform with dimension-correct shopping lists and affiliate links.

## 🏗️ Architecture

### Microservices
- **Designer Agent**: Trend ingestion, moodboard generation, style specification
- **Data Agent**: Product connectors, normalization, vector embeddings
- **User Agent**: Room processing, fit-checking, shopping list generation

### Tech Stack
- **Orchestration**: Temporal.io
- **Messaging**: RabbitMQ
- **Agents**: Node.js (TypeScript) microservices
- **Database**: PostgreSQL + pgvector
- **Storage**: Supabase Storage
- **Frontend**: React Native (Expo) + Next.js
- **Auth**: Auth0
- **AI**: OpenAI GPT-4V + CLIP embeddings

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Yarn or npm

### Local Development

1. **Clone and setup**
```bash
git clone <repository>
cd room-in-a-box
cp .env.template .env
# Edit .env with your API keys
```

2. **Start infrastructure**
```bash
docker-compose up -d rabbitmq postgres
```

3. **Run database migrations**
```bash
cd infra
npm run migrate
```

4. **Start all services**
```bash
docker-compose up --build
```

5. **Verify health checks**
```bash
curl http://localhost:3001/health  # Designer Agent
curl http://localhost:3002/health  # Data Agent  
curl http://localhost:3003/health  # User Agent
```

### API Endpoints

#### Designer Agent (Port 3001)
- `GET /health` - Health check
- `POST /run` - Generate inspiration spec and moodboard
- `GET /trends` - Fetch current design trends

#### Data Agent (Port 3002)
- `GET /health` - Health check
- `POST /run` - Process product data
- `GET /products` - Search products
- `POST /connectors` - Add partner connector

#### User Agent (Port 3003)
- `GET /health` - Health check
- `POST /run` - Process room design request
- `POST /fit-check` - Validate furniture placement

## 📁 Project Structure

```
/
├─ designer-agent/          # Trend ingestion & moodboard generation
├─ data-agent/             # Product connectors & normalization
├─ user-agent/             # Room processing & fit-checking
├─ shared/                 # Schemas, utilities, models
├─ infra/                  # Docker, migrations, config
├─ frontend/               # Next.js admin + React Native app
└─ .github/workflows/      # CI/CD pipeline
```

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `RABBITMQ_URL` - RabbitMQ connection string
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH0_DOMAIN` - Auth0 domain
- `AUTH0_CLIENT_ID` - Auth0 client ID

### Partner Connectors
Configure product data sources in the admin UI:
- Amazon Product Advertising API
- Wayfair
- Home Depot
- Target
- Custom connectors

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific agent tests
npm run test:designer
npm run test:data
npm run test:user

# Integration tests
npm run test:integration
```

## 📊 Monitoring

- Health checks: `/health` endpoints on all agents
- Logs: Structured logging via Winston
- Metrics: Prometheus endpoints (planned)
- Tracing: Distributed tracing with Jaeger (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- Issues: GitHub Issues
- Documentation: `/docs` directory
- Architecture: See `/docs/architecture.md`
