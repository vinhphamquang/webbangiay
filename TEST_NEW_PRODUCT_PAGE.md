# 🧪 Test Trang Chi Tiết Sản Phẩm Mới

## ✅ Đã tạo mới

### Files mới:
1. **frontend/product-detail-new.html** - Trang HTML mới, sạch sẽ
2. **frontend/js/product-detail-new.js** - JavaScript tích hợp đầy đủ (không có conflict)
3. **frontend/css/product-detail.css** - Đã thêm styles cho variants

### Thay đổi:
- **frontend/js/app.js** - Cập nhật link từ `product-detail.html` → `product-detail-new.html`

## 🎯 Cách test

### 1. Khởi động backend
```bash
cd backend
npm start
```

### 2. Mở trang chủ
```
http://localhost:3001/index.html
```

### 3. Click vào bất kỳ sản phẩm nào
- Sẽ chuyển đến `product-detail-new.html?id=X`

### 4. Kiểm tra các chức năng

#### ✅ Hiển thị sản phẩm
- [ ] Tên sản phẩm hiển thị đúng
- [ ] Giá hiển thị đúng
- [ ] Hình ảnh hiển thị đúng
- [ ] Mô tả hiển thị đúng

#### ✅ Chọn màu sắc
- [ ] Hiển thị danh sách màu với color circle
- [ ] Click chọn màu → màu được active (border đen)
- [ ] Khi chọn màu → danh sách size cập nhật theo màu đó

#### ✅ Chọn size
- [ ] Hiển thị danh sách size (38-45)
- [ ] Size còn hàng: có thể click, hover hiệu ứng
- [ ] Size hết hàng: màu xám, disabled, hiển thị "Hết"
- [ ] Click chọn size → size được active (background đen, chữ trắng)

#### ✅ Hiển thị tồn kho
- [ ] Khi chưa chọn: "Vui lòng chọn màu và size"
- [ ] Khi hết hàng: "❌ Hết hàng" (màu đỏ)
- [ ] Khi < 5: "⚠️ Chỉ còn X sản phẩm" (màu cam)
- [ ] Khi >= 5: "✓ Còn X sản phẩm" (màu xanh)

#### ✅ Chọn số lượng
- [ ] Nút - giảm số lượng (min = 1)
- [ ] Nút + tăng số lượng (max = stock hoặc 10)
- [ ] Input hiển thị số lượng hiện tại

#### ✅ Thêm vào giỏ hàng
- [ ] Chưa chọn variant → alert "Vui lòng chọn màu sắc và kích cỡ"
- [ ] Chọn size hết hàng → alert "Size này đã hết hàng"
- [ ] Chưa đăng nhập → confirm đăng nhập
- [ ] Đã đăng nhập + chọn đủ → thêm thành công, hiển thị alert
- [ ] Cart count tăng lên

#### ✅ Mua ngay
- [ ] Tương tự "Thêm vào giỏ hàng"
- [ ] Sau khi thêm → chuyển đến trang giỏ hàng

#### ✅ Đánh giá sản phẩm
- [ ] Hiển thị danh sách đánh giá (nếu có)
- [ ] Hiển thị số sao, tên người đánh giá, nội dung

#### ✅ Sản phẩm liên quan
- [ ] Hiển thị 4 sản phẩm cùng category
- [ ] Click vào sản phẩm → chuyển đến trang chi tiết sản phẩm đó

## 🐛 Lỗi đã fix

### Lỗi cũ: `SyntaxError: Identifier 'API_URL' has already been declared`
- **Nguyên nhân**: 2 file JS đều khai báo `const API_URL`
- **Giải pháp**: Tạo file mới tích hợp tất cả logic vào 1 file duy nhất

### Cấu trúc mới:
```
product-detail-new.html
  └── product-detail-new.js (single file, no conflicts)
```

## 📝 Notes

- File cũ (`product-detail.html`, `product-detail.js`, `product-variants.js`) vẫn còn nhưng không được sử dụng
- Có thể xóa file cũ sau khi test thành công
- CSS được tái sử dụng từ `product-detail.css` (đã thêm variant styles)

## 🚀 Kết quả mong đợi

Trang chi tiết sản phẩm hoạt động hoàn hảo với:
- ✅ Không có lỗi JavaScript
- ✅ Chọn màu và size mượt mà
- ✅ Hiển thị tồn kho chính xác
- ✅ Thêm vào giỏ hàng với variant đúng
- ✅ UI đẹp, responsive
