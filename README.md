# Room-in-a-Box Monorepo

This repository bootstraps a multi-agent  Room-in-a-Box  interior-design platform.

## Getting Started (Local Development)

Prerequisites:
- Docker & Docker Compose
- Node 18+

1. Copy `.env.template` to `.env` and fill in secrets.
2. Build and start services:

```bash
docker compose -f infra/docker-compose.yml up --build
```

3. Health checks:

```bash
curl http://localhost:4001/health   # designer-agent
curl http://localhost:4002/health   # data-agent
curl http://localhost:4003/health   # user-agent
```

Each should respond `{ "status": "ok" }`.

## Directory Map

- `designer-agent/` &mdash; Generates style inspiration specs.
- `data-agent/` &mdash; Normalises partner product feeds.
- `user-agent/` &mdash; Creates dimension-correct shopping lists.
- `shared/` &mdash; Schemas, utilities, fit checker.
- `infra/` &mdash; Docker Compose & migrations.
- `frontend/` &mdash; React Native app & Next.js admin dashboard.

## Deployment

The front-end is intended to be deployed to Vercel / Expo. Agents run on Render, AWS Amplify, or Supabase.

## Contributing

Use conventional commits. Run `pnpm lint` and ensure all `/health` endpoints are green before opening a PR.
