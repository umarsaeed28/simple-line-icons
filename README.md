# Room-in-a-Box Interior Design Platform 🏠✨

A production-ready, multi-agent interior design platform that generates dimension-correct shopping lists with affiliate links. Built with AI-powered trend analysis, automated product sourcing, and intelligent furniture placement validation.

## 🎯 Overview

The Room-in-a-Box platform consists of three core microservices that work together to deliver personalized interior design solutions:

- **Designer Agent**: Analyzes design trends and generates AI-powered inspiration specifications
- **Data Agent**: Manages partner integrations and product data normalization  
- **User Agent**: Processes room designs and validates furniture arrangements

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Designer Agent │    │   Data Agent    │    │   User Agent    │
│                 │    │                 │    │                 │
│ • Trend Analysis│    │ • Partner APIs  │    │ • Room Planning │
│ • AI Moodboards │    │ • Product Sync  │    │ • Fit Checking  │
│ • Style Specs   │    │ • Normalization │    │ • 2D/3D Plans   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   RabbitMQ      │
                    │ Message Broker  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ PostgreSQL +    │
                    │ pgvector        │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- OpenAI API key
- Partner API keys (Amazon, etc.)

### 1. Clone and Setup

```bash
git clone https://github.com/your-org/room-in-a-box.git
cd room-in-a-box

# Copy environment template
cp infra/.env.template infra/.env

# Edit environment variables
nano infra/.env
```

### 2. Configure Environment

Edit `infra/.env` with your API keys:

```env
# Required for AI features
OPENAI_API_KEY=your_openai_api_key_here

# Required for product data
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_ASSOCIATE_TAG=your_associate_tag

# Database & messaging (auto-generated for local dev)
POSTGRES_PASSWORD=your_secure_password
RABBITMQ_PASS=your_rabbitmq_password
```

### 3. Launch Platform

```bash
cd infra
docker-compose up --build
```

This starts all services:
- **Designer Agent**: http://localhost:3001
- **Data Agent**: http://localhost:3002  
- **User Agent**: http://localhost:3003
- **RabbitMQ Management**: http://localhost:15672
- **Grafana Monitoring**: http://localhost:3000
- **MinIO Storage**: http://localhost:9001

### 4. Verify Setup

```bash
# Check all services are healthy
curl http://localhost:3001/health  # Designer Agent
curl http://localhost:3002/health  # Data Agent  
curl http://localhost:3003/health  # User Agent
```

## 🧪 Testing the Platform

### Generate an Inspiration Spec

```bash
curl -X POST http://localhost:3001/api/inspiration/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Modern minimalist living room",
    "style_hints": ["scandinavian", "hygge"],
    "sources": []
  }'
```

### Process a Room Design

```bash
curl -X POST http://localhost:3003/api/room/design \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "test-123",
    "user_id": "user-456",
    "room_geometry": {
      "type": "dimensions",
      "width_cm": 400,
      "length_cm": 500,
      "height_cm": 250
    },
    "style_preference": {
      "type": "style_tags",
      "style_tags": ["modern", "minimalist"]
    },
    "budget": {
      "max_usd": 5000
    },
    "room_type": "living_room"
  }'
```

## 📁 Project Structure

```
/
├─ designer-agent/          # Trend analysis & moodboard generation
│  ├─ src/
│  │  ├─ services/         # TrendAnalyzer, MoodboardGenerator
│  │  ├─ utils/            # Logger, helpers
│  │  └─ index.ts          # Main server
│  ├─ Dockerfile
│  └─ package.json
│
├─ data-agent/              # Partner integrations & product data
│  ├─ src/
│  │  ├─ connectors/       # Amazon, Wayfair, Home Depot APIs
│  │  ├─ services/         # ProductManager, EmbeddingService
│  │  └─ index.ts
│  └─ Dockerfile
│
├─ user-agent/              # Room processing & fit validation
│  ├─ src/
│  │  ├─ services/         # RoomProcessor, PlanGenerator
│  │  ├─ fit-checker/      # Furniture placement validation
│  │  └─ index.ts
│  └─ Dockerfile
│
├─ shared/                  # Common schemas & utilities
│  ├─ schemas/             # JSON schemas for all data contracts
│  ├─ fit-checker/         # Shared fit checking logic
│  └─ utils/               # Shared utilities
│
├─ frontend/                # User interfaces
│  ├─ nextjs-admin/        # Admin UI for partner management
│  └─ expo-app/            # React Native mobile app
│
├─ infra/                   # Infrastructure & deployment
│  ├─ docker-compose.yml   # Complete stack definition
│  ├─ migrations/          # Database schema
│  └─ .env.template        # Environment configuration
│
└─ .github/workflows/       # CI/CD pipeline
   └─ ci.yml               # Automated testing & deployment
```

