# MÔ HÌNH USE CASE - WEBSITE BÁN GIÀY ADIDAS

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Mục đích
Website bán giày thể thao Adidas chính hãng với đầy đủ chức năng quản lý sản phẩm, đơn hàng, khách hàng và tư vấn.

### 1.2. Các Actor (Tác nhân)
- **Khách (Guest)**: Người dùng chưa đăng nhập
- **Khách hàng (Customer)**: Người dùng đã đăng ký tài khoản
- **Quản trị viên (Admin)**: Người quản lý hệ thống

---

## 2. DANH SÁCH USE CASE THEO ACTOR

### 2.1. KHÁCH (GUEST)

#### UC-G01: Xem danh sách sản phẩm
**Mô tả**: Khách có thể xem tất cả sản phẩm giày đang bán

**Luồng chính**:
1. Khách truy cập trang chủ
2. Hệ thống hiển thị banner động các danh mục
3. Hệ thống hiển thị danh sách sản phẩm
4. Khách có thể lọc theo danh mục, tìm kiếm, sắp xếp

**Kết quả**: Danh sách sản phẩm được hiển thị


#### UC-G02: Xem chi tiết sản phẩm
**Mô tả**: Khách xem thông tin chi tiết của một sản phẩm

**Luồng chính**:
1. Khách click vào sản phẩm
2. Hệ thống hiển thị chi tiết: tên, giá, mô tả, hình ảnh, tồn kho
3. Hiển thị các size có sẵn (38-45)
4. Hiển thị đánh giá của khách hàng khác
5. Hiển thị sản phẩm liên quan

**Kết quả**: Thông tin chi tiết sản phẩm được hiển thị

#### UC-G03: Đăng ký tài khoản
**Mô tả**: Khách tạo tài khoản mới để mua hàng

**Luồng chính**:
1. Khách click "Đăng ký"
2. Nhập thông tin: họ tên, email, mật khẩu, số điện thoại, địa chỉ
3. Đồng ý điều khoản sử dụng
4. Hệ thống kiểm tra email chưa tồn tại
5. Tạo tài khoản thành công

**Luồng thay thế**:
- Email đã tồn tại: Hiển thị lỗi, yêu cầu đăng nhập

**Kết quả**: Tài khoản được tạo, tự động đăng nhập

#### UC-G04: Đăng nhập
**Mô tả**: Khách đăng nhập vào hệ thống

**Luồng chính**:
1. Khách nhập email và mật khẩu
2. Hệ thống xác thực thông tin
3. Tạo token xác thực
4. Chuyển hướng về trang trước đó hoặc trang chủ

**Luồng thay thế**:
- Sai email/mật khẩu: Hiển thị lỗi

**Kết quả**: Đăng nhập thành công, nhận token

#### UC-G05: Gửi liên hệ tư vấn
**Mô tả**: Khách gửi yêu cầu tư vấn

**Luồng chính**:
1. Khách truy cập trang liên hệ
2. Điền form: họ tên, email, số điện thoại, chủ đề, nội dung
3. Gửi yêu cầu
4. Hệ thống lưu vào database với trạng thái "pending"

**Kết quả**: Yêu cầu tư vấn được gửi

---

### 2.2. KHÁCH HÀNG (CUSTOMER)

#### UC-C01: Thêm sản phẩm vào giỏ hàng
**Mô tả**: Khách hàng thêm sản phẩm vào giỏ

**Luồng chính**:
1. Khách hàng xem chi tiết sản phẩm
2. Chọn size giày (38-45)
3. Chọn số lượng
4. Click "Thêm vào giỏ hàng"
5. Hệ thống kiểm tra tồn kho
6. Thêm vào giỏ hàng (hoặc cộng dồn nếu đã có)

**Luồng thay thế**:
- Hết hàng: Hiển thị thông báo
- Chưa chọn size: Yêu cầu chọn size

**Kết quả**: Sản phẩm được thêm vào giỏ hàng


#### UC-C02: Quản lý giỏ hàng
**Mô tả**: Khách hàng xem và chỉnh sửa giỏ hàng

**Luồng chính**:
1. Khách hàng vào trang giỏ hàng
2. Hệ thống hiển thị danh sách sản phẩm trong giỏ
3. Khách hàng có thể:
   - Thay đổi số lượng
   - Thay đổi size
   - Xóa sản phẩm
4. Hệ thống tự động cập nhật tổng tiền

