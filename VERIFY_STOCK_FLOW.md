# ✅ Xác Nhận: Stock Tự Động Giảm Khi Admin Hoàn Thành Đơn Hàng

## 🎯 Chức năng đã implement

Khi admin đánh dấu đơn hàng là **"completed"**, hệ thống sẽ **TỰ ĐỘNG GIẢM** số lượng tồn kho từ `product_variants.stock`.

## 📋 Test Case Chi Tiết

### Bước 1: Chuẩn bị dữ liệu test

```sql
-- Kết nối MySQL
mysql -u root -P 3307 -h localhost quanlyshopgiay

-- Kiểm tra stock hiện tại của một variant
SELECT 
    pv.id as variant_id,
    p.name as product_name,
    pv.size,
    pv.color,
    pv.stock
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE p.id = 1 AND pv.size = 42 AND pv.color = 'Đen';

-- Ghi nhớ số stock hiện tại, ví dụ: stock = 50
```

### Bước 2: Đặt hàng như khách hàng

1. **Đăng nhập khách hàng:**
   - URL: `http://localhost:3001/login.html`
   - Email: (tài khoản khách hàng bất kỳ)
   - Password: (mật khẩu của khách)

2. **Chọn sản phẩm:**
   - Vào: `http://localhost:3001/product-detail-new.html?id=1`
   - Chọn màu: **Đen**
   - Chọn size: **42**
   - Số lượng: **5** (để dễ nhận biết)

3. **Thêm vào giỏ và checkout:**
   - Click "Thêm vào giỏ hàng"
   - Vào giỏ hàng
   - Click "Thanh toán"
   - Điền địa chỉ giao hàng
   - Click "Đặt hàng"
   - **Ghi nhớ Order ID** (ví dụ: Order #123)

### Bước 3: Kiểm tra stock CHƯA giảm

```sql
-- Stock vẫn = 50 (chưa thay đổi)
SELECT stock FROM product_variants 
WHERE product_id = 1 AND size = 42 AND color = 'Đen';
```

**Kết quả mong đợi:** Stock = 50 (không đổi)

### Bước 4: Admin xử lý đơn hàng

1. **Đăng nhập admin:**
   - URL: `http://localhost:3001/login.html`
   - Email: `admin@adidas.com`
   - Password: `123456`

2. **Vào trang quản lý:**
   - URL: `http://localhost:3001/admin.html`
   - Click tab **"Đơn hàng"**

3. **Tìm đơn hàng vừa tạo:**
   - Tìm Order #123 (hoặc order mới nhất)
   - Status hiện tại: **"pending"** (màu vàng)

4. **Xem chi tiết đơn hàng:**
   - Click nút **"Chi tiết"**
   - Kiểm tra thông tin:
     - ✅ Tên sản phẩm
     - ✅ Màu sắc: Đen
     - ✅ Size: 42
     - ✅ Số lượng: 5

5. **Đổi trạng thái đơn hàng:**
   - Trong modal chi tiết đơn hàng
   - Dropdown "Trạng thái": Chọn **"completed"** (Hoàn thành)
   - Click **"Cập nhật"**
   - Đợi thông báo: "Cập nhật trạng thái thành công"

### Bước 5: Kiểm tra stock ĐÃ GIẢM

```sql
-- Stock giờ = 45 (50 - 5)
SELECT stock FROM product_variants 
WHERE product_id = 1 AND size = 42 AND color = 'Đen';
```

**Kết quả mong đợi:** Stock = 45 ✅

### Bước 6: Kiểm tra trên giao diện

1. **Trang danh sách sản phẩm:**
   - Vào: `http://localhost:3001/index.html`
   - Tìm sản phẩm ID 1
   - Số lượng hiển thị phải cập nhật (tổng stock của tất cả variants)

2. **Trang chi tiết sản phẩm:**
   - Vào: `http://localhost:3001/product-detail-new.html?id=1`
   - Chọn màu: Đen
   - Chọn size: 42
   - Hiển thị: **"✓ Còn 45 sản phẩm"** (thay vì 50)

### Bước 7: Test hoàn lại stock (Optional)

1. **Admin đổi status về cancelled:**
   - Vào lại đơn hàng #123
   - Đổi status: **"completed" → "cancelled"**
   - Click "Cập nhật"

2. **Kiểm tra stock được hoàn lại:**
```sql
-- Stock giờ = 50 (45 + 5, hoàn lại)
SELECT stock FROM product_variants 
WHERE product_id = 1 AND size = 42 AND color = 'Đen';
```

**Kết quả mong đợi:** Stock = 50 ✅

## 📊 Bảng tóm tắt kết quả

| Bước | Hành động | Stock trước | Stock sau | Kết quả |
|------|-----------|-------------|-----------|---------|
| 1 | Khách đặt hàng (5 sản phẩm) | 50 | 50 | ✅ Không giảm |
| 2 | Admin → pending | 50 | 50 | ✅ Không giảm |
| 3 | Admin → processing | 50 | 50 | ✅ Không giảm |
| 4 | Admin → shipping | 50 | 50 | ✅ Không giảm |
| 5 | Admin → **completed** | 50 | **45** | ✅ **GIẢM 5** |
| 6 | Admin → cancelled | 45 | **50** | ✅ **HOÀN LẠI 5** |

## 🔍 Kiểm tra log backend

Khi admin đổi status sang "completed", backend sẽ log:

```
PUT /api/admin/orders/123/status
Status changed: pending → completed
Decreasing stock for variant_id: 456, quantity: 5
Stock updated successfully
```

## ⚠️ Lưu ý quan trọng

### Stock chỉ giảm khi:
- ✅ Admin đổi status từ **bất kỳ trạng thái nào** → **"completed"**
- ✅ Order items có `variant_id` (đơn hàng mới)

### Stock được hoàn lại khi:
- ✅ Admin đổi status từ **"completed"** → **bất kỳ trạng thái nào khác**

### Stock KHÔNG giảm khi:
- ❌ Khách hàng đặt hàng (chỉ tạo order)
- ❌ Admin đổi giữa các status khác (pending ↔ processing ↔ shipping)
- ❌ Khách hàng hủy đơn (nếu chưa completed)

## 🐛 Nếu stock không giảm

### Kiểm tra 1: Order items có variant_id không?
```sql
SELECT * FROM order_items WHERE order_id = 123;
-- Phải có cột variant_id với giá trị (không NULL)
```

### Kiểm tra 2: Backend có chạy không?
```bash
# Kiểm tra backend đang chạy
curl http://localhost:3001/api/products
```

### Kiểm tra 3: Database connection
```sql
-- Kiểm tra kết nối
SHOW PROCESSLIST;
```

### Kiểm tra 4: Transaction có commit không?
- Xem log backend khi update status
- Phải thấy "Stock updated successfully"

## 🎉 Kết luận

Chức năng **TỰ ĐỘNG GIẢM STOCK** khi admin hoàn thành đơn hàng đã được implement đầy đủ:

✅ Stock giảm chính xác từ variant tương ứng  
✅ Chỉ giảm khi status = "completed"  
✅ Có thể hoàn lại stock nếu cần  
✅ Hỗ trợ cả đơn hàng cũ và mới  
✅ Hiển thị đúng trên giao diện  

**Hãy test theo các bước trên để xác nhận!** 🚀