## 🔧 Development

### Running Individual Services

```bash
# Designer Agent
cd designer-agent
npm install
npm run dev

# Data Agent  
cd data-agent
npm install
npm run dev

# User Agent
cd user-agent
npm install  
npm run dev
```

### Database Migrations

```bash
# Run migrations
docker exec -it room-postgres psql -U postgres -d roombox -f /docker-entrypoint-initdb.d/001_initial_schema.sql

# Access database
docker exec -it room-postgres psql -U postgres -d roombox
```

### Adding New Partner Connectors

1. Create connector in `data-agent/src/connectors/`
2. Implement the `PartnerConnector` interface
3. Add configuration to database via Admin UI
4. Test with `npm run test:connector`

Example connector structure:

```typescript
// data-agent/src/connectors/NewPartnerConnector.ts
export class NewPartnerConnector implements PartnerConnector {
  async fetchProducts(config: PartnerConfig): Promise<Product[]> {
    // Implementation
  }
  
  async normalizeProduct(rawProduct: any): Promise<Product> {
    // Implementation  
  }
}
```

## 🎨 Frontend Development

### Admin UI (Next.js)

```bash
cd frontend/nextjs-admin
npm install
npm run dev
# Access at http://localhost:3100
```

Features:
- Partner connector management
- Product catalog browsing
- Analytics dashboard
- User management

### Mobile App (React Native)

```bash
cd frontend/expo-app
npm install
npx expo start
```

Features:
- Room photo upload
- Style preference selection
- Shopping list generation
- 3D room visualization

## 🔍 Monitoring & Observability

### Grafana Dashboards

Access Grafana at http://localhost:3000 (admin/admin)

Pre-configured dashboards:
- **System Health**: Service uptime, response times
- **Business Metrics**: Requests processed, revenue generated  
- **AI Performance**: Model inference times, accuracy metrics
- **Partner APIs**: Rate limits, error rates

### Logs

```bash
# View service logs
docker logs room-designer-agent
docker logs room-data-agent  
docker logs room-user-agent

# Follow logs in real-time
docker logs -f room-designer-agent
```

### RabbitMQ Management

Access at http://localhost:15672 (admin/password)

Monitor:
- Message queues and throughput
- Consumer connections
- Exchange routing

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Test specific service
cd designer-agent && npm test
cd data-agent && npm test  
cd user-agent && npm test
```

### Integration Tests

```bash
# Full platform integration test
cd infra
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Load Testing

```bash
# Install k6
brew install k6

# Run load tests
k6 run tests/load/inspiration-generation.js
k6 run tests/load/room-processing.js
```

## 🚀 Deployment

### Local Production Simulation

```bash
cd infra
docker-compose -f docker-compose.prod.yml up --build
```

### AWS Deployment

1. **Setup ECS Cluster**:
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name room-production