**Kết quả**: Giỏ hàng được cập nhật

#### UC-C03: Đặt hàng
**Mô tả**: Khách hàng tạo đơn hàng từ giỏ hàng

**Luồng chính**:
1. Khách hàng click "Thanh toán" từ giỏ hàng
2. Điền thông tin giao hàng (tự động điền từ profile)
3. Chọn phương thức thanh toán (COD, Bank, MoMo)
4. Xác nhận đặt hàng
5. Hệ thống tạo đơn hàng với trạng thái "pending"
6. Xóa giỏ hàng
7. Hiển thị mã đơn hàng

**Lưu ý**: Tồn kho KHÔNG giảm khi đặt hàng

**Kết quả**: Đơn hàng được tạo thành công

#### UC-C04: Xem lịch sử đơn hàng
**Mô tả**: Khách hàng xem các đơn hàng đã đặt

**Luồng chính**:
1. Khách hàng vào trang "Hồ sơ" > "Đơn hàng của tôi"
2. Hệ thống hiển thị danh sách đơn hàng
3. Mỗi đơn hiển thị: mã, ngày, tổng tiền, trạng thái
4. Click vào đơn để xem chi tiết

**Kết quả**: Danh sách đơn hàng được hiển thị

#### UC-C05: Xem chi tiết đơn hàng
**Mô tả**: Khách hàng xem thông tin chi tiết đơn hàng

**Luồng chính**:
1. Khách hàng click vào đơn hàng
2. Hệ thống hiển thị:
   - Thông tin đơn hàng
   - Danh sách sản phẩm (tên, size, số lượng, giá)
   - Địa chỉ giao hàng
   - Trạng thái đơn hàng
   - Tổng tiền

**Kết quả**: Chi tiết đơn hàng được hiển thị

#### UC-C06: Cập nhật thông tin cá nhân
**Mô tả**: Khách hàng chỉnh sửa thông tin profile

**Luồng chính**:
1. Khách hàng vào "Hồ sơ" > "Thông tin cá nhân"
2. Click "Chỉnh sửa"
3. Cập nhật: họ tên, số điện thoại, địa chỉ
4. Lưu thay đổi

**Lưu ý**: Email không thể thay đổi

**Kết quả**: Thông tin được cập nhật

#### UC-C07: Đổi mật khẩu
**Mô tả**: Khách hàng thay đổi mật khẩu

**Luồng chính**:
1. Khách hàng vào "Hồ sơ" > "Đổi mật khẩu"
2. Nhập mật khẩu hiện tại
3. Nhập mật khẩu mới (tối thiểu 6 ký tự)
4. Xác nhận mật khẩu mới
5. Hệ thống kiểm tra mật khẩu hiện tại
6. Cập nhật mật khẩu mới

**Luồng thay thế**:
- Mật khẩu hiện tại sai: Hiển thị lỗi
- Mật khẩu mới không khớp: Hiển thị lỗi

**Kết quả**: Mật khẩu được thay đổi


#### UC-C08: Đánh giá sản phẩm
**Mô tả**: Khách hàng viết đánh giá cho sản phẩm đã mua

**Luồng chính**:
1. Khách hàng vào "Hồ sơ" > "Đánh giá của tôi"
2. Click "Viết đánh giá mới"
3. Chọn sản phẩm từ đơn hàng đã hoàn thành
4. Chọn số sao (1-5)
5. Viết nhận xét
6. Gửi đánh giá

**Điều kiện**:
- Chỉ đánh giá sản phẩm từ đơn hàng đã hoàn thành
- Mỗi sản phẩm chỉ đánh giá 1 lần

**Kết quả**: Đánh giá được lưu với trạng thái "pending"

#### UC-C09: Gửi liên hệ tư vấn (đã đăng nhập)
**Mô tả**: Khách hàng gửi yêu cầu tư vấn với thông tin tự động điền

**Luồng chính**:
1. Khách hàng truy cập trang liên hệ
2. Form tự động điền: họ tên, email, số điện thoại từ profile
3. Chọn chủ đề và nhập nội dung
4. Gửi yêu cầu

**Kết quả**: Yêu cầu tư vấn được gửi

#### UC-C10: Đăng xuất
**Mô tả**: Khách hàng đăng xuất khỏi hệ thống

**Luồng chính**:
1. Khách hàng click "Đăng xuất"
2. Hệ thống xóa token
3. Chuyển về trang chủ

