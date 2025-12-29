# 🚗 Hệ thống Cứu Hộ Xe Trên Đường

Đây là **ứng dụng cứu hộ xe trên đường (mobile-first web application)**, giúp kết nối **người tham gia giao thông gặp sự cố** với **các công ty cung cấp dịch vụ cứu hộ** một cách nhanh chóng và hiệu quả.

Hệ thống cho phép:
- Khách hàng gửi yêu cầu cứu hộ khi xe gặp sự cố trên đường
- Công ty cứu hộ tiếp nhận và xử lý các yêu cầu
- Quản trị viên hệ thống quản lý và phê duyệt tài khoản công ty

Ứng dụng đã được cấu hình sẵn, **người sử dụng chỉ cần chỉnh sửa biến môi trường và chạy bằng Docker**.

---

## 🎯 Đối tượng sử dụng

- **Customer**: Người dùng cá nhân gặp sự cố xe trên đường
- **Company**: Công ty cung cấp dịch vụ cứu hộ
- **Admin**: Quản trị viên hệ thống

---

## 🧱 Công nghệ sử dụng

- Backend: Node.js + Express + MongoDB
- Frontend: React + Vite
- API Documentation: Swagger (OpenAPI)
- Triển khai & chạy hệ thống: **Docker Compose**

---

## ⚙️ Yêu cầu trước khi chạy

- Đã cài đặt:
  - Docker Desktop
- Có sẵn MongoDBCompass là một lợi thế :))) (để xem database trong lúc dùng á)

---

## 🔐 Cấu hình biến môi trường

### 1️⃣ Backend

Copy file biến môi trường mẫu:

```bash
cp apps/api/.env.example apps/api/.env
```

Mở file `apps/api/.env` và chỉnh tối thiểu các biến sau (t ghim trên nhóm á):

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=4000
```

> ⚠️ **Lưu ý:** Không commit file `.env` lên GitHub.

---

### 2️⃣ Frontend

Copy file biến môi trường mẫu:

```bash
cp apps/web/.env.example apps/web/.env
```

Nội dung cơ bản của file `apps/web/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

---

## ▶️ Chạy ứng dụng bằng Docker

Tại thư mục gốc của project, chạy lệnh sau (lần đầu thôi, mấy lần sau ae vào docker desktop bật cái container lên là được):

```bash
docker compose -f docker-compose.dev.yml up --build
```

Sau khi chạy thành công, hệ thống sẽ hoạt động tại:

- 🌐 Web app: http://localhost:5173
- 🔌 API server: http://localhost:4000
- 📘 Swagger API Docs: http://localhost:4000/docs

---

## 👤 Tài khoản dùng thử

### Customer
- **Email:** customer1@gmail.com  
- **Password:** 123456  

### Company
- **Email:** company1@gmail.com  
- **Password:** 123456  

### Admin
- **Email:** admin@rescue.local  
- **Password:** admin123  

> ⚠️ **Lưu ý về tài khoản Admin**  
> - Hiện **chưa có giao diện đăng nhập Admin**  
> - Tài khoản này dùng để test API duyệt company trên **Swagger** (`http://localhost:4000/docs`)  
>   hoặc test trực tiếp bằng **Postman**

> ⚠️ **Lưu ý khi đăng ký mới tài khoản Company**
> - Nếu chưa được admin duyệt mà đăng nhập thì không dùng được chức năng gì (có thể đăng nhập thử khi chưa được duyệt)
> - Khi được duyệt xong thì nhớ vào phần tài khoản (ở thanh điều hướng dưới hoặc logo góc trên bên phải) để đăng ký dịch vụ mà công ty cung cấp (trong danh sách các dịch vụ đã có)

> ⚠️ **Lưu ý khi nhập tọa độ** 
> - Cả khi đăng ký thông tin cho Company hay phần gửi yêu cầu của Customer đều chưa thể load bản đồ nên nhập tạm bằng tay nhé :))