# Create ECR repositories  
aws ecr create-repository --repository-name room-designer-agent
aws ecr create-repository --repository-name room-data-agent
aws ecr create-repository --repository-name room-user-agent
```

2. **Deploy with GitHub Actions**:
   - Push to `main` branch triggers production deployment
   - Push to `develop` branch triggers staging deployment
   - Requires AWS credentials in GitHub secrets

3. **Infrastructure as Code**:
```bash
# Deploy with Terraform (coming soon)
cd terraform
terraform init
terraform plan  
terraform apply
```

## 🔐 Security

### Environment Variables

Never commit sensitive data. Use:
- GitHub Secrets for CI/CD
- AWS Parameter Store for production
- Local `.env` files for development (gitignored)

### API Security

- JWT authentication for user endpoints
- API key validation for partner endpoints  
- Rate limiting on all public endpoints
- Input validation using JSON schemas

### Data Protection

- Vector embeddings are anonymized
- User data encrypted at rest
- GDPR compliance for EU users
- Regular security scans via GitHub Actions

## 📊 Partner Integrations

### Supported Partners

| Partner | API Type | Commission | Status |
|---------|----------|------------|--------|
| Amazon | Product Advertising API | 4.0% | ✅ Active |
| Wayfair | Commission Junction | 5.0% | ✅ Active |
| Home Depot | Direct API | 3.0% | 🔄 In Progress |
| Target | RedCircle API | 2.5% | 🔄 In Progress |
| IKEA | Web Scraping | 0.0% | 📋 Planned |

### Adding New Partners

1. **Create connector** in `data-agent/src/connectors/`
2. **Add to Admin UI** via partner management interface
3. **Configure mapping** for product normalization
4. **Test integration** with sample products
5. **Monitor performance** via Grafana dashboards

## 🎯 Success Metrics

### Platform KPIs

- **Designer Agent**: Generates valid inspiration spec + moodboard
- **Data Agent**: Ingests 100+ products from Amazon PA-API
- **User Agent**: Processes 20×30ft room → shopping list + 2D plan
- **Full Stack**: `docker-compose up --build` → all `/health` endpoints return 200

### Performance Targets

- Inspiration generation: < 30 seconds
- Room processing: < 2 minutes  
- Product search: < 500ms
- 99.9% uptime across all services

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`  
5. **Open** Pull Request

### Code Standards

- **TypeScript** for all services
- **ESLint + Prettier** for formatting
- **Jest** for unit tests
- **Conventional Commits** for git messages
- **JSDoc** for public APIs

### Pull Request Checklist

- [ ] Tests pass locally
- [ ] Docker builds successfully  
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Breaking changes noted

## 📚 API Documentation

### Designer Agent

#### `POST /api/inspiration/generate`
Generate inspiration specification from trends and user input.

**Request:**
```json
{
  "description": "Modern minimalist living room",
  "style_hints": ["scandinavian", "minimalist"],
  "sources": [
    {"type": "rss", "url": "https://example.com/feed"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Scandinavian Minimalist",
    "style_tags": ["scandinavian", "minimalist"],
    "palette": ["#ffffff", "#f5f5f5", "#e0e0e0"],
    "moodboard_url": "https://storage.example.com/moodboard.png"
  }
}
```

### Data Agent

#### `GET /api/partners`
List all partner integrations.

#### `POST /api/products/sync`
Trigger product synchronization from partners.

#### `GET /api/products/search`
Search products with vector similarity.

### User Agent

#### `POST /api/room/design`
Process complete room design request.

#### `POST /api/fit-check`
Validate furniture arrangement in room.

## 🐛 Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check Docker resources
docker system df
docker system prune

# Restart with fresh data
docker-compose down -v
docker-compose up --build
```

**Database connection errors:**
```bash
# Check PostgreSQL logs
docker logs room-postgres

# Manually run migrations
docker exec -it room-postgres psql -U postgres -d roombox -f /migrations/001_initial_schema.sql
```

**RabbitMQ connection issues:**
```bash
# Check RabbitMQ status
docker exec room-rabbitmq rabbitmqctl status

# Reset RabbitMQ
docker restart room-rabbitmq
```

**Vector search not working:**
```bash
# Verify pgvector extension
docker exec -it room-postgres psql -U postgres -d roombox -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### Getting Help

- 📧 **Email**: support@room-in-a-box.com
- 💬 **Discord**: https://discord.gg/room-in-a-box
- 🐛 **Issues**: https://github.com/org/room-in-a-box/issues
- 📖 **Docs**: https://docs.room-in-a-box.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 and embedding models
- pgvector team for PostgreSQL vector extensions  
- All partner retailers for API access
- Open source community for amazing tools

---

**Ready to revolutionize interior design? Let's build something amazing together!** 🚀✨