**Kết quả**: Đăng xuất thành công

---

### 2.3. QUẢN TRỊ VIÊN (ADMIN)

#### UC-A01: Đăng nhập Admin
**Mô tả**: Admin đăng nhập với tài khoản đặc biệt

**Luồng chính**:
1. Admin nhập email và mật khẩu
2. Hệ thống xác thực và kiểm tra role = "admin"
3. Tạo cả userToken và adminToken
4. Tự động tạo customer profile nếu chưa có

**Kết quả**: Đăng nhập thành công, có quyền admin và customer

**Lưu ý**: Admin có thể sử dụng website như khách hàng thông thường

#### UC-A02: Quản lý danh mục
**Mô tả**: Admin thêm, sửa, xóa danh mục sản phẩm

**Luồng chính**:
1. Admin vào trang quản trị > Danh mục
2. Xem danh sách danh mục
3. Có thể:
   - Thêm danh mục mới (tên, mô tả)
   - Sửa danh mục
   - Xóa danh mục

**Kết quả**: Danh mục được cập nhật


#### UC-A03: Quản lý sản phẩm
**Mô tả**: Admin thêm, sửa, xóa sản phẩm

**Luồng chính - Thêm sản phẩm**:
1. Admin click "Thêm sản phẩm"
2. Nhập thông tin: tên, giá, danh mục, mô tả, số lượng
3. Upload ảnh sản phẩm (tối đa 5MB)
4. Lưu sản phẩm

**Luồng chính - Sửa sản phẩm**:
1. Admin click "Sửa" trên sản phẩm
2. Cập nhật thông tin
3. Có thể thay đổi ảnh
4. Lưu thay đổi

**Luồng chính - Xóa sản phẩm**:
1. Admin click "Xóa"
2. Xác nhận xóa
3. Sản phẩm bị xóa khỏi database

**Kết quả**: Sản phẩm được cập nhật

#### UC-A04: Upload ảnh sản phẩm
**Mô tả**: Admin upload ảnh cho sản phẩm

**Luồng chính**:
1. Admin chọn file ảnh từ máy tính
2. Hệ thống kiểm tra:
   - Định dạng: jpeg, jpg, png, gif, webp
   - Kích thước: tối đa 5MB
3. Upload lên server
4. Lưu vào thư mục /uploads
5. Trả về URL ảnh

**Kết quả**: Ảnh được upload và URL được trả về

#### UC-A05: Quản lý đơn hàng
**Mô tả**: Admin xem và cập nhật trạng thái đơn hàng

**Luồng chính - Xem đơn hàng**:
1. Admin vào "Quản lý đơn hàng"
2. Xem danh sách đơn hàng
3. Có thể lọc theo trạng thái
4. Click vào đơn để xem chi tiết

**Luồng chính - Cập nhật trạng thái**:
1. Admin chọn đơn hàng
2. Thay đổi trạng thái:
   - pending → processing
   - processing → completed
   - processing → cancelled
3. Hệ thống xử lý tồn kho:
   - Chuyển sang "completed": GIẢM tồn kho
   - Chuyển từ "completed" sang khác: HOÀN lại tồn kho

**Kết quả**: Trạng thái đơn hàng và tồn kho được cập nhật

**Lưu ý quan trọng**: Tồn kho chỉ thay đổi khi đơn hàng chuyển sang/từ trạng thái "completed"

#### UC-A06: Quản lý khách hàng
**Mô tả**: Admin xem thông tin khách hàng

**Luồng chính**:
1. Admin vào "Quản lý khách hàng"
2. Xem danh sách khách hàng
3. Mỗi khách hàng hiển thị:
   - Thông tin cá nhân
   - Tổng số đơn hàng
   - Tổng chi tiêu
4. Click vào khách hàng để xem chi tiết và lịch sử đơn hàng

**Kết quả**: Thông tin khách hàng được hiển thị


#### UC-A07: Quản lý liên hệ tư vấn
**Mô tả**: Admin xem và xử lý yêu cầu tư vấn

**Luồng chính**:
1. Admin vào "Quản lý liên hệ"
2. Xem danh sách yêu cầu tư vấn
3. Có thể lọc theo trạng thái (pending, processing, completed)
4. Click vào yêu cầu để xem chi tiết
5. Cập nhật trạng thái:
   - pending → processing (đang xử lý)
   - processing → completed (đã hoàn thành)
6. Có thể xóa yêu cầu

