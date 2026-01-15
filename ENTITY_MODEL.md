# MÔ HÌNH THỰC THỂ (ENTITY-RELATIONSHIP MODEL)
## WEBSITE BÁN GIÀY ADIDAS

---

## 1. TỔNG QUAN

### 1.1. Mục đích
Tài liệu này mô tả chi tiết cấu trúc cơ sở dữ liệu của hệ thống Website Bán Giày Adidas, bao gồm các thực thể (entities), thuộc tính (attributes) và mối quan hệ (relationships) giữa chúng.

### 1.2. Hệ quản trị CSDL
- **DBMS**: MySQL 8.0+
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Database Name**: quanlyshopgiay

### 1.3. Danh sách các thực thể
1. **users** - Tài khoản người dùng
2. **customers** - Thông tin khách hàng
3. **categories** - Danh mục sản phẩm
4. **products** - Sản phẩm giày
5. **cart** - Giỏ hàng
6. **orders** - Đơn hàng
7. **order_items** - Chi tiết đơn hàng
8. **reviews** - Đánh giá sản phẩm
9. **contacts** - Liên hệ tư vấn

---

## 2. MÔ TẢ CHI TIẾT CÁC THỰC THỂ

### 2.1. USERS (Tài khoản người dùng)

**Mô tả**: Lưu trữ thông tin đăng nhập và phân quyền người dùng

**Thuộc tính**:

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Mã định danh duy nhất |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email đăng nhập |
| password | VARCHAR(255) | NOT NULL | Mật khẩu đã mã hóa (bcrypt) |
| role | ENUM('customer', 'admin') | DEFAULT 'customer' | Vai trò người dùng |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo tài khoản |

**Ràng buộc**:
- Email phải duy nhất trong hệ thống
- Password được mã hóa bằng bcrypt (10 rounds)
- Role mặc định là 'customer'

**Indexes**:
- PRIMARY KEY: id
- UNIQUE INDEX: email


---

### 2.2. CUSTOMERS (Khách hàng)

**Mô tả**: Lưu trữ thông tin chi tiết của khách hàng

**Thuộc tính**:

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Mã khách hàng |
| user_id | INT | UNIQUE, FOREIGN KEY | Liên kết với bảng users |
| name | VARCHAR(100) | NOT NULL | Họ và tên |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email liên hệ |
| phone | VARCHAR(20) | NULL | Số điện thoại |
| address | TEXT | NULL | Địa chỉ |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |

**Ràng buộc**:
- user_id phải duy nhất (1 user = 1 customer)
- email phải duy nhất
- Khi xóa user, customer cũng bị xóa (CASCADE)

**Indexes**:
- PRIMARY KEY: id
- UNIQUE INDEX: user_id, email
- FOREIGN KEY: user_id → users(id)

**Quan hệ**:
- 1-1 với **users**: Mỗi customer có 1 user account
- 1-N với **orders**: Một customer có nhiều đơn hàng
- 1-N với **cart**: Một customer có nhiều items trong giỏ
- 1-N với **reviews**: Một customer có nhiều đánh giá

---

### 2.3. CATEGORIES (Danh mục sản phẩm)

**Mô tả**: Phân loại các loại giày

**Thuộc tính**:

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Mã danh mục |
| name | VARCHAR(100) | NOT NULL | Tên danh mục |
| description | TEXT | NULL | Mô tả danh mục |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |

**Ví dụ dữ liệu**:
- Giày chạy bộ
- Giày bóng đá
- Giày lifestyle
- Giày bóng rổ

**Indexes**:
- PRIMARY KEY: id

**Quan hệ**:
- 1-N với **products**: Một danh mục có nhiều sản phẩm

---

### 2.4. PRODUCTS (Sản phẩm)

**Mô tả**: Lưu trữ thông tin sản phẩm giày

**Thuộc tính**:

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Mã sản phẩm |
| name | VARCHAR(200) | NOT NULL | Tên sản phẩm |
| price | DECIMAL(10, 2) | NOT NULL | Giá bán (VNĐ) |
| category_id | INT | FOREIGN KEY | Mã danh mục |
| image | VARCHAR(500) | NULL | Đường dẫn ảnh |
| description | TEXT | NULL | Mô tả chi tiết |
| stock | INT | DEFAULT 0 | Số lượng tồn kho |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Thời gian cập nhật |

**Ràng buộc**:
- price phải > 0
- stock phải >= 0
- Khi xóa category, category_id = NULL (SET NULL)

**Indexes**:
- PRIMARY KEY: id
- FOREIGN KEY: category_id → categories(id)
- INDEX: category_id (để tìm kiếm nhanh)

