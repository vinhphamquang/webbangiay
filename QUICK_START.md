# Hướng dẫn khởi động nhanh

## 1. Cài đặt Backend

```bash
cd backend
npm install
```

## 2. Cấu hình Database

Tạo file `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=adidas_shop
JWT_SECRET=adidas_secret_key_2026
PORT=3000
```

## 3. Khởi tạo Database

```bash
cd backend
node database/setup.js
```

## 4. Chạy Backend

```bash
cd backend
npm start
```

Backend chạy tại: http://localhost:3000

## 5. Chạy Frontend

### Cách 1: Dùng Live Server (VS Code)
- Mở thư mục `frontend`
- Click chuột phải vào `index.html`
- Chọn "Open with Live Server"

### Cách 2: Dùng http-server
```bash
cd frontend
npx http-server -p 8080
```

Frontend chạy tại: http://localhost:8080

## 6. Đăng nhập

### Admin
- URL: http://localhost:8080/admin.html
- Email: admin@adidas.com
- Password: admin123

### Customer
- URL: http://localhost:8080/login.html
- Email: customer@example.com
- Password: customer123

## 7. Test API với Postman

Import collection từ: `backend/postman/Adidas_Shop_API.postman_collection.json`

## Lưu ý

- Backend phải chạy trước khi sử dụng Frontend
- Đảm bảo MySQL đã được cài đặt và chạy
- Port 3000 (backend) và 8080 (frontend) phải available