**Kết quả**: Yêu cầu tư vấn được xử lý

#### UC-A08: Quản lý đánh giá
**Mô tả**: Admin duyệt hoặc xóa đánh giá

**Luồng chính**:
1. Admin vào "Quản lý đánh giá"
2. Xem danh sách đánh giá
3. Có thể lọc theo trạng thái (pending, approved, rejected)
4. Với mỗi đánh giá có thể:
   - Duyệt (approved): Hiển thị công khai
   - Từ chối (rejected): Không hiển thị
   - Xóa: Xóa khỏi hệ thống

**Kết quả**: Đánh giá được kiểm duyệt

#### UC-A09: Xem thống kê Dashboard
**Mô tả**: Admin xem tổng quan hệ thống

**Luồng chính**:
1. Admin vào trang Dashboard
2. Hệ thống hiển thị:
   - Tổng số sản phẩm
   - Tổng số đơn hàng
   - Tổng số khách hàng
   - Tổng doanh thu (từ đơn completed)
   - Số đơn hàng chờ xử lý
   - Số sản phẩm sắp hết hàng (< 10)
   - Số liên hệ chưa xử lý
   - 10 đơn hàng gần nhất
   - Top 5 sản phẩm bán chạy

**Kết quả**: Thống kê tổng quan được hiển thị

#### UC-A10: Sử dụng chức năng khách hàng
**Mô tả**: Admin có thể mua hàng như khách hàng thông thường

**Luồng chính**:
1. Admin đăng nhập
2. Có thể truy cập cả trang admin và trang khách hàng
3. Có thể:
   - Xem sản phẩm
   - Thêm vào giỏ hàng
   - Đặt hàng
   - Xem đơn hàng của mình
   - Đánh giá sản phẩm

**Kết quả**: Admin sử dụng được cả 2 vai trò

---

## 3. BIỂU ĐỒ USE CASE

### 3.1. Use Case Diagram - Khách và Khách hàng

```
                    ┌─────────────────────────────────────┐
                    │   WEBSITE BÁN GIÀY ADIDAS          │
                    └─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
    ┌───▼───┐                  ┌────▼────┐              ┌──────▼──────┐
    │ Khách │                  │ Khách   │              │    Admin    │
    │(Guest)│                  │ hàng    │              │             │
    └───┬───┘                  └────┬────┘              └──────┬──────┘
        │                           │                          │
        │ UC-G01: Xem sản phẩm      │                          │
        │ UC-G02: Xem chi tiết      │                          │
        │ UC-G03: Đăng ký           │                          │
        │ UC-G04: Đăng nhập         │                          │
        │ UC-G05: Gửi liên hệ       │                          │
        │                           │                          │
        │                           │ UC-C01: Thêm giỏ hàng    │
        │                           │ UC-C02: Quản lý giỏ      │
        │                           │ UC-C03: Đặt hàng         │
        │                           │ UC-C04: Xem đơn hàng     │
        │                           │ UC-C05: Chi tiết đơn     │
        │                           │ UC-C06: Cập nhật profile │
        │                           │ UC-C07: Đổi mật khẩu     │
        │                           │ UC-C08: Đánh giá         │
        │                           │ UC-C09: Gửi liên hệ      │
        │                           │ UC-C10: Đăng xuất        │
        │                           │                          │
        └───────────────────────────┴──────────────────────────┘
```


### 3.2. Use Case Diagram - Admin

```
                    ┌─────────────────────────────────────┐
                    │      TRANG QUẢN TRỊ ADMIN          │
                    └─────────────────────────────────────┘
                                    │
                              ┌─────▼─────┐
                              │   Admin   │
                              └─────┬─────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        │ UC-A01: Đăng nhập Admin   │                          │
        │ UC-A02: Quản lý danh mục  │                          │
        │ UC-A03: Quản lý sản phẩm  │                          │
        │ UC-A04: Upload ảnh        │                          │
        │ UC-A05: Quản lý đơn hàng  │                          │
        │ UC-A06: Quản lý khách hàng│                          │
        │ UC-A07: Quản lý liên hệ   │                          │
        │ UC-A08: Quản lý đánh giá  │                          │
        │ UC-A09: Xem Dashboard     │                          │
        │ UC-A10: Dùng như khách    │                          │
        │                           │                          │
        └───────────────────────────┴──────────────────────────┘
```

---

## 4. LUỒNG NGHIỆP VỤ CHÍNH

