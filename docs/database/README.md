# Database

Dokumen ERD, schema PostgreSQL, Prisma schema, dan catatan migration.

## Lokasi Utama

- Prisma schema: `apps/api/prisma/schema.prisma`
- Seed awal: `apps/api/prisma/seed/index.js`
- Constraint PostgreSQL tambahan: `apps/api/prisma/sql/postgresql-constraints.sql`

## Urutan Setup

1. Salin `.env.example` menjadi `.env`
2. Jalankan `pnpm install`
3. Jalankan `pnpm --filter @starlink-manager-pro/api prisma:format`
4. Jalankan `pnpm --filter @starlink-manager-pro/api prisma:validate`
5. Jalankan `pnpm --filter @starlink-manager-pro/api prisma:generate`
6. Jalankan `pnpm --filter @starlink-manager-pro/api prisma:migrate:dev --name init`
7. Terapkan constraint SQL tambahan bila diperlukan
8. Jalankan `pnpm --filter @starlink-manager-pro/api prisma:seed`

## Catatan Operasional

- File env utama tetap berada di root monorepo pada `.env`.
- Script Prisma di `apps/api` sudah dikonfigurasi untuk otomatis membaca env root tersebut, sehingga tidak perlu menduplikasi `.env` ke dalam `apps/api`.
