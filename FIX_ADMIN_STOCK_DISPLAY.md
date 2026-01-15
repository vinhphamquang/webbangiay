# ✅ Fix: Hiển Thị Stock Trong Trang Admin

## 🐛 Vấn đề

Khi admin hoàn thành đơn hàng, stock trong database đã giảm đúng, nhưng **trang quản lý sản phẩm của admin không cập nhật số lượng**.

## 🔧 Nguyên nhân

1. **Backend API** `/api/admin/products` đang lấy stock từ cột `products.stock` (cột cũ)
2. Nhưng hệ thống đang dùng `product_variants.stock` (cột mới)
3. Frontend không reload products sau khi update order status

## ✅ Đã sửa

### 1. Backend API (backend/api/admin.js)

**Trước:**
```javascript
SELECT p.*, c.name as category_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id
```

**Sau:**
```javascript
SELECT 
    p.*, 
    c.name as category_name,
    COALESCE(SUM(pv.stock), 0) as total_stock
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id
```

→ Giờ API tính **tổng stock từ tất cả variants** của sản phẩm

### 2. Frontend Admin (frontend/js/admin.js)

Thêm logic reload products sau khi update order status thành "completed"

## 🧪 Test Case

### Bước 1: Kiểm tra stock ban đầu

1. **Đăng nhập admin:**
   - URL: `http://localhost:3001/login.html`
   - Email: `admin@adidas.com`
   - Password: `123456`

2. **Vào tab "Sản phẩm":**
   - Tìm sản phẩm ID 1
   - Ghi nhớ số lượng hiện tại (ví dụ: 400)

3. **Kiểm tra trong database:**
```sql
-- Tổng stock của tất cả variants
SELECT 
    p.id,
    p.name,
    SUM(pv.stock) as total_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.id = 1
GROUP BY p.id;
```

### Bước 2: Tạo đơn hàng

1. **Đăng xuất admin, đăng nhập khách hàng**
2. **Đặt hàng:**
   - Sản phẩm ID 1
   - Màu: Đen
   - Size: 42
   - Số lượng: 10

### Bước 3: Admin hoàn thành đơn hàng

1. **Đăng nhập lại admin**
2. **Tab "Đơn hàng":**
   - Tìm đơn hàng vừa tạo
   - Đổi status: **pending → completed**
   - Thấy alert: "Cập nhật trạng thái thành công"

### Bước 4: Kiểm tra stock đã cập nhật

**Cách 1: Reload trang**
1. Refresh trang admin (F5)
2. Vào tab "Sản phẩm"
3. Kiểm tra sản phẩm ID 1
4. **Kết quả:** Stock = 390 (400 - 10) ✅

**Cách 2: Chuyển tab**
1. Không reload trang
2. Click tab "Sản phẩm"
3. Kiểm tra sản phẩm ID 1
4. **Kết quả:** Stock = 390 ✅

**Cách 3: Kiểm tra database**
```sql
SELECT 
    p.id,
    p.name,
    SUM(pv.stock) as total_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.id = 1
GROUP BY p.id;
-- Kết quả: total_stock = 390
```

## 📊 So sánh trước và sau

| Thời điểm | Database Stock | Admin hiển thị (Trước) | Admin hiển thị (Sau) |
|-----------|----------------|------------------------|----------------------|
| Ban đầu | 400 | 400 | 400 |
| Sau đặt hàng | 400 | 400 | 400 |
| Sau completed | 390 | ❌ 400 (không đổi) | ✅ 390 (đã cập nhật) |

## 🎯 Kết quả

### ✅ Đã fix:
1. API admin/products giờ tính tổng stock từ variants
2. Stock hiển thị đúng trong trang quản lý sản phẩm
3. Stock tự động cập nhật khi:
   - Reload trang
   - Chuyển tab Products
   - (Optional) Ngay sau khi update order status

### ✅ Các tính năng hoạt động:
- Trang danh sách sản phẩm (customer): Hiển thị tổng stock ✅
- Trang chi tiết sản phẩm (customer): Hiển thị stock từng variant ✅
- Trang admin sản phẩm: Hiển thị tổng stock ✅
- Trang admin variants: Hiển thị stock từng variant ✅

## 🔍 Kiểm tra thêm

### Test với nhiều variants:
```sql
-- Xem chi tiết stock của từng variant
SELECT 
    p.name,
    pv.size,
    pv.color,
    pv.stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.id = 1
ORDER BY pv.size;

-- Tổng stock
SELECT SUM(stock) as total FROM product_variants WHERE product_id = 1;
```

### Test với sản phẩm không có variants:
- Sản phẩm cũ (chưa có variants): stock = 0
- Cần migrate để tạo variants cho sản phẩm cũ

## 📝 Lưu ý

- Stock trong bảng `products` không còn được sử dụng
- Tất cả stock giờ quản lý qua `product_variants`
- Mỗi sản phẩm có nhiều variants (size + color)
- Tổng stock = SUM(tất cả variants.stock)