**Quan hệ**:
- N-1 với **categories**: Nhiều sản phẩm thuộc 1 danh mục
- 1-N với **cart**: Một sản phẩm có thể có trong nhiều giỏ hàng
- 1-N với **order_items**: Một sản phẩm có thể có trong nhiều đơn hàng
- 1-N với **reviews**: Một sản phẩm có nhiều đánh giá


---

### 2.5. CART (Giỏ hàng)

**Mô tả**: Lưu trữ sản phẩm trong giỏ hàng của khách hàng

**Thuộc tính**:

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Mã cart item |
| customer_id | INT | FOREIGN KEY, NOT NULL | Mã khách hàng |
| product_id | INT | FOREIGN KEY, NOT NULL | Mã sản phẩm |
| quantity | INT | NOT NULL, DEFAULT 1 | Số lượng |
| size | VARCHAR(10) | DEFAULT '42' | Size giày (38-45) |
| added_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian thêm |

**Ràng buộc**:
- quantity phải > 0
- Một customer + product + size = 1 cart item duy nhất
- Khi xóa customer hoặc product, cart item bị xóa (CASCADE)

**Indexes**:
- PRIMARY KEY: id
- UNIQUE INDEX: (customer_id, product_id, size)
- FOREIGN KEY: customer_id → customers(id)
- FOREIGN KEY: product_id → products(id)

**Quan hệ**:
- N-1 với **customers**: Nhiều cart items thuộc 1 customer
- N-1 với **products**: Nhiều cart items có thể cùng 1 product (khác size)

**Lưu ý đặc biệt**:
- Cùng sản phẩm nhưng khác size = cart item riêng biệt
- Giỏ hàng được xóa sau khi đặt hàng thành công

---

### 2.6. ORDERS (Đơn hàng)

**Mô tả**: Lưu trữ thông tin đơn hàng

**Thuộc tính**:

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Mã đơn hàng |
| customer_id | INT | FOREIGN KEY | Mã khách hàng |
| total_amount | DECIMAL(10, 2) | NOT NULL | Tổng tiền |
| status | ENUM | DEFAULT 'pending' | Trạng thái đơn hàng |
| payment_method | VARCHAR(50) | DEFAULT 'COD' | Phương thức thanh toán |
| order_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày đặt hàng |
| shipping_address | TEXT | NULL | Địa chỉ giao hàng |
| notes | TEXT | NULL | Ghi chú |

**Giá trị ENUM status**:
- `pending`: Chờ xử lý
- `processing`: Đang xử lý
- `completed`: Đã hoàn thành
- `cancelled`: Đã hủy

**Giá trị payment_method**:
- `COD`: Thanh toán khi nhận hàng
- `BANK`: Chuyển khoản ngân hàng
- `MOMO`: Ví điện tử MoMo

**Ràng buộc**:
- total_amount phải > 0
- Khi xóa customer, customer_id = NULL (SET NULL)

**Indexes**:
- PRIMARY KEY: id
- FOREIGN KEY: customer_id → customers(id)
- INDEX: customer_id, status, order_date

**Quan hệ**:
- N-1 với **customers**: Nhiều đơn hàng thuộc 1 customer
- 1-N với **order_items**: Một đơn hàng có nhiều sản phẩm
- 1-N với **reviews**: Một đơn hàng có nhiều đánh giá

**Quy tắc nghiệp vụ quan trọng**:
- Tồn kho CHỈ giảm khi status chuyển sang 'completed'
- Tồn kho được hoàn lại khi status chuyển từ 'completed' sang trạng thái khác


---

### 2.7. ORDER_ITEMS (Chi tiết đơn hàng)

**Mô tả**: Lưu trữ chi tiết sản phẩm trong đơn hàng

**Thuộc tính**:

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Mã chi tiết |
| order_id | INT | FOREIGN KEY, NOT NULL | Mã đơn hàng |
| product_id | INT | FOREIGN KEY | Mã sản phẩm |
| quantity | INT | NOT NULL | Số lượng |
| price | DECIMAL(10, 2) | NOT NULL | Giá tại thời điểm mua |
| size | VARCHAR(10) | DEFAULT '42' | Size giày |

**Ràng buộc**:
- quantity phải > 0
- price phải > 0
- Khi xóa order, order_items bị xóa (CASCADE)
- Khi xóa product, product_id = NULL (SET NULL)

**Indexes**:
- PRIMARY KEY: id
- FOREIGN KEY: order_id → orders(id)
- FOREIGN KEY: product_id → products(id)
- INDEX: order_id

**Quan hệ**:
- N-1 với **orders**: Nhiều items thuộc 1 đơn hàng
- N-1 với **products**: Nhiều items có thể cùng 1 product

