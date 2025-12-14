# REQUIREMENTS

Với NodeJS/React:
- File khai báo dependency chính là **package.json**.
- Để cài đặt “không ảnh hưởng máy local”, cách tương đương `venv` tốt nhất là **Docker** (hoặc Dev Container).

## Backend requirement
- File: `apps/api/package.json`
- Node.js >= 20
- ENV: xem `apps/api/.env.example`

## Frontend requirement
- File: `apps/web/package.json`
- Node.js >= 20
- ENV: xem `apps/web/.env.example`

## Cách chạy hoàn toàn trong container (không cài Node trên máy)
- Dùng `docker-compose.dev.yml` ở root.
- Nếu bạn dùng VS Code: mở folder và dùng Dev Containers (đã có `.devcontainer/devcontainer.json`).
