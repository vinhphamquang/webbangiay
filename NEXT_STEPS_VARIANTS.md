# Các bước tiếp theo để hoàn thiện Variants

## ✅ Đã hoàn thành:

### Backend
- ✅ Database & migrations
- ✅ Admin API (CRUD variants)
- ✅ Customer API (cart với variants)
- ✅ Test scripts - All passed!

### Frontend - Admin
- ✅ Nút "Size/Màu" trong danh sách sản phẩm
- ✅ Modal quản lý variants
- ✅ Form thêm variant (size, màu, color picker, stock)
- ✅ Form sửa variant
- ✅ Xóa variant
- ✅ Hiển thị bảng variants với màu sắc

### Frontend - Customer
- ✅ File `product-variants.js` - Logic chọn size/màu
- ✅ CSS cho variant selection
- ✅ Functions: loadVariants, renderColors, renderSizes, selectColor, selectSize

## ⏳ Còn lại cần làm:

### 1. Tích hợp vào trang sản phẩm (app.js)
Cần cập nhật trong `frontend/js/app.js`:

```javascript
// Trong showProductDetail():
- Thêm <div id="colorSelection"></div>
- Thêm <div id="sizeSelection"></div>
- Thêm <div id="stockDisplay"></div>
- Gọi initProductVariants(productId)

// Trong handleProductSubmit():
- Lấy selectedVariant thay vì size
- Gửi variantId thay vì size
- Kiểm tra variant đã chọn chưa
```

### 2. Cập nhật giỏ hàng hiển thị màu/size
Trong `frontend/js/app.js`:

```javascript
// Trong loadCart():
- Hiển thị màu sắc (color badge)
- Hiển thị size
- Thêm dropdown đổi size/màu (optional)
```

### 3. Cập nhật Order Processing
Trong `backend/api/customer.js`:

```javascript
// POST /api/customer/orders:
- Lưu variant_id vào order_items
- Thêm color vào order_items
```

Trong `backend/api/admin.js`:

```javascript
// PUT /api/admin/orders/:id/status:
- Khi completed: Giảm stock của variant
- Khi cancelled: Hoàn stock của variant
```

### 4. Test end-to-end
- Admin thêm variants với nhiều màu
- Customer chọn màu và size
- Thêm vào giỏ hàng
- Đặt hàng
- Admin đánh dấu completed
- Kiểm tra stock giảm đúng

## Files cần sửa tiếp:

1. **frontend/index.html**
   - Thêm `<script src="js/product-variants.js"></script>`
   - Thêm divs cho color/size selection trong product modal

2. **frontend/js/app.js**
   - Tích hợp initProductVariants() vào showProductDetail()
   - Cập nhật handleProductSubmit() để gửi variantId
   - Cập nhật loadCart() để hiển thị màu/size

3. **backend/api/customer.js**
   - Cập nhật POST /api/customer/orders để lưu variant_id

4. **backend/api/admin.js**
   - Cập nhật PUT /api/admin/orders/:id/status để xử lý stock theo variant

## Ước tính thời gian:
- Tích hợp vào trang sản phẩm: 30 phút
- Cập nhật giỏ hàng: 20 phút
- Order processing: 30 phút
- Testing: 20 phút
**Tổng: ~1.5 giờ**

## Lưu ý quan trọng:
- Cần test kỹ flow: Chọn variant → Thêm giỏ → Đặt hàng → Stock giảm
- Kiểm tra edge cases: Hết hàng, đổi variant, merge cart items
- UI/UX cần mượt mà, responsive