**Lưu ý**:
- Lưu giá tại thời điểm mua (không thay đổi khi giá sản phẩm thay đổi)
- Lưu size để biết khách hàng đã mua size nào

---

### 2.8. REVIEWS (Đánh giá sản phẩm)

**Mô tả**: Lưu trữ đánh giá của khách hàng về sản phẩm

**Thuộc tính**:

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Mã đánh giá |
| product_id | INT | FOREIGN KEY, NOT NULL | Mã sản phẩm |
| customer_id | INT | FOREIGN KEY, NOT NULL | Mã khách hàng |
| order_id | INT | FOREIGN KEY, NOT NULL | Mã đơn hàng |
| rating | INT | CHECK (1-5) | Số sao đánh giá |
| comment | TEXT | NULL | Nội dung đánh giá |
| status | ENUM | DEFAULT 'pending' | Trạng thái duyệt |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian tạo |

**Giá trị ENUM status**:
- `pending`: Chờ duyệt
- `approved`: Đã duyệt (hiển thị công khai)
- `rejected`: Từ chối

**Ràng buộc**:
- rating từ 1 đến 5
- Một customer chỉ đánh giá 1 lần cho mỗi product trong mỗi order
- Khi xóa product/customer/order, review bị xóa (CASCADE)

**Indexes**:
- PRIMARY KEY: id
- UNIQUE INDEX: (order_id, product_id, customer_id)
- FOREIGN KEY: product_id → products(id)
- FOREIGN KEY: customer_id → customers(id)
- FOREIGN KEY: order_id → orders(id)

**Quan hệ**:
- N-1 với **products**: Nhiều đánh giá cho 1 sản phẩm
- N-1 với **customers**: Một customer có nhiều đánh giá
- N-1 với **orders**: Một đơn hàng có nhiều đánh giá

**Quy tắc nghiệp vụ**:
- Chỉ đánh giá sản phẩm từ đơn hàng đã hoàn thành (status = 'completed')
- Mỗi sản phẩm trong mỗi đơn chỉ đánh giá 1 lần

---

### 2.9. CONTACTS (Liên hệ tư vấn)

**Mô tả**: Lưu trữ yêu cầu liên hệ tư vấn từ khách hàng

**Thuộc tính**:

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Mã liên hệ |
| name | VARCHAR(100) | NOT NULL | Họ tên |
| email | VARCHAR(100) | NOT NULL | Email |
| phone | VARCHAR(20) | NULL | Số điện thoại |
| subject | VARCHAR(200) | NOT NULL | Chủ đề |
| message | TEXT | NOT NULL | Nội dung |
| status | ENUM | DEFAULT 'pending' | Trạng thái xử lý |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời gian gửi |

**Giá trị ENUM status**:
- `pending`: Chờ xử lý
- `processing`: Đang xử lý
- `completed`: Đã hoàn thành

**Giá trị subject**:
- Tư vấn sản phẩm
- Hỏi về đơn hàng
- Khiếu nại
- Góp ý
- Khác

**Indexes**:
- PRIMARY KEY: id
- INDEX: status, created_at

**Lưu ý**:
- Không có foreign key (khách chưa đăng nhập cũng có thể gửi)
- Khách đã đăng nhập sẽ tự động điền thông tin


---

## 3. BIỂU ĐỒ QUAN HỆ THỰC THỂ (ERD)

### 3.1. ERD Diagram (Text-based)

```
┌─────────────┐
│    USERS    │
├─────────────┤
│ PK id       │
│    email    │
│    password │
│    role     │
└──────┬──────┘
       │ 1
       │
       │ 1
┌──────▼──────────┐
│   CUSTOMERS     │
├─────────────────┤
│ PK id           │
│ FK user_id      │
│    name         │
│    email        │
│    phone        │
│    address      │
└────┬────────┬───┘
     │        │
     │ 1      │ 1
     │        │
     │ N      │ N
┌────▼────┐ ┌─▼──────────┐
│  CART   │ │   ORDERS   │
├─────────┤ ├────────────┤
│ PK id   │ │ PK id      │
│ FK cust │ │ FK cust_id │
│ FK prod │ │    total   │
│ quantity│ │    status  │
│ size    │ │    payment │
└────┬────┘ └─────┬──────┘
     │            │ 1
     │            │
     │ N          │ N
     │      ┌─────▼──────────┐
     │      │  ORDER_ITEMS   │
     │      ├────────────────┤
     │      │ PK id          │
     │      │ FK order_id    │
     │      │ FK product_id  │
     │      │    quantity    │
     │      │    price       │
     │      │    size        │
     │      └────────┬───────┘
     │               │
     │ N             │ N
┌────▼──────────────▼───┐
│      PRODUCTS         │
├───────────────────────┤
│ PK id                 │
│ FK category_id        │
│    name               │
│    price              │
│    image              │
│    description        │
│    stock              │
└───────┬───────────────┘
        │ N
        │
        │ 1
┌───────▼──────┐
│  CATEGORIES  │
├──────────────┤
│ PK id        │
│    name      │
│    desc      │
└──────────────┘

┌──────────────┐
│   REVIEWS    │
├──────────────┤
│ PK id        │
│ FK prod_id   │
│ FK cust_id   │
│ FK order_id  │
│    rating    │
│    comment   │
│    status    │
└──────────────┘

┌──────────────┐
│   CONTACTS   │
├──────────────┤
│ PK id        │
│    name      │
│    email     │
│    phone     │
│    subject   │
│    message   │
│    status    │
└──────────────┘
```


