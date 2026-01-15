# 🧪 Test Đơn Hàng Mới Với Variants

## ⚠️ Vấn đề phát hiện

Tất cả đơn hàng hiện tại có `variant_id = NULL` vì chúng được tạo **TRƯỚC KHI** cập nhật code checkout.

**Kết quả kiểm tra:**
```
📦 Order #29 - variant_id: NULL (OLD ORDER)
📦 Order #28 - variant_id: NULL (OLD ORDER)
📦 Order #27 - variant_id: NULL (OLD ORDER)
```

→ Các đơn hàng cũ không giảm stock từ `product_variants`, chỉ giảm từ `products.stock` (cột cũ)

## ✅ Giải pháp

Tạo đơn hàng MỚI để test chức năng giảm stock từ variants.

## 🧪 Test Case Đầy Đủ

### Bước 1: Kiểm tra stock hiện tại

```javascript
// Chạy script kiểm tra
node backend/database/check-orders.js
```

**Kết quả hiện tại:**
- Size 38: 1 units
- Size 39-45: 5 units mỗi size

### Bước 2: Xóa giỏ hàng cũ (nếu có)

1. Đăng nhập khách hàng
2. Vào giỏ hàng
3. Xóa tất cả sản phẩm cũ

### Bước 3: Tạo đơn hàng MỚI

1. **Đăng nhập khách hàng:**
   - URL: `http://localhost:3001/login.html`
   - Dùng tài khoản khách hàng bất kỳ

2. **Vào trang sản phẩm:**
   - URL: `http://localhost:3001/product-detail-new.html?id=1`
   - (Phải dùng trang MỚI: product-detail-new.html)

3. **Chọn variant:**
   - Màu: **Đen** (chỉ có 1 màu)
   - Size: **42** (đang có 5 units)
   - Số lượng: **3**

4. **Thêm vào giỏ:**
   - Click "Thêm vào giỏ hàng"
   - Kiểm tra alert: "✓ Đã thêm Adidas Ultraboost 22 (Đen - Size 42) vào giỏ hàng!"
   - **Quan trọng:** Alert phải có thông tin màu và size!

5. **Checkout:**
   - Vào giỏ hàng
   - Kiểm tra: Phải hiển thị "Size 42" và "Màu: Đen"
   - Click "Thanh toán"
   - Điền địa chỉ
   - Click "Đặt hàng"
   - Ghi nhớ Order ID (ví dụ: #30)

### Bước 4: Kiểm tra đơn hàng có variant_id

```javascript
// Chạy lại script
node backend/database/check-orders.js
```

**Kết quả mong đợi:**
```
📦 Order #30 - NEW ORDER
  - Adidas Ultraboost 22
    Product ID: 1
    Variant ID: 5 (có giá trị!)
    Color: Đen
    Size: 42
    Quantity: 3
    Current Stock: 5
```

### Bước 5: Admin hoàn thành đơn hàng

1. **Đăng nhập admin:**
   - Email: `admin@adidas.com`
   - Password: `123456`

2. **Vào tab "Đơn hàng":**
   - Tìm Order #30 (mới nhất)
   - Status: pending

3. **Xem chi tiết:**
   - Click "Chi tiết"
   - **Kiểm tra:** Phải hiển thị "Size: 42" và "Màu: Đen"

4. **Đổi status:**
   - Chọn "completed"
   - Click "Cập nhật"
   - Thấy alert: "Cập nhật trạng thái thành công"

### Bước 6: Kiểm tra stock đã giảm

```javascript
// Chạy lại script
node backend/database/check-orders.js
```

**Kết quả mong đợi:**
```
📊 Current stock for product ID 1:
  Size 38 (Đen): 1 units
  Size 39 (Đen): 5 units
  Size 40 (Đen): 5 units
  Size 41 (Đen): 5 units
  Size 42 (Đen): 2 units ✅ (5 - 3 = 2)
  Size 43 (Đen): 5 units
  Size 44 (Đen): 5 units
  Size 45 (Đen): 5 units
```

### Bước 7: Kiểm tra trong admin

1. **Tab "Sản phẩm":**
   - Tìm "Adidas Ultraboost 22"
   - Tổng stock: 37 (1+5+5+5+2+5+5+5)

2. **Click "Size/Màu":**
   - Size 42: Hiển thị **2** (không phải 5)

## 📊 Bảng so sánh

| Loại đơn hàng | variant_id | Giảm stock từ | Kết quả |
|---------------|------------|---------------|---------|
| Đơn cũ (trước update) | NULL | products.stock | ❌ Không giảm variants |
| Đơn mới (sau update) | Có giá trị | product_variants.stock | ✅ Giảm đúng variant |

## 🔍 Debug: Kiểm tra giỏ hàng có variant_id không

Nếu đơn hàng mới vẫn không có variant_id, kiểm tra:

1. **Giỏ hàng có variant_id không:**
```javascript
// Tạo file: backend/database/check-cart.js
const mysql = require('mysql2/promise');

async function checkCart() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '',
        database: 'quanlyshopgiay'
    });

    const [items] = await connection.query(`
        SELECT 
            c.*,
            p.name,
            pv.size,
            pv.color
        FROM cart c
        LEFT JOIN products p ON c.product_id = p.id
        LEFT JOIN product_variants pv ON c.variant_id = pv.id
        ORDER BY c.id DESC
        LIMIT 5
    `);

    console.log('🛒 Recent cart items:');
    for (const item of items) {
        console.log(`  - ${item.name}`);
        console.log(`    Variant ID: ${item.variant_id || 'NULL'}`);
        console.log(`    Size: ${item.size || 'N/A'}`);
        console.log(`    Color: ${item.color || 'N/A'}`);
    }

    await connection.end();
}

checkCart().catch(console.error);
```

2. **Chạy:**
```bash
node backend/database/check-cart.js
```

3. **Nếu variant_id = NULL trong cart:**
   - Nghĩa là trang product-detail-new.html chưa được dùng
   - Hoặc code add to cart chưa gửi variant_id
   - Kiểm tra lại URL: Phải là `product-detail-new.html` (không phải `product-detail.html`)

## ✅ Kết luận

- Đơn hàng cũ (variant_id = NULL): Không test được chức năng mới
- Đơn hàng mới (variant_id có giá trị): Sẽ giảm stock đúng từ variants
- **Phải tạo đơn hàng mới từ trang product-detail-new.html để test!**
