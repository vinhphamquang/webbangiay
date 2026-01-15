# Tiến độ triển khai Product Variants

## ✅ Đã hoàn thành:

### Backend - Database & Migration
- ✅ Tạo bảng `product_variants`
- ✅ Cập nhật bảng `cart` (thêm variant_id, color)
- ✅ Cập nhật bảng `order_items` (thêm variant_id, color)
- ✅ Migrate dữ liệu hiện tại (tạo 8 size cho mỗi sản phẩm)

### Backend - API
- ✅ `GET /api/products/:id/variants` - Lấy variants (server.js)
- ✅ `GET /api/admin/products/:id/variants` - Admin lấy variants
- ✅ `POST /api/admin/products/:id/variants` - Admin tạo variant
- ✅ `PUT /api/admin/products/:id/variants/:variantId` - Admin sửa variant
- ✅ `DELETE /api/admin/products/:id/variants/:variantId` - Admin xóa variant
- ✅ `GET /api/customer/cart` - Lấy giỏ hàng với variant info
- ✅ `POST /api/customer/cart` - Thêm vào giỏ với variantId
- ✅ `PUT /api/customer/cart/:id` - Cập nhật quantity/đổi variant

## ⏳ Đang làm:

### Backend - API (tiếp)
- ⏳ Cập nhật `POST /api/customer/orders` - Lưu variant_id vào order_items
- ⏳ Cập nhật `PUT /api/admin/orders/:id/status` - Giảm stock theo variant

### Frontend - Admin
- ⏳ Thêm UI quản lý variants trong modal sản phẩm
- ⏳ Form thêm/sửa variant
- ⏳ Bảng hiển thị variants với stock

### Frontend - Customer
- ⏳ UI chọn màu sắc (color picker/buttons)
- ⏳ UI chọn size (buttons với disabled state)
- ⏳ Hiển thị stock còn lại
- ⏳ Cập nhật giỏ hàng hiển thị màu/size
- ⏳ Cho phép đổi size/màu trong giỏ

## 📋 Cần làm tiếp:

1. **Cập nhật Order Processing**
   - Lưu variant_id khi tạo đơn hàng
   - Giảm stock của variant khi completed
   - Hoàn stock của variant khi cancelled

2. **Admin UI - Quản lý Variants**
   - Modal hiển thị danh sách variants
   - Form thêm variant (size, màu, mã màu, stock)
   - Nút sửa/xóa variant
   - Color picker cho chọn màu

3. **Customer UI - Chọn Size & Màu**
   - Dropdown hoặc buttons chọn màu
   - Buttons chọn size (38-45)
   - Disable size hết hàng (màu xám)
   - Hiển thị "Hết hàng" cho size stock = 0
   - Hiển thị số lượng còn lại
   - Cập nhật giá khi chọn variant

4. **Customer UI - Giỏ hàng**
   - Hiển thị màu đã chọn (color badge)
   - Hiển thị size đã chọn
   - Dropdown đổi size/màu
   - Kiểm tra stock khi thay đổi

5. **Testing & Polish**
   - Test flow: Thêm variant → Chọn → Mua → Giảm stock
   - Test edge cases: Hết hàng, đổi variant, merge cart items
   - UI/UX polish
   - Responsive design

## Files cần cập nhật tiếp:

### Backend:
- `backend/api/customer.js` - Order creation với variants
- `backend/api/admin.js` - Stock management với variants

### Frontend:
- `frontend/js/admin.js` - Variants management UI
- `frontend/admin.html` - Variants modal/form
- `frontend/js/app.js` - Size/color selection
- `frontend/index.html` - Size/color UI
- `frontend/css/style.css` - Variants styling

## Ước tính thời gian còn lại:
- Backend API: ~30 phút
- Admin UI: ~1 giờ
- Customer UI: ~1.5 giờ
- Testing: ~30 phút
**Tổng: ~3.5 giờ**