---

## 4. MỐI QUAN HỆ GIỮA CÁC THỰC THỂ

### 4.1. Bảng tổng hợp quan hệ

| Thực thể 1 | Quan hệ | Thực thể 2 | Loại | Mô tả |
|------------|---------|------------|------|-------|
| users | 1:1 | customers | Identifying | Mỗi user có 1 customer profile |
| customers | 1:N | orders | Non-identifying | Một customer có nhiều đơn hàng |
| customers | 1:N | cart | Identifying | Một customer có nhiều items trong giỏ |
| customers | 1:N | reviews | Non-identifying | Một customer có nhiều đánh giá |
| categories | 1:N | products | Non-identifying | Một danh mục có nhiều sản phẩm |
| products | 1:N | cart | Identifying | Một sản phẩm có thể trong nhiều giỏ |
| products | 1:N | order_items | Non-identifying | Một sản phẩm có thể trong nhiều đơn |
| products | 1:N | reviews | Identifying | Một sản phẩm có nhiều đánh giá |
| orders | 1:N | order_items | Identifying | Một đơn hàng có nhiều items |
| orders | 1:N | reviews | Non-identifying | Một đơn hàng có nhiều đánh giá |

### 4.2. Chi tiết các mối quan hệ

#### 4.2.1. users ↔ customers (1:1)
- **Loại**: Identifying relationship
- **Cardinality**: One-to-One
- **Foreign Key**: customers.user_id → users.id
- **Delete Rule**: CASCADE (xóa user → xóa customer)
- **Mô tả**: Mỗi tài khoản user có đúng 1 profile customer

#### 4.2.2. customers ↔ orders (1:N)
- **Loại**: Non-identifying relationship
- **Cardinality**: One-to-Many
- **Foreign Key**: orders.customer_id → customers.id
- **Delete Rule**: SET NULL (xóa customer → customer_id = NULL)
- **Mô tả**: Một khách hàng có thể đặt nhiều đơn hàng

#### 4.2.3. customers ↔ cart (1:N)
- **Loại**: Identifying relationship
- **Cardinality**: One-to-Many
- **Foreign Key**: cart.customer_id → customers.id
- **Delete Rule**: CASCADE (xóa customer → xóa cart)
- **Mô tả**: Một khách hàng có nhiều items trong giỏ hàng

#### 4.2.4. categories ↔ products (1:N)
- **Loại**: Non-identifying relationship
- **Cardinality**: One-to-Many
- **Foreign Key**: products.category_id → categories.id
- **Delete Rule**: SET NULL (xóa category → category_id = NULL)
- **Mô tả**: Một danh mục chứa nhiều sản phẩm

#### 4.2.5. products ↔ cart (1:N)
- **Loại**: Identifying relationship
- **Cardinality**: One-to-Many
- **Foreign Key**: cart.product_id → products.id
- **Delete Rule**: CASCADE (xóa product → xóa cart item)
- **Mô tả**: Một sản phẩm có thể có trong nhiều giỏ hàng
- **Lưu ý**: Cùng product + khác size = cart item khác nhau

#### 4.2.6. orders ↔ order_items (1:N)
- **Loại**: Identifying relationship
- **Cardinality**: One-to-Many
- **Foreign Key**: order_items.order_id → orders.id
- **Delete Rule**: CASCADE (xóa order → xóa order_items)
- **Mô tả**: Một đơn hàng chứa nhiều sản phẩm

#### 4.2.7. products ↔ order_items (1:N)
- **Loại**: Non-identifying relationship
- **Cardinality**: One-to-Many
- **Foreign Key**: order_items.product_id → products.id
- **Delete Rule**: SET NULL (xóa product → product_id = NULL)
- **Mô tả**: Một sản phẩm có thể xuất hiện trong nhiều đơn hàng