### 4.1. Luồng mua hàng (Customer Journey)

```
1. Khách truy cập website
   ↓
2. Xem banner động các danh mục
   ↓
3. Lọc/Tìm kiếm sản phẩm
   ↓
4. Xem chi tiết sản phẩm
   ↓
5. Chọn size và số lượng
   ↓
6. Thêm vào giỏ hàng
   ↓
7. [Nếu chưa đăng nhập] → Đăng ký/Đăng nhập
   ↓
8. Xem giỏ hàng, điều chỉnh
   ↓
9. Thanh toán (điền thông tin giao hàng)
   ↓
10. Đặt hàng thành công
    ↓
11. Nhận mã đơn hàng
    ↓
12. Admin xử lý đơn hàng
    ↓
13. Admin đánh dấu "completed" → Tồn kho giảm
    ↓
14. Khách hàng nhận hàng
    ↓
15. Khách hàng đánh giá sản phẩm
```

### 4.2. Luồng quản lý đơn hàng (Admin)

```
1. Khách hàng đặt hàng
   ↓
2. Đơn hàng tạo với trạng thái "pending"
   ↓
3. Admin nhận thông báo đơn hàng mới
   ↓
4. Admin xem chi tiết đơn hàng
   ↓
5. Admin xác nhận và chuyển sang "processing"
   ↓
6. Chuẩn bị hàng và giao hàng
   ↓
7. Admin đánh dấu "completed"
   ↓
8. Hệ thống tự động GIẢM tồn kho
   ↓
9. [Nếu có vấn đề] Admin chuyển về "cancelled"
   ↓
10. [Nếu từ completed → cancelled] Hệ thống HOÀN lại tồn kho
```


### 4.3. Luồng quản lý tồn kho

```
QUAN TRỌNG: Tồn kho CHỈ thay đổi khi đơn hàng chuyển trạng thái "completed"

Khi đặt hàng:
- Tạo đơn hàng với trạng thái "pending"
- Tồn kho KHÔNG thay đổi
- Giỏ hàng được xóa

Khi Admin cập nhật trạng thái:

1. pending → processing:
   - Tồn kho KHÔNG thay đổi

2. processing → completed:
   - Tồn kho GIẢM theo số lượng đơn hàng
   - Ví dụ: Đơn mua 2 đôi → Tồn kho giảm 2

3. completed → cancelled/processing:
   - Tồn kho TĂNG lại (hoàn trả)
   - Ví dụ: Hủy đơn 2 đôi → Tồn kho tăng 2

4. processing → cancelled:
   - Tồn kho KHÔNG thay đổi (vì chưa giảm)
```

---

## 5. QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

### 5.1. Quy tắc về tài khoản
- BR-01: Email phải duy nhất trong hệ thống
- BR-02: Mật khẩu tối thiểu 6 ký tự
- BR-03: Admin có thể sử dụng chức năng khách hàng
- BR-04: Admin tự động có customer profile khi đăng nhập

### 5.2. Quy tắc về sản phẩm
- BR-05: Sản phẩm phải thuộc một danh mục
- BR-06: Giá sản phẩm phải > 0
- BR-07: Tồn kho phải >= 0
- BR-08: Size giày từ 38 đến 45
- BR-09: Ảnh sản phẩm tối đa 5MB
- BR-10: Định dạng ảnh: jpeg, jpg, png, gif, webp

### 5.3. Quy tắc về giỏ hàng
- BR-11: Phải đăng nhập để thêm vào giỏ hàng
- BR-12: Cùng sản phẩm khác size = item riêng trong giỏ
- BR-13: Số lượng đặt không được vượt quá tồn kho
- BR-14: Giỏ hàng được xóa sau khi đặt hàng thành công

### 5.4. Quy tắc về đơn hàng
- BR-15: Đơn hàng có 4 trạng thái: pending, processing, completed, cancelled
- BR-16: Tồn kho CHỈ giảm khi đơn chuyển sang "completed"
- BR-17: Tồn kho được hoàn lại khi đơn chuyển từ "completed" sang trạng thái khác
- BR-18: Không thể xóa đơn hàng, chỉ có thể hủy (cancelled)
- BR-19: Mỗi đơn hàng có mã duy nhất

