# STARLINK MANAGER PRO

Monorepo production-ready untuk sistem billing ISP modern berbasis:

- `Next.js` untuk frontend admin panel
- `NestJS` untuk backend API
- `BullMQ + Redis` untuk background job dan automation
- `PostgreSQL + Prisma` untuk database dan ORM
- `Docker + Nginx` untuk deployment

## Struktur Monorepo

```text
apps/
  web/       Frontend dashboard
  api/       Backend API utama
  worker/    Background job worker
packages/
  config/    Shared configuration dan constants
  database/  Shared database helpers
  types/     Shared TypeScript contracts
  utils/     Utility lintas aplikasi
  ui/        Shared UI components
  eslint-config/ Shared linting config
  tsconfig/  Shared TypeScript config
infra/
  docker/    Dockerfiles dan compose files
  nginx/     Reverse proxy config
  scripts/   Script deploy dan maintenance
  backups/   Database backup artifacts
docs/
  architecture/ Blueprint arsitektur
  api/         API contract
  database/    ERD, schema, migration notes
  deployment/  Deployment SOP
  business-flow/ Alur bisnis inti
```

## Quick Start

1. Salin `.env.example` menjadi `.env`
2. Install dependency:

```bash
pnpm install
```

3. Jalankan mode development:

```bash
pnpm dev
```

4. Generate Prisma client:

```bash
pnpm db:generate
```

## Catatan Migrasi

- File Apps Script lama tetap berada di root sebagai referensi migrasi.
- Struktur monorepo baru dibangun paralel agar proses perpindahan bertahap tetap aman.
- Fokus implementasi selanjutnya: `Auth`, `Customer`, `Package`, lalu `Payment`.