#### 4.2.8. products ↔ reviews (1:N)
- **Loại**: Identifying relationship
- **Cardinality**: One-to-Many
- **Foreign Key**: reviews.product_id → products.id
- **Delete Rule**: CASCADE (xóa product → xóa reviews)
- **Mô tả**: Một sản phẩm có nhiều đánh giá

#### 4.2.9. customers ↔ reviews (1:N)
- **Loại**: Non-identifying relationship
- **Cardinality**: One-to-Many
- **Foreign Key**: reviews.customer_id → customers.id
- **Delete Rule**: CASCADE (xóa customer → xóa reviews)
- **Mô tả**: Một khách hàng có thể viết nhiều đánh giá

#### 4.2.10. orders ↔ reviews (1:N)
- **Loại**: Non-identifying relationship
- **Cardinality**: One-to-Many
- **Foreign Key**: reviews.order_id → orders.id
- **Delete Rule**: CASCADE (xóa order → xóa reviews)
- **Mô tả**: Một đơn hàng có thể có nhiều đánh giá (mỗi sản phẩm 1 đánh giá)


---

## 5. RÀNG BUỘC TOÀN VẸN (INTEGRITY CONSTRAINTS)

### 5.1. Ràng buộc khóa chính (Primary Key Constraints)
- Tất cả các bảng đều có khóa chính `id` kiểu INT AUTO_INCREMENT
- Khóa chính đảm bảo tính duy nhất và không NULL

### 5.2. Ràng buộc khóa ngoại (Foreign Key Constraints)

| Bảng | Cột | Tham chiếu | ON DELETE | ON UPDATE |
|------|-----|------------|-----------|-----------|
| customers | user_id | users(id) | CASCADE | CASCADE |
| products | category_id | categories(id) | SET NULL | CASCADE |
| cart | customer_id | customers(id) | CASCADE | CASCADE |
| cart | product_id | products(id) | CASCADE | CASCADE |
| orders | customer_id | customers(id) | SET NULL | CASCADE |
| order_items | order_id | orders(id) | CASCADE | CASCADE |
| order_items | product_id | products(id) | SET NULL | CASCADE |
| reviews | product_id | products(id) | CASCADE | CASCADE |
| reviews | customer_id | customers(id) | CASCADE | CASCADE |
| reviews | order_id | orders(id) | CASCADE | CASCADE |

### 5.3. Ràng buộc duy nhất (Unique Constraints)
- `users.email`: Email đăng nhập phải duy nhất
- `customers.user_id`: Một user chỉ có một customer profile
- `customers.email`: Email khách hàng phải duy nhất
- `cart(customer_id, product_id, size)`: Một customer + product + size = 1 cart item
- `reviews(order_id, product_id, customer_id)`: Một sản phẩm trong một đơn chỉ đánh giá 1 lần

### 5.4. Ràng buộc kiểm tra (Check Constraints)
- `users.role`: Chỉ nhận giá trị 'customer' hoặc 'admin'
- `products.price`: Phải > 0
- `products.stock`: Phải >= 0
- `cart.quantity`: Phải > 0
- `orders.status`: Chỉ nhận 'pending', 'processing', 'completed', 'cancelled'
- `orders.total_amount`: Phải > 0
- `order_items.quantity`: Phải > 0
- `order_items.price`: Phải > 0
- `reviews.rating`: Phải từ 1 đến 5
- `reviews.status`: Chỉ nhận 'pending', 'approved', 'rejected'
- `contacts.status`: Chỉ nhận 'pending', 'processing', 'completed'

### 5.5. Ràng buộc NOT NULL
- Các trường bắt buộc phải có giá trị:
  - users: email, password
  - customers: name, email
  - categories: name
  - products: name, price
  - cart: customer_id, product_id, quantity
  - orders: total_amount
  - order_items: order_id, quantity, price
  - reviews: product_id, customer_id, order_id, rating
  - contacts: name, email, subject, message

### 5.6. Ràng buộc mặc định (Default Constraints)
- `users.role`: DEFAULT 'customer'
- `products.stock`: DEFAULT 0
- `cart.quantity`: DEFAULT 1
- `cart.size`: DEFAULT '42'
- `orders.status`: DEFAULT 'pending'
- `orders.payment_method`: DEFAULT 'COD'
- `order_items.size`: DEFAULT '42'
- `reviews.status`: DEFAULT 'pending'
- `contacts.status`: DEFAULT 'pending'
- Tất cả `created_at`: DEFAULT CURRENT_TIMESTAMP
- `products.updated_at`: ON UPDATE CURRENT_TIMESTAMP

---