### 5.5. Quy tắc về đánh giá
- BR-20: Chỉ đánh giá sản phẩm từ đơn hàng đã hoàn thành (completed)
- BR-21: Mỗi sản phẩm trong mỗi đơn chỉ đánh giá 1 lần
- BR-22: Đánh giá từ 1-5 sao
- BR-23: Đánh giá cần được admin duyệt mới hiển thị công khai

### 5.6. Quy tắc về liên hệ
- BR-24: Liên hệ có 3 trạng thái: pending, processing, completed
- BR-25: Khách chưa đăng nhập có thể gửi liên hệ
- BR-26: Khách đã đăng nhập tự động điền thông tin

---

## 6. MA TRẬN TRUY XUẤT (TRACEABILITY MATRIX)

| Use Case ID | Tên Use Case | Actor | API Endpoint | Database Tables |
|-------------|--------------|-------|--------------|-----------------|
| UC-G01 | Xem danh sách sản phẩm | Guest | GET /api/products | products, categories |
| UC-G02 | Xem chi tiết sản phẩm | Guest | GET /api/products/:id | products, categories, reviews |
| UC-G03 | Đăng ký tài khoản | Guest | POST /api/auth/register | users, customers |
| UC-G04 | Đăng nhập | Guest | POST /api/auth/login | users, customers |
| UC-G05 | Gửi liên hệ | Guest | POST /api/contact | contacts |
| UC-C01 | Thêm vào giỏ hàng | Customer | POST /api/customer/cart | cart, products |
| UC-C02 | Quản lý giỏ hàng | Customer | GET/PUT/DELETE /api/customer/cart | cart, products |
| UC-C03 | Đặt hàng | Customer | POST /api/customer/orders | orders, order_items, cart |
| UC-C04 | Xem lịch sử đơn hàng | Customer | GET /api/customer/orders | orders |
| UC-C05 | Xem chi tiết đơn hàng | Customer | GET /api/customer/orders/:id | orders, order_items, products |
| UC-C06 | Cập nhật profile | Customer | PUT /api/customer/profile | customers |
| UC-C07 | Đổi mật khẩu | Customer | PUT /api/customer/password | users |
| UC-C08 | Đánh giá sản phẩm | Customer | POST /api/customer/reviews | reviews, orders, order_items |
| UC-A01 | Đăng nhập Admin | Admin | POST /api/auth/login | users, customers |
| UC-A02 | Quản lý danh mục | Admin | GET/POST/PUT/DELETE /api/admin/categories | categories |
| UC-A03 | Quản lý sản phẩm | Admin | GET/POST/PUT/DELETE /api/admin/products | products, categories |
| UC-A04 | Upload ảnh | Admin | POST /api/admin/upload | - (file system) |
| UC-A05 | Quản lý đơn hàng | Admin | GET/PUT /api/admin/orders | orders, order_items, products |
| UC-A06 | Quản lý khách hàng | Admin | GET /api/admin/customers | customers, users, orders |
| UC-A07 | Quản lý liên hệ | Admin | GET/PUT/DELETE /api/admin/contacts | contacts |
| UC-A08 | Quản lý đánh giá | Admin | GET/PUT/DELETE /api/admin/reviews | reviews, products, customers |
| UC-A09 | Xem Dashboard | Admin | GET /api/admin/dashboard | All tables |

---

## 7. TỔNG KẾT

### 7.1. Số lượng Use Case
- **Khách (Guest)**: 5 use cases
- **Khách hàng (Customer)**: 10 use cases
- **Quản trị viên (Admin)**: 10 use cases
- **Tổng cộng**: 25 use cases

### 7.2. Các tính năng nổi bật
1. **Banner động**: Tự động hiển thị các danh mục giày đang bán
2. **Quản lý size**: Mỗi size là một item riêng trong giỏ hàng
3. **Quản lý tồn kho thông minh**: Chỉ giảm khi đơn hoàn thành
4. **Admin đa vai trò**: Vừa quản trị vừa mua hàng
5. **Hệ thống đánh giá**: Chỉ đánh giá sản phẩm đã mua
6. **Liên hệ tư vấn**: Tự động điền thông tin cho user đã đăng nhập
7. **Upload ảnh**: Hỗ trợ nhiều định dạng, giới hạn kích thước

### 7.3. Công nghệ sử dụng
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **File Upload**: Multer
- **Password Hashing**: bcryptjs

---

**Tài liệu này mô tả đầy đủ các use case của hệ thống Website Bán Giày Adidas**

*Phiên bản: 1.0*  
*Ngày cập nhật: Tháng 1, 2026*
