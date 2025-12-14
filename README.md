# Hệ thống cứu hộ xe (web app mobile)

## Chạy cách KHÔNG ảnh hưởng máy local (khuyên dùng)
Dùng Docker Compose để chạy toàn bộ (Mongo + API + Web) trong container.

```bash
cd rescue-system
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

docker compose -f docker-compose.dev.yml up --build
```

- Web: http://localhost:5173
- API: http://localhost:4000
- Mongo Express: http://localhost:8081

## Chạy local (nếu muốn)
```bash
cd rescue-system
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run dev
```

## Tài liệu usecase
- `docs/usecases.md` (kèm ảnh tổng quan & phân rã trong `assets/`)