## 6. INDEXES VÀ TỐI ƯU HÓA

### 6.1. Primary Indexes
Tất cả các bảng có PRIMARY KEY trên cột `id`

### 6.2. Unique Indexes
```sql
-- users
UNIQUE INDEX idx_users_email (email)

-- customers
UNIQUE INDEX idx_customers_user_id (user_id)
UNIQUE INDEX idx_customers_email (email)

-- cart
UNIQUE INDEX idx_cart_unique (customer_id, product_id, size)

-- reviews
UNIQUE INDEX idx_reviews_unique (order_id, product_id, customer_id)
```

### 6.3. Foreign Key Indexes
```sql
-- Tự động tạo bởi MySQL khi định nghĩa FOREIGN KEY
INDEX idx_customers_user_id (user_id)
INDEX idx_products_category_id (category_id)
INDEX idx_cart_customer_id (customer_id)
INDEX idx_cart_product_id (product_id)
INDEX idx_orders_customer_id (customer_id)
INDEX idx_order_items_order_id (order_id)
INDEX idx_order_items_product_id (product_id)
INDEX idx_reviews_product_id (product_id)
INDEX idx_reviews_customer_id (customer_id)
INDEX idx_reviews_order_id (order_id)
```

### 6.4. Composite Indexes (Đề xuất)
```sql
-- Tìm kiếm đơn hàng theo khách hàng và trạng thái
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- Tìm kiếm đơn hàng theo ngày
CREATE INDEX idx_orders_date ON orders(order_date DESC);

-- Tìm kiếm sản phẩm theo danh mục và tồn kho
CREATE INDEX idx_products_category_stock ON products(category_id, stock);

-- Tìm kiếm liên hệ theo trạng thái và ngày
CREATE INDEX idx_contacts_status_date ON contacts(status, created_at DESC);

-- Tìm kiếm đánh giá theo sản phẩm và trạng thái
CREATE INDEX idx_reviews_product_status ON reviews(product_id, status);
```


---

## 7. QUY TẮC NGHIỆP VỤ ĐẶC BIỆT

### 7.1. Quản lý tồn kho (Stock Management)

**Quy tắc quan trọng nhất**: Tồn kho CHỈ thay đổi khi đơn hàng chuyển trạng thái "completed"

#### Luồng xử lý:

1. **Khi khách hàng đặt hàng**:
   ```
   - Tạo order với status = 'pending'
   - Tạo order_items
   - Xóa cart
   - products.stock KHÔNG thay đổi
   ```

2. **Khi admin chuyển status → 'completed'**:
   ```sql
   -- Giảm tồn kho
   UPDATE products 
   SET stock = stock - order_items.quantity
   WHERE id = order_items.product_id
   ```

3. **Khi admin chuyển từ 'completed' → status khác**:
   ```sql
   -- Hoàn lại tồn kho
   UPDATE products 
   SET stock = stock + order_items.quantity
   WHERE id = order_items.product_id
   ```

4. **Khi admin chuyển giữa các status khác** (pending ↔ processing ↔ cancelled):
   ```
   - products.stock KHÔNG thay đổi
   ```

### 7.2. Quản lý giỏ hàng với Size

**Quy tắc**: Cùng sản phẩm nhưng khác size = cart item riêng biệt

#### Ví dụ:
```
Customer A thêm:
- Product #1, Size 42, Quantity 2 → cart_item #1
- Product #1, Size 43, Quantity 1 → cart_item #2
- Product #2, Size 42, Quantity 1 → cart_item #3

Tổng: 3 cart items
```

#### Xử lý khi thêm vào giỏ:
```sql
-- Kiểm tra đã tồn tại chưa
SELECT * FROM cart 
WHERE customer_id = ? 
  AND product_id = ? 
  AND size = ?

-- Nếu có: Cộng dồn quantity
UPDATE cart 
SET quantity = quantity + ?
WHERE id = ?

-- Nếu chưa: Thêm mới
INSERT INTO cart (customer_id, product_id, quantity, size)
VALUES (?, ?, ?, ?)
```

### 7.3. Quản lý đánh giá

**Quy tắc**: Chỉ đánh giá sản phẩm từ đơn hàng đã hoàn thành

#### Điều kiện đánh giá:
```sql
-- Kiểm tra đơn hàng đã hoàn thành
SELECT * FROM orders 
WHERE id = ? 
  AND customer_id = ? 
  AND status = 'completed'

-- Kiểm tra sản phẩm có trong đơn
SELECT * FROM order_items 
WHERE order_id = ? 
  AND product_id = ?

-- Kiểm tra chưa đánh giá
SELECT * FROM reviews 
WHERE order_id = ? 
  AND product_id = ? 
  AND customer_id = ?
```

