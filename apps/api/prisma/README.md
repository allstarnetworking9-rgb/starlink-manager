# Prisma Setup

Direktori ini berisi fondasi Prisma untuk `STARLINK MANAGER PRO`.

## Isi Utama

- `schema.prisma`
- `seed/index.js`
- `migrations/`

## Perintah Utama

```bash
cp .env.example .env
pnpm --filter @starlink-manager-pro/api prisma:format
pnpm --filter @starlink-manager-pro/api prisma:validate
pnpm --filter @starlink-manager-pro/api prisma:generate
pnpm --filter @starlink-manager-pro/api prisma:migrate:dev --name init
pnpm --filter @starlink-manager-pro/api prisma:seed
```

## Catatan Penting

- Semua script Prisma di `apps/api` otomatis membaca file env utama dari root monorepo: `/workspace/.env`.
- Schema memakai `gen_random_uuid()`, jadi PostgreSQL harus mengaktifkan extension `pgcrypto`.
- Beberapa constraint PostgreSQL production belum bisa dinyatakan penuh di Prisma dan harus ditambahkan lewat SQL manual setelah migration dibuat.
- Lihat file `sql/postgresql-constraints.sql` untuk constraint tambahan yang direkomendasikan.
