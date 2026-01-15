# 🧪 Test Giảm Stock Khi Hoàn Thành Đơn Hàng

## ✅ Đã cập nhật

### Database Migration:
- ✅ Thêm cột `variant_id` và `color` vào bảng `order_items`
- ✅ Thêm cột `variant_id` và `color` vào bảng `cart` (đã có từ trước)

### Backend API:
1. **backend/api/customer.js** - Checkout API:
   - ✅ Lưu `variant_id` và `color` vào `order_items`
   - ✅ Kiểm tra stock từ `product_variants` thay vì `products`
   - ✅ Hiển thị size và color trong chi tiết đơn hàng

2. **backend/api/admin.js** - Update Order Status:
   - ✅ Khi chuyển sang "completed": Giảm stock từ `product_variants.stock`
   - ✅ Khi chuyển từ "completed" về trạng thái khác: Hoàn lại stock
   - ✅ Hiển thị size và color trong chi tiết đơn hàng admin

## 🎯 Logic hoạt động

### Khi khách hàng đặt hàng:
1. Khách chọn sản phẩm, màu, size → Thêm vào giỏ (lưu `variant_id`)
2. Checkout → Tạo đơn hàng với status = "pending"
3. **Stock KHÔNG giảm** (chỉ kiểm tra còn hàng hay không)

### Khi admin xử lý đơn hàng:
1. Admin xem đơn hàng → Thấy đầy đủ thông tin (tên, màu, size)
2. Admin đổi status:
   - **pending → processing**: Stock không đổi
   - **processing → shipping**: Stock không đổi
   - **shipping → completed**: ✅ **Stock GIẢM** từ `product_variants`
   - **completed → cancelled**: ✅ **Stock TĂNG** (hoàn lại)

## 🧪 Cách test

### Bước 1: Kiểm tra stock ban đầu
```sql
-- Kết nối MySQL
mysql -u root -P 3307 -h localhost quanlyshopgiay

-- Xem stock của một variant cụ thể
SELECT * FROM product_variants WHERE product_id = 1 AND size = 42;
-- Giả sử: stock = 50
```

### Bước 2: Đặt hàng như khách hàng
1. Đăng nhập: `http://localhost:3001/login.html`
2. Vào sản phẩm: `http://localhost:3001/product-detail-new.html?id=1`
3. Chọn màu: Đen
4. Chọn size: 42
5. Số lượng: 3
6. Click "Thêm vào giỏ hàng"
7. Vào giỏ hàng → Checkout
8. Điền địa chỉ → Đặt hàng

### Bước 3: Kiểm tra stock sau khi đặt hàng
```sql
-- Stock vẫn = 50 (chưa giảm)
SELECT * FROM product_variants WHERE product_id = 1 AND size = 42;
```

### Bước 4: Admin xử lý đơn hàng
1. Đăng nhập admin: `http://localhost:3001/login.html`
   - Email: admin@adidas.com
   - Password: 123456
2. Vào trang admin: `http://localhost:3001/admin.html`
3. Tab "Đơn hàng" → Tìm đơn hàng vừa tạo
4. Click "Chi tiết" → Xem thông tin (phải có size và màu)
5. Đổi status: **pending → completed**

### Bước 5: Kiểm tra stock sau khi completed
```sql
-- Stock giờ = 47 (50 - 3)
SELECT * FROM product_variants WHERE product_id = 1 AND size = 42;
```

### Bước 6: Test hoàn lại stock
1. Admin đổi status: **completed → cancelled**
2. Kiểm tra stock:
```sql
-- Stock giờ = 50 (47 + 3, hoàn lại)
SELECT * FROM product_variants WHERE product_id = 1 AND size = 42;
```

## 📊 Kết quả mong đợi

### Checkout:
- ✅ Đơn hàng lưu đầy đủ: product_id, variant_id, color, quantity, price
- ✅ Stock không giảm ngay

### Admin xem đơn hàng:
- ✅ Hiển thị: Tên sản phẩm, Màu sắc, Size, Số lượng, Giá
- ✅ Ví dụ: "Adidas Ultraboost 21 - Đen - Size 42 - x3"

### Admin đổi status → completed:
- ✅ Stock giảm chính xác từ variant tương ứng
- ✅ Nếu đơn có nhiều items, mỗi item giảm stock riêng

### Admin đổi completed → cancelled:
- ✅ Stock được hoàn lại chính xác

## 🐛 Troubleshooting

### Nếu stock không giảm:
1. Kiểm tra `order_items` có `variant_id`:
```sql
SELECT * FROM order_items WHERE order_id = [ID_ĐƠN_HÀNG];
```

2. Kiểm tra log backend khi update status
3. Kiểm tra transaction có commit không

### Nếu stock giảm sai:
1. Kiểm tra quantity trong order_items
2. Kiểm tra variant_id có đúng không
3. Kiểm tra có nhiều lần update status không

## 📝 Notes

- Đơn hàng cũ (trước khi có variant_id) vẫn hoạt động (fallback về products.stock)
- Đơn hàng mới (có variant_id) sẽ giảm stock từ product_variants
- Stock chỉ giảm khi status = "completed", không giảm ở các status khác
- Có thể hoàn lại stock nếu admin đổi từ completed về trạng thái khác

## 🔧 Technical Details

### Order Items Structure:
```
order_items:
  - id
  - order_id
  - product_id
  - variant_id (NEW)
  - color (NEW)
  - quantity
  - price
```

### Stock Update Query:
```sql
-- Giảm stock
UPDATE product_variants 
SET stock = stock - [quantity] 
WHERE id = [variant_id];

-- Hoàn lại stock
UPDATE product_variants 
SET stock = stock + [quantity] 
WHERE id = [variant_id];
```