### 7.4. Quản lý Admin

**Quy tắc**: Admin có thể sử dụng chức năng khách hàng

#### Khi admin đăng nhập:
```sql
-- Tạo cả userToken và adminToken
-- Tự động tạo customer profile nếu chưa có
INSERT INTO customers (user_id, name, email)
SELECT id, SUBSTRING_INDEX(email, '@', 1), email
FROM users
WHERE id = ? AND role = 'admin'
ON DUPLICATE KEY UPDATE user_id = user_id
```

#### Admin có thể:
- Xem và mua sản phẩm như khách hàng
- Thêm vào giỏ hàng
- Đặt hàng
- Đánh giá sản phẩm
- Đồng thời truy cập trang quản trị

---

## 8. TRIGGERS VÀ STORED PROCEDURES (Đề xuất)

### 8.1. Trigger: Cập nhật tồn kho khi thay đổi trạng thái đơn hàng

```sql
DELIMITER //

CREATE TRIGGER trg_order_status_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    -- Nếu chuyển sang completed: Giảm tồn kho
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE products p
        INNER JOIN order_items oi ON p.id = oi.product_id
        SET p.stock = p.stock - oi.quantity
        WHERE oi.order_id = NEW.id;
    END IF;
    
    -- Nếu chuyển từ completed sang khác: Hoàn lại tồn kho
    IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
        UPDATE products p
        INNER JOIN order_items oi ON p.id = oi.product_id
        SET p.stock = p.stock + oi.quantity
        WHERE oi.order_id = NEW.id;
    END IF;
END//

DELIMITER ;
```

### 8.2. Stored Procedure: Tính tổng doanh thu

```sql
DELIMITER //

CREATE PROCEDURE sp_calculate_revenue(
    IN start_date DATE,
    IN end_date DATE,
    OUT total_revenue DECIMAL(10,2)
)
BEGIN
    SELECT COALESCE(SUM(total_amount), 0)
    INTO total_revenue
    FROM orders
    WHERE status = 'completed'
      AND DATE(order_date) BETWEEN start_date AND end_date;
END//

DELIMITER ;
```

### 8.3. Stored Procedure: Lấy top sản phẩm bán chạy

```sql
DELIMITER //

CREATE PROCEDURE sp_get_top_products(
    IN limit_count INT
)
BEGIN
    SELECT 
        p.id,
        p.name,
        p.image,
        SUM(oi.quantity) as total_sold,
        COUNT(DISTINCT oi.order_id) as order_count
    FROM products p
    INNER JOIN order_items oi ON p.id = oi.product_id
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed'
    GROUP BY p.id, p.name, p.image
    ORDER BY total_sold DESC
    LIMIT limit_count;
END//

DELIMITER ;
```


---

## 9. VIEWS (Đề xuất)

### 9.1. View: Thông tin đầy đủ sản phẩm

```sql
CREATE VIEW vw_products_full AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.image,
    p.description,
    p.stock,
    c.id as category_id,
    c.name as category_name,
    c.description as category_description,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT r.id) as review_count,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 'approved'
GROUP BY p.id, p.name, p.price, p.image, p.description, p.stock, 
         c.id, c.name, c.description, p.created_at, p.updated_at;
```

### 9.2. View: Thống kê khách hàng

```sql
CREATE VIEW vw_customer_stats AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_spent,
    COUNT(DISTINCT r.id) as total_reviews,
    c.created_at as member_since
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
LEFT JOIN reviews r ON c.id = r.customer_id
GROUP BY c.id, c.name, c.email, c.phone, c.created_at;
```

### 9.3. View: Chi tiết đơn hàng đầy đủ

```sql
CREATE VIEW vw_order_details AS
SELECT 
    o.id as order_id,
    o.order_date,
    o.status,
    o.total_amount,
    o.payment_method,
    o.shipping_address,
    c.id as customer_id,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    oi.id as item_id,
    p.id as product_id,
    p.name as product_name,
    p.image as product_image,
    oi.quantity,
    oi.price,
    oi.size,
    (oi.quantity * oi.price) as item_total
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
INNER JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id;
```

---

## 10. DỮ LIỆU MẪU (SAMPLE DATA)

### 10.1. Categories
```sql
INSERT INTO categories (name, description) VALUES
('Giày chạy bộ', 'Giày chuyên dụng cho chạy bộ và tập luyện'),
('Giày bóng đá', 'Giày chuyên dụng cho bóng đá'),
('Giày lifestyle', 'Giày thời trang phong cách đường phố'),
('Giày bóng rổ', 'Giày chuyên dụng cho bóng rổ');
```

