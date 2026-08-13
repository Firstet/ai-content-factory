# AI Content Factory — Production AI Content Operating System

AI Content Factory is a production-ready, self-hosted SaaS platform that automatically researches topics, writes scripts, fact-checks content, optimizes SEO, generates voice narration, creates AI scenes/images, renders high-definition MP4 videos using FFmpeg, generates thumbnails, publishes across social channels (YouTube, TikTok, Instagram, Facebook, X, LinkedIn), and syncs analytics.

---

## Key Features

- **Multi-Provider AI Abstraction Layer**: Pluggable support for OpenAI, Google Gemini, Anthropic Claude, OpenRouter, NVIDIA NIM, and Ollama (self-hosted). Never locked into one vendor.
- **AES-256-GCM Encrypted Key Vault**: Stored API keys and OAuth tokens are encrypted at rest with unique IVs.
- **13-Step BullMQ Asynchronous Pipeline**: Independent worker queues with automatic exponential backoff retries and real-time WebSocket progress streaming.
- **Dual Video Generation Strategies**:
  - **Strategy A (Default)**: Script → TTS Voice → AI Images → Ken Burns Motion Effects → FFmpeg MP4 Assembly. Zero external video rendering costs.
  - **Strategy B**: Pluggable AI Video Provider APIs (Runway/Kling/Pika).
- **Super Admin Operating System**: Comprehensive dashboard covering Users, Roles, Brands, Channels, Prompts, AI Providers, API Keys, Queues, Analytics, Publishing, Storage (MinIO), System Logs, Billing Infrastructure, and Settings.
- **Production-Ready & Fully Dockerized**: Single command deployment via Docker Compose with PostgreSQL, Redis, MinIO, NestJS API, Next.js 15 Web, BullMQ Workers, and Nginx reverse proxy.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts, Socket.io-client.
- **Backend**: NestJS, TypeScript, PostgreSQL, Prisma ORM, Redis, BullMQ, Passport JWT, Socket.io.
- **Storage**: MinIO (S3 Compatible Object Storage).
- **Video Rendering**: FFmpeg, `fluent-ffmpeg`.
- **Infrastructure**: Docker, Docker Compose, Nginx (Reverse Proxy & Rate Limiter).

---

## Quick Start (Local Development)

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker Desktop

### 1. Clone & Install Dependencies

```bash
cd "/Users/kelvinfirste/Desktop/Youtube AI Auto"
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Open `.env` and configure your secret keys (`JWT_SECRET`, `ENCRYPTION_SECRET`, `SUPER_ADMIN_PASSWORD`).

### 3. Launch Databases & Storage via Docker

```bash
docker compose up postgres redis minio minio-init -d
```

### 4. Database Setup & Seeding

```bash
# Push Prisma schema to PostgreSQL
pnpm db:migrate

# Seed Super Admin user, 6 AI providers, and default prompt templates
pnpm db:seed
```

### 5. Run API & Web in Development Mode

```bash
pnpm dev
```

- **Next.js Web**: `http://localhost:3000`
- **NestJS API**: `http://localhost:3001/api`
- **Swagger Docs**: `http://localhost:3001/api/docs`
- **MinIO Console**: `http://localhost:9001` (User: `acf_minio_access`, Pass: `acf_minio_secret`)

---

## Super Admin Access

Default login credentials (configured via `.env`):
- **Email**: `admin@aicontentfactory.local`
- **Password**: `ChangeMe!2024`

---

## Docker Compose Full Production Start

To build and launch the entire production stack (including Nginx reverse proxy and all 8 BullMQ pipeline workers) in detached mode:

```bash
docker compose up --build -d
```

Check container health:

```bash
docker compose ps
```

View live logs across all services:

```bash
docker compose logs -f
```

---

## License

Private / Proprietary Enterprise License.
