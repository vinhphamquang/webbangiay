# Triển khai Quản lý Size và Màu sắc Sản phẩm

## Tổng quan
Thêm tính năng quản lý size và màu sắc với tồn kho riêng cho từng biến thể (variant).

## ✅ Đã hoàn thành:

### 1. Database Migration
- ✅ Tạo bảng `product_variants` với các cột:
  - `id`: Primary key
  - `product_id`: Foreign key đến products
  - `size`: Kích cỡ (38-45)
  - `color`: Tên màu
  - `color_code`: Mã màu hex
  - `stock`: Tồn kho riêng cho variant này
  
- ✅ Cập nhật bảng `cart`:
  - Thêm `variant_id`
  - Thêm `color`
  
- ✅ Cập nhật bảng `order_items`:
  - Thêm `variant_id`
  - Thêm `color`

- ✅ Migrate dữ liệu hiện tại:
  - Tạo 8 size (38-45) cho mỗi sản phẩm
  - Màu mặc định: Đen (#000000)
  - Chia đều stock hiện tại cho các size

### 2. Backend API
- ✅ Thêm endpoint `GET /api/products/:id/variants` - Lấy danh sách variants

## 🔄 Cần làm tiếp:

### 3. Admin API - Quản lý Variants
Cần thêm vào `backend/api/admin.js`:

```javascript
// GET /api/admin/products/:id/variants - Lấy variants của sản phẩm
// POST /api/admin/products/:id/variants - Tạo variant mới
// PUT /api/admin/products/:id/variants/:variantId - Cập nhật variant
// DELETE /api/admin/products/:id/variants/:variantId - Xóa variant
```

### 4. Admin Frontend - Quản lý Variants
Cần cập nhật `frontend/js/admin.js`:
- Modal sản phẩm hiển thị danh sách variants
- Form thêm/sửa variant (size, màu, mã màu, stock)
- Bảng hiển thị tất cả variants với stock
- Nút xóa variant

### 5. Customer API - Cập nhật Cart
Cần cập nhật `backend/api/customer.js`:
- POST `/api/customer/cart` - Nhận `variant_id` thay vì `size`
- Kiểm tra stock của variant trước khi thêm vào giỏ
- Cập nhật stock theo variant khi đặt hàng

### 6. Customer Frontend - Chọn Size và Màu
Cần cập nhật `frontend/js/app.js`:

**Trang chi tiết sản phẩm:**
- Load variants từ API
- Hiển thị dropdown/button chọn màu
- Hiển thị dropdown/button chọn size
- Size hết hàng (stock = 0):
  - Hiển thị màu xám
  - Disabled, không thể chọn
  - Hiển thị text "Hết hàng"
- Hiển thị stock còn lại của variant đã chọn
- Nút "Thêm vào giỏ" gửi `variant_id`

**Giỏ hàng:**
- Hiển thị màu sắc đã chọn
- Cho phép đổi size/màu (chọn variant khác)
- Kiểm tra stock khi thay đổi số lượng

### 7. Order Processing
Cần cập nhật `backend/api/admin.js`:
- Khi đơn hàng completed: Giảm stock của variant
- Khi đơn hàng cancelled: Hoàn lại stock của variant

## Cấu trúc dữ liệu:

### Product Variant Object:
```json
{
  "id": 1,
  "product_id": 5,
  "size": "42",
  "color": "Đen",
  "color_code": "#000000",
  "stock": 10
}
```

### Cart Item với Variant:
```json
{
  "id": 1,
  "customer_id": 1,
  "product_id": 5,
  "variant_id": 1,
  "size": "42",
  "color": "Đen",
  "quantity": 2
}
```

## UI/UX Design:

### Admin - Quản lý Variants:
```
[Sản phẩm: Adidas Ultraboost]

Variants:
┌─────────┬────────┬──────────┬─────────┬─────────┐
│ Size    │ Màu    │ Mã màu   │ Tồn kho │ Thao tác│
├─────────┼────────┼──────────┼─────────┼─────────┤
│ 38      │ Đen    │ #000000  │ 5       │ Sửa Xóa │
│ 39      │ Đen    │ #000000  │ 8       │ Sửa Xóa │
│ 40      │ Đỏ     │ #FF0000  │ 0       │ Sửa Xóa │
│ 42      │ Xanh   │ #0000FF  │ 12      │ Sửa Xóa │
└─────────┴────────┴──────────┴─────────┴─────────┘

[+ Thêm variant mới]
```

### Customer - Chọn Size và Màu:
```
[Hình ảnh sản phẩm]

Màu sắc:
[●Đen] [●Đỏ] [●Xanh]

Kích cỡ:
[38] [39] [40] [41] [42̶] [43] [44] [45]
           ↑ Hết hàng (màu xám, disabled)

Còn lại: 12 đôi

[Thêm vào giỏ hàng]
```

## Files cần cập nhật:

### Backend:
- ✅ `backend/database/add-product-variants.sql`
- ✅ `backend/database/run-variants-migration.js`
- ✅ `backend/database/migrate-existing-products.js`
- ✅ `backend/api/server.js` (thêm GET variants endpoint)
- ⏳ `backend/api/admin.js` (CRUD variants)
- ⏳ `backend/api/customer.js` (cart với variants)

### Frontend:
- ⏳ `frontend/js/admin.js` (quản lý variants)
- ⏳ `frontend/admin.html` (UI variants)
- ⏳ `frontend/js/app.js` (chọn size/màu)
- ⏳ `frontend/index.html` (UI chọn size/màu)
- ⏳ `frontend/css/style.css` (style cho variants)

## Lưu ý quan trọng:

1. **Backward Compatibility**: Cột `size` và `stock` cũ trong bảng `products` vẫn giữ nguyên để tương thích
2. **Stock Management**: Stock giờ quản lý ở level variant, không phải product
3. **Cart Migration**: Cart items hiện tại cần migrate sang sử dụng variant_id
4. **Order History**: Order items cũ vẫn hoạt động bình thường (variant_id có thể NULL)

## Bước tiếp theo:

1. Implement Admin CRUD API cho variants
2. Implement Admin UI để quản lý variants
3. Implement Customer API để xử lý cart với variants
4. Implement Customer UI để chọn size/màu
5. Test toàn bộ flow: Thêm variant → Chọn size/màu → Đặt hàng → Giảm stock