### 10.2. Users & Customers
```sql
-- Admin
INSERT INTO users (email, password, role) VALUES
('admin@adidas.com', '$2a$10$...', 'admin');

INSERT INTO customers (user_id, name, email) VALUES
(1, 'Admin', 'admin@adidas.com');

-- Customer
INSERT INTO users (email, password, role) VALUES
('customer@example.com', '$2a$10$...', 'customer');

INSERT INTO customers (user_id, name, email, phone, address) VALUES
(2, 'Nguyễn Văn A', 'customer@example.com', '0901234567', '123 Nguyễn Huệ, Q.1, TP.HCM');
```

### 10.3. Products
```sql
INSERT INTO products (name, price, category_id, image, description, stock) VALUES
('Adidas Ultraboost 22', 4500000, 1, '/uploads/ultraboost.jpg', 'Giày chạy bộ cao cấp', 50),
('Adidas Predator Edge', 3200000, 2, '/uploads/predator.jpg', 'Giày bóng đá chuyên nghiệp', 30),
('Adidas Stan Smith', 2500000, 3, '/uploads/stansmith.jpg', 'Giày lifestyle kinh điển', 100),
('Adidas Harden Vol. 7', 3800000, 4, '/uploads/harden.jpg', 'Giày bóng rổ hiệu suất cao', 40);
```

---

## 11. BACKUP VÀ RECOVERY

### 11.1. Backup Strategy
```bash
# Full backup hàng ngày
mysqldump -u root -p quanlyshopgiay > backup_$(date +%Y%m%d).sql

# Backup chỉ cấu trúc
mysqldump -u root -p --no-data quanlyshopgiay > schema_backup.sql

# Backup chỉ dữ liệu
mysqldump -u root -p --no-create-info quanlyshopgiay > data_backup.sql
```

### 11.2. Recovery
```bash
# Restore từ backup
mysql -u root -p quanlyshopgiay < backup_20260115.sql
```

---

## 12. BẢO MẬT VÀ PHÂN QUYỀN

### 12.1. User Roles trong Database
```sql
-- Tạo user cho application
CREATE USER 'adidas_app'@'localhost' IDENTIFIED BY 'secure_password';

-- Cấp quyền SELECT, INSERT, UPDATE, DELETE
GRANT SELECT, INSERT, UPDATE, DELETE ON quanlyshopgiay.* TO 'adidas_app'@'localhost';

-- Tạo user read-only cho reporting
CREATE USER 'adidas_readonly'@'localhost' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON quanlyshopgiay.* TO 'adidas_readonly'@'localhost';

FLUSH PRIVILEGES;
```

### 12.2. Bảo mật dữ liệu nhạy cảm
- **Password**: Mã hóa bằng bcrypt (10 rounds)
- **Email**: Unique constraint để tránh trùng lặp
- **Payment info**: KHÔNG lưu trữ thông tin thẻ tín dụng
- **Personal data**: Tuân thủ GDPR/PDPA

---

## 13. TỔNG KẾT

### 13.1. Thống kê Database

| Thông tin | Giá trị |
|-----------|---------|
| Tổng số bảng | 9 |
| Tổng số quan hệ | 10 |
| Tổng số foreign keys | 10 |
| Tổng số unique constraints | 5 |
| Tổng số indexes (đề xuất) | 20+ |

### 13.2. Đặc điểm nổi bật

1. **Chuẩn hóa**: Database được chuẩn hóa đến dạng 3NF
2. **Referential Integrity**: Đầy đủ foreign key constraints
3. **Tính toàn vẹn**: Check constraints và default values
4. **Hiệu suất**: Indexes được tối ưu cho các truy vấn thường dùng
5. **Mở rộng**: Dễ dàng thêm bảng mới (ví dụ: coupons, wishlists)
6. **Audit Trail**: Timestamps cho tất cả các bảng quan trọng

### 13.3. Khả năng mở rộng

Database có thể dễ dàng mở rộng với:
- Bảng `coupons` (mã giảm giá)
- Bảng `wishlists` (danh sách yêu thích)
- Bảng `notifications` (thông báo)
- Bảng `shipping_methods` (phương thức vận chuyển)
- Bảng `payment_transactions` (lịch sử giao dịch)
- Bảng `product_images` (nhiều ảnh cho 1 sản phẩm)
- Bảng `product_variants` (biến thể sản phẩm: màu sắc, kích cỡ)

---

**Tài liệu này mô tả đầy đủ mô hình thực thể của hệ thống Website Bán Giày Adidas**

*Phiên bản: 1.0*  
*Ngày cập nhật: Tháng 1, 2026*  
*Tác giả: Development Team*
