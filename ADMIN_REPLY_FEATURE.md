# Tính năng Trả lời Liên hệ của Admin

## Tổng quan
Tính năng cho phép admin trả lời các yêu cầu liên hệ từ khách hàng và khách hàng sẽ nhận được thông báo về phản hồi.

## Các thay đổi đã thực hiện

### 1. Database Migration
**File:** `backend/database/add-reply-column.sql`
- Thêm cột `admin_reply` (TEXT) để lưu nội dung trả lời
- Thêm cột `reply_date` (TIMESTAMP) để lưu thời gian trả lời

**Script chạy migration:** `backend/database/run-reply-migration.js`

### 2. Backend API

#### Admin API (`backend/api/admin.js`)
**Endpoint mới:**
- `PUT /api/admin/contacts/:id/reply` - Admin gửi trả lời
  - Body: `{ admin_reply: string }`
  - Tự động cập nhật status thành "completed"
  - Lưu thời gian trả lời

#### Customer API (`backend/api/customer.js`)
**Endpoints mới:**
- `GET /api/customer/contact-replies` - Lấy danh sách phản hồi từ admin
  - Trả về các liên hệ có admin_reply
  - Sắp xếp theo thời gian trả lời mới nhất
  
- `GET /api/customer/unread-replies-count` - Đếm số phản hồi
  - Trả về số lượng phản hồi chưa đọc
  - Dùng để hiển thị badge thông báo

### 3. Admin Interface

#### Admin Dashboard (`frontend/js/admin.js`)
**Cập nhật trang Contacts:**
- Thêm cột "Trả lời" hiển thị trạng thái (✓ đã trả lời / - chưa trả lời)
- Nút "Xem" đổi thành "Trả lời" nếu chưa trả lời

**Modal chi tiết liên hệ:**
- Hiển thị form trả lời nếu chưa có phản hồi
- Hiển thị nội dung đã trả lời nếu đã phản hồi
- Form có textarea để nhập nội dung trả lời
- Nút "📧 Gửi trả lời" để submit

**Hàm mới:**
- `replyToContact(contactId)` - Xử lý gửi trả lời

### 4. Customer Interface

#### Contact Page (`frontend/contact.html`)
**Thêm section thông báo:**
- Hiển thị khi user đã đăng nhập và có phản hồi
- Mỗi thông báo bao gồm:
  - Chủ đề liên hệ
  - Câu hỏi gốc
  - Phản hồi từ admin
  - Thời gian trả lời

**CSS mới:**
- `.notification-item` - Card thông báo
- `.notification-reply` - Phần phản hồi admin
- Màu xanh lá (#4CAF50) để highlight phản hồi

#### Contact JavaScript (`frontend/js/contact.js`)
**Hàm mới:**
- `loadNotifications()` - Load và hiển thị phản hồi
- Tự động gọi khi user đã đăng nhập

#### Homepage (`frontend/index.html` & `frontend/js/app.js`)
**Notification Badge:**
- Badge đỏ hiển thị số lượng phản hồi mới
- Hiển thị bên cạnh link "Liên hệ"
- Tự động ẩn khi không có thông báo

**Hàm mới:**
- `loadNotificationCount()` - Load số lượng thông báo

## Luồng hoạt động

### Admin trả lời:
1. Admin vào trang Contacts
2. Click "Trả lời" hoặc "Xem" trên liên hệ
3. Nhập nội dung trả lời vào form
4. Click "📧 Gửi trả lời"
5. Hệ thống lưu phản hồi và cập nhật status = "completed"

### Khách hàng xem phản hồi:
1. Khách hàng đăng nhập
2. Thấy badge đỏ trên link "Liên hệ" (nếu có phản hồi mới)
3. Vào trang Liên hệ
4. Xem phần "📬 Phản hồi từ chúng tôi"
5. Đọc các phản hồi từ admin

## Tính năng nổi bật

✅ Admin có thể trả lời trực tiếp trong dashboard
✅ Khách hàng nhận thông báo real-time (badge)
✅ Hiển thị lịch sử phản hồi đầy đủ
✅ UI/UX thân thiện, dễ sử dụng
✅ Tự động cập nhật trạng thái khi trả lời
✅ Responsive design

## Testing

### Test Admin Reply:
1. Đăng nhập admin
2. Vào trang Contacts
3. Click "Trả lời" trên một liên hệ
4. Nhập nội dung và gửi
5. Kiểm tra cột "Trả lời" hiển thị ✓

### Test Customer Notification:
1. Đăng nhập khách hàng (email đã gửi liên hệ)
2. Kiểm tra badge đỏ trên "Liên hệ"
3. Vào trang Liên hệ
4. Xem phần thông báo hiển thị phản hồi

## Files đã thay đổi

### Backend:
- `backend/database/add-reply-column.sql` (NEW)
- `backend/database/run-reply-migration.js` (NEW)
- `backend/api/admin.js` (MODIFIED)
- `backend/api/customer.js` (MODIFIED)

### Frontend:
- `frontend/contact.html` (MODIFIED)
- `frontend/index.html` (MODIFIED)
- `frontend/js/admin.js` (MODIFIED)
- `frontend/js/contact.js` (MODIFIED)
- `frontend/js/app.js` (MODIFIED)

## Ghi chú
- Phản hồi được lưu vĩnh viễn trong database
- Khách hàng có thể xem lại phản hồi bất cứ lúc nào
- Badge thông báo hiển thị tổng số phản hồi (không phân biệt đã đọc/chưa đọc)
- Có thể mở rộng thêm tính năng đánh dấu đã đọc trong tương lai
