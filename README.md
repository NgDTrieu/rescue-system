# Hệ thống cứu hộ xe (Web app mobile-first)

Nền tảng kết nối **Khách hàng** gặp sự cố với **Công ty cứu hộ**, có **Admin** quản trị & duyệt công ty.

## Tech Stack
- Backend: Node.js + Express + TypeScript + Mongoose (MongoDB Atlas)
- Frontend: React + Vite (mobile-first)
- Docs: Swagger/OpenAPI (`/docs`)
- Run (khuyên dùng): Docker Compose

---

## 1) Cấu trúc thư mục

rescue-system/
apps/
api/ # Backend (Express + TS + Mongoose)
src/
middlewares/ # authGuard, requireRole, requireCompanyActive...
modules/
auth/ # /auth/register, /auth/login, /auth/me
admin/ # /admin/... (duyệt công ty)
requests/ # nghiệp vụ yêu cầu cứu hộ (UC001, UC003, UC005...)
company/ # route cho công ty (ping, xử lý yêu cầu...)
users/ # user.model.ts
shared/ # db.ts, jwt.ts, password.ts, swagger.ts...
scripts/ # seedAdmin.ts...
web/ # Frontend (React + Vite)
src/
pages/
components/
routes/
services/ # gọi API (fetch/axios)
docs/
usecases.md
assets/
uctongquan.png
ucphanra.png
docker-compose.dev.yml

yaml
Copy code

---

## 2) Thiết lập môi trường (BẮT BUỘC)

### 2.1 Backend env
Copy file mẫu:
```bash
cp apps/api/.env.example apps/api/.env
Điền tối thiểu:

MONGO_URI (MongoDB Atlas)

JWT_SECRET

CORS_ORIGIN=http://localhost:5173

PORT=4000

2.2 Frontend env
bash
Copy code
cp apps/web/.env.example apps/web/.env
Điền:

VITE_API_URL=http://localhost:4000

VITE_SOCKET_URL=http://localhost:4000 (nếu dùng realtime)

Lưu ý: KHÔNG commit file .env. Chỉ commit .env.example.

3) Chạy dự án
3.1 Chạy bằng Docker (khuyên dùng)
bash
Copy code
docker compose -f docker-compose.dev.yml up --build
Web: http://localhost:5173

API: http://localhost:4000

Swagger docs: http://localhost:4000/docs

3.2 Seed Admin
bash
Copy code
docker compose -f docker-compose.dev.yml exec api npm run seed:admin
4) Backend guideline (cho người làm backend)
4.1 Thêm module API mới (quy ước)
Mỗi module nên có:

*.model.ts (Mongoose schema)

*.controller.ts (xử lý request)

*.routes.ts (định tuyến + middleware)

(tuỳ chọn) *.service.ts (nếu muốn tách nghiệp vụ)

Ví dụ thêm module requests:

apps/api/src/modules/requests/request.model.ts

apps/api/src/modules/requests/request.controller.ts

apps/api/src/modules/requests/request.routes.ts

Sau đó mount trong src/server.ts:

ts
Copy code
app.use("/requests", requestRoutes);
4.2 Middleware & phân quyền
authGuard: kiểm tra Bearer JWT

requireRole("CUSTOMER" | "COMPANY" | "ADMIN")

requireCompanyActive: COMPANY phải ACTIVE mới dùng nghiệp vụ chính

Gợi ý áp dụng:

API khách: authGuard + requireRole("CUSTOMER")

API công ty: authGuard + requireRole("COMPANY") + requireCompanyActive

API admin: authGuard + requireRole("ADMIN")

4.3 Swagger/OpenAPI docs
Swagger UI: GET /docs

JSON spec: GET /docs.json

Khi thêm endpoint mới:

Viết route

Thêm OpenAPI comment trong *.routes.ts

Tái sử dụng schema $ref trong components/schemas (xem src/shared/swagger.ts)

5) Frontend guideline (cho người làm frontend)
5.1 Chạy frontend (khi Docker đang chạy)
Vào http://localhost:5173

5.2 Gọi API
Sử dụng VITE_API_URL từ .env:

Ví dụ: fetch(${import.meta.env.VITE_API_URL}/auth/login, ...)

Khuyến nghị tạo lớp service:

apps/web/src/services/api.ts (axios/fetch wrapper)

Tách theo module: authApi.ts, requestApi.ts...

5.3 Auth flow cơ bản
POST /auth/login → nhận accessToken

Lưu token (localStorage hoặc state)

Gọi GET /auth/me để lấy profile

Khi gọi API cần auth → set header:
Authorization: Bearer <token>

5.4 Vai trò & trạng thái công ty
CUSTOMER: tạo yêu cầu cứu hộ

COMPANY:

Có thể login nhưng nếu companyStatus != ACTIVE thì bị chặn các nghiệp vụ chính

ADMIN: duyệt công ty qua /admin/...

6) Tài liệu Use Case
docs/usecases.md (kèm ảnh trong assets/)

less
Copy code

---

