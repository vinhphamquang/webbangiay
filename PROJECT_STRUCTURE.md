# Cấu trúc dự án Adidas Shop

```
adidas-shop/
│
├── frontend/                    # Frontend - Giao diện người dùng
│   ├── css/                    # Stylesheets
│   │   ├── style.css          # Trang chủ (theme đen trắng)
│   │   ├── auth.css           # Đăng nhập/Đăng ký
│   │   ├── admin.css          # Trang quản trị
│   │   ├── checkout.css       # Trang thanh toán
│   │   ├── product-detail.css # Chi tiết sản phẩm
│   │   └── profile.css        # Hồ sơ cá nhân
│   │
│   ├── js/                     # JavaScript files
│   │   ├── api.js             # API client (fetch requests)
│   │   ├── app.js             # Trang chủ logic
│   │   ├── auth.js            # Xác thực (login/register)
│   │   ├── admin.js           # Quản trị logic
│   │   ├── checkout.js        # Thanh toán logic
│   │   ├── product-detail.js  # Chi tiết sản phẩm
│   │   └── profile.js         # Hồ sơ cá nhân
│   │
│   ├── index.html              # Trang chủ
│   ├── login.html              # Đăng nhập/Đăng ký
│   ├── admin.html              # Trang quản trị
│   ├── checkout.html           # Trang thanh toán
│   ├── product-detail.html     # Chi tiết sản phẩm
│   └── profile.html            # Hồ sơ cá nhân
│
├── backend/                     # Backend - API Server
│   ├── api/                    # API Routes
│   │   ├── server.js          # Main server (Express)
│   │   ├── auth.js            # Authentication API
│   │   ├── customer.js        # Customer API (orders, profile, reviews)
│   │   └── admin.js           # Admin API (products, orders, customers)
│   │
│   ├── config/                 # Configuration
│   │   └── database.js        # MySQL connection config
│   │
│   ├── database/               # Database scripts
│   │   ├── schema.sql         # Database schema (tables)
│   │   ├── seed.sql           # Sample data
│   │   └── setup.js           # Setup script (create DB + tables + data)
│   │
│   ├── postman/                # API Testing
│   │   └── Adidas_Shop_API.postman_collection.json
│   │
│   ├── .env                    # Environment variables (gitignored)
│   ├── .env.example            # Environment template
│   ├── .dockerignore           # Docker ignore file
│   ├── docker-compose.yml      # Docker compose config
│   ├── Dockerfile              # Docker image config
│   ├── nginx.conf              # Nginx config
│   ├── package.json            # NPM dependencies
│   └── POSTMAN_IMPORT_GUIDE.txt
│
├── .gitignore                   # Git ignore file
├── README.md                    # Tài liệu chính
├── QUICK_START.md              # Hướng dẫn khởi động nhanh
└── PROJECT_STRUCTURE.md        # File này

```

## Mô tả chi tiết

### Frontend
- **Pure HTML/CSS/JavaScript** - Không dùng framework
- **Theme đen trắng** - Phong cách chuyên nghiệp Adidas
- **Responsive design** - Tương thích mobile
- **6 trang chính**:
  1. Trang chủ (index.html) - Danh sách sản phẩm, giỏ hàng
  2. Đăng nhập (login.html) - Login/Register
  3. Admin (admin.html) - Quản lý toàn bộ hệ thống
  4. Thanh toán (checkout.html) - Xác nhận đơn hàng
  5. Chi tiết sản phẩm (product-detail.html) - Thông tin chi tiết
  6. Hồ sơ (profile.html) - Quản lý tài khoản, đơn hàng, đánh giá

### Backend
- **Node.js + Express.js** - RESTful API
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

### API Endpoints

#### Public
- GET /api/products - Danh sách sản phẩm
- GET /api/products/:id - Chi tiết sản phẩm
- GET /api/categories - Danh mục
- POST /api/auth/login - Đăng nhập
- POST /api/auth/register - Đăng ký

#### Customer (Requires JWT)
- GET /api/customer/profile - Thông tin cá nhân
- PUT /api/customer/profile - Cập nhật thông tin
- POST /api/customer/orders - Tạo đơn hàng
- GET /api/customer/orders - Đơn hàng của tôi
- POST /api/customer/reviews - Tạo đánh giá

#### Admin (Requires JWT + Admin role)
- GET /api/admin/dashboard - Thống kê
- POST /api/admin/products - Thêm sản phẩm
- PUT /api/admin/products/:id - Cập nhật sản phẩm
- DELETE /api/admin/products/:id - Xóa sản phẩm
- GET /api/admin/orders - Tất cả đơn hàng
- PUT /api/admin/orders/:id/status - Cập nhật trạng thái
- GET /api/admin/customers - Danh sách khách hàng

## Database Schema

### Tables
1. **categories** - Danh mục sản phẩm
2. **products** - Sản phẩm
3. **customers** - Khách hàng
4. **orders** - Đơn hàng
5. **order_items** - Chi tiết đơn hàng
6. **reviews** - Đánh giá sản phẩm
7. **cart** - Giỏ hàng

## Deployment

### Development
- Frontend: Live Server hoặc http-server
- Backend: npm start (port 3000)

### Production
- Docker: docker-compose up
- Nginx: Reverse proxy
- MySQL: Container hoặc external

## Security
- JWT tokens cho authentication
- Password hashing với bcryptjs
- SQL injection protection (prepared statements)
- CORS configuration
- Environment variables cho sensitive data
