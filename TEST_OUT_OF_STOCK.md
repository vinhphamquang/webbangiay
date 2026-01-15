# 🧪 Test Chức Năng Hiển Thị Hết Hàng

## ✅ Đã cập nhật

### Backend:
- **backend/api/server.js** - API `/api/products` giờ tính tổng stock từ `product_variants` thay vì dùng cột `stock` cũ

### Frontend:
- **frontend/js/app.js** - Hiển thị badge "HẾT HÀNG" trên card sản phẩm
- **frontend/js/product-detail-new.js** - Hiển thị banner hết hàng và disable buttons
- **frontend/css/style.css** - Thêm styles cho out-of-stock

## 🎯 Tính năng mới

### 1. Trang danh sách sản phẩm (index.html)

#### Khi sản phẩm còn hàng:
- ✅ Hiển thị "✓ Còn lại: X đôi" (màu xanh)
- ✅ Card có thể click
- ✅ Button "Xem chi tiết" hoạt động bình thường

#### Khi sản phẩm hết hàng (tất cả variants stock = 0):
- ❌ Badge "HẾT HÀNG" màu đỏ ở góc trên bên phải
- ❌ Hiển thị "❌ Hết hàng" (màu đỏ)
- ❌ Card có opacity 0.7, màu xám
- ❌ Hình ảnh có filter grayscale
- ❌ Card không thể click
- ❌ Button "Hết hàng" bị disabled

### 2. Trang chi tiết sản phẩm (product-detail-new.html)

#### Khi sản phẩm còn hàng:
- ✅ Hiển thị bình thường
- ✅ Có thể chọn màu và size
- ✅ Buttons "Thêm vào giỏ hàng" và "Mua ngay" hoạt động

#### Khi sản phẩm hết hàng (tất cả variants stock = 0):
- ❌ Banner đỏ to: "❌ SẢN PHẨM NÀY HIỆN ĐÃ HẾT HÀNG"
- ❌ Tất cả size buttons hiển thị "Hết" và disabled
- ❌ Button "Thêm vào giỏ hàng" → "❌ Hết hàng" (disabled)
- ❌ Button "Mua ngay" → "❌ Hết hàng" (disabled)

## 🧪 Cách test

### Bước 1: Tạo sản phẩm hết hàng
```sql
-- Kết nối MySQL
mysql -u root -P 3307 -h localhost

-- Chọn database
USE adidas_shop;

-- Xem tất cả variants của sản phẩm ID 1
SELECT * FROM product_variants WHERE product_id = 1;

-- Set tất cả variants của sản phẩm ID 1 về stock = 0
UPDATE product_variants SET stock = 0 WHERE product_id = 1;

-- Kiểm tra lại
SELECT * FROM product_variants WHERE product_id = 1;
```

### Bước 2: Test trang danh sách
1. Mở `http://localhost:3001/index.html`
2. Scroll xuống phần "Sản phẩm nổi bật"
3. Tìm sản phẩm ID 1 (đã set stock = 0)
4. Kiểm tra:
   - [ ] Badge "HẾT HÀNG" màu đỏ hiển thị
   - [ ] Text "❌ Hết hàng" màu đỏ
   - [ ] Card có màu xám, opacity thấp
   - [ ] Hình ảnh có filter grayscale
   - [ ] Click vào card không có phản ứng
   - [ ] Button "Hết hàng" bị disabled

### Bước 3: Test trang chi tiết
1. Thử truy cập trực tiếp: `http://localhost:3001/product-detail-new.html?id=1`
2. Kiểm tra:
   - [ ] Banner đỏ "SẢN PHẨM NÀY HIỆN ĐÃ HẾT HÀNG" hiển thị
   - [ ] Tất cả size buttons có label "Hết" và disabled
   - [ ] Button "Thêm vào giỏ hàng" → "❌ Hết hàng" (disabled, opacity 0.5)
   - [ ] Button "Mua ngay" → "❌ Hết hàng" (disabled, opacity 0.5)
   - [ ] Không thể click vào các buttons

### Bước 4: Test sản phẩm một phần hết hàng
```sql
-- Set một số size hết hàng, một số còn
UPDATE product_variants SET stock = 0 WHERE product_id = 2 AND size IN (38, 39, 40);
UPDATE product_variants SET stock = 10 WHERE product_id = 2 AND size IN (41, 42, 43, 44, 45);
```

1. Mở sản phẩm ID 2
2. Kiểm tra:
   - [ ] Trang danh sách: Sản phẩm vẫn hiển thị bình thường (vì còn một số size)
   - [ ] Trang chi tiết: Size 38, 39, 40 có label "Hết" và disabled
   - [ ] Trang chi tiết: Size 41-45 vẫn chọn được bình thường
   - [ ] Buttons vẫn hoạt động (vì còn size available)

### Bước 5: Khôi phục stock
```sql
-- Khôi phục stock cho test tiếp
UPDATE product_variants SET stock = 50 WHERE product_id = 1;
UPDATE product_variants SET stock = 50 WHERE product_id = 2;
```

## 📊 Kết quả mong đợi

### Trang danh sách:
- Sản phẩm hết hàng dễ nhận biết với badge đỏ
- Không thể click vào sản phẩm hết hàng
- UI rõ ràng, không gây nhầm lẫn

### Trang chi tiết:
- Banner cảnh báo rõ ràng khi sản phẩm hết hàng
- Tất cả actions bị disable
- Size hết hàng hiển thị rõ ràng

## 🎨 UI/UX

### Colors:
- **Hết hàng**: #f44336 (đỏ)
- **Còn hàng**: #4CAF50 (xanh lá)
- **Sắp hết**: #FF9800 (cam)

### Effects:
- Out of stock card: opacity 0.7, grayscale filter
- Badge: box-shadow cho nổi bật
- Disabled buttons: opacity 0.5, cursor not-allowed

## 🔧 Technical Details

### API Changes:
```sql
-- Query mới tính tổng stock từ variants
SELECT 
    p.*, 
    c.name as category_name,
    COALESCE(SUM(pv.stock), 0) as total_stock
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id
```

### Logic:
- `product.stock = 0` → Sản phẩm hết hàng hoàn toàn
- `variant.stock = 0` → Size cụ thể hết hàng
- Tổng stock = SUM(tất cả variants.stock)
