USE quanlyshopgiay;

-- Dữ liệu cho Users (password: 123456)
INSERT INTO users (email, password, role) VALUES
('admin@adidas.com', '$2a$10$YourHashedPasswordHere', 'admin'),
('nguyenvanan@gmail.com', '$2a$10$YourHashedPasswordHere', 'customer'),
('tranthibinh@gmail.com', '$2a$10$YourHashedPasswordHere', 'customer'),
('lehoangcuong@gmail.com', '$2a$10$YourHashedPasswordHere', 'customer'),
('phamthidung@gmail.com', '$2a$10$YourHashedPasswordHere', 'customer'),
('hoangvanem@gmail.com', '$2a$10$YourHashedPasswordHere', 'customer'),
('vuthiphuong@gmail.com', '$2a$10$YourHashedPasswordHere', 'customer'),
('dangvangiang@gmail.com', '$2a$10$YourHashedPasswordHere', 'customer'),
('buithihoa@gmail.com', '$2a$10$YourHashedPasswordHere', 'customer');

-- Dữ liệu cho Categories
INSERT INTO categories (name, description) VALUES
('Giày chạy bộ', 'Giày thể thao chuyên dụng cho chạy bộ và tập luyện'),
('Giày bóng đá', 'Giày chuyên nghiệp cho bóng đá sân cỏ tự nhiên và nhân tạo'),
('Giày lifestyle', 'Giày thời trang phong cách đường phố'),
('Giày bóng rổ', 'Giày chuyên dụng cho bóng rổ với đệm cao cấp');

-- Dữ liệu cho Products
INSERT INTO products (name, price, category_id, image, description, stock) VALUES
('Adidas Ultraboost 22', 4500000, 1, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg', 'Giày chạy bộ cao cấp với công nghệ Boost mang lại sự thoải mái tối đa cho mọi cự ly', 50),
('Adidas Predator Edge', 5200000, 2, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/ec6f94d7d7c04e6fa446ae8d00f7e7e9_9366/Predator_Edge.1_Firm_Ground_Boots_Black_GW1026_01_standard.jpg', 'Giày bóng đá chuyên nghiệp Predator với độ bám bóng vượt trội và kiểm soát hoàn hảo', 30),
('Adidas Stan Smith', 2800000, 3, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/92dcf5c7ba6b4c5c9c0aae3900dc29d4_9366/Stan_Smith_Shoes_White_FX5502_01_standard.jpg', 'Giày lifestyle kinh điển, phong cách tối giản thanh lịch phù hợp mọi trang phục', 100),
('Adidas Dame 8', 3900000, 4, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/a1d12efe3ab44d8fa3c0ae0200f8c7e7_9366/Dame_8_Shoes_Black_GZ2672_01_standard.jpg', 'Giày bóng rổ Dame 8 với đệm êm ái và độ bám sân tốt, thiết kế cho Damian Lillard', 40),
('Adidas Solarboost 4', 3500000, 1, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/d9a3d5f8e8f44e5ab5e3ad7800b5c3d2_9366/Solarboost_4_Shoes_Blue_GZ2860_01_standard.jpg', 'Giày chạy bộ năng lượng cao cho những cự ly dài với công nghệ Solar Propulsion Rail', 60),
('Adidas X Speedflow', 4800000, 2, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/f8e7d6c5b4a33e2db1c2ad7800c8d9e3_9366/X_Speedflow.1_Firm_Ground_Boots_Red_FY6870_01_standard.jpg', 'Giày bóng đá tốc độ cao X Speedflow cho những pha bứt tốc nhanh như chớp', 25),
('Adidas Superstar', 2500000, 3, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/12365dbc7c424288b7cdab4500540c1f_9366/Superstar_Shoes_White_EG4958_01_standard.jpg', 'Giày Superstar huyền thoại với thiết kế vỏ sò đặc trưng từ những năm 1970', 80),
('Adidas Harden Vol. 6', 4200000, 4, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/b2c3d4e5f6a77b8c9d0eaf1200g2h3i4_9366/Harden_Vol_6_Shoes_Black_GZ2655_01_standard.jpg', 'Giày bóng rổ Harden Vol. 6 thiết kế cho lối chơi sáng tạo của James Harden', 35),
('Adidas Adizero Boston 11', 3800000, 1, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/adizero_boston_11.jpg', 'Giày chạy marathon nhẹ nhàng với công nghệ Lightstrike Pro', 45),
('Adidas Copa Sense', 4500000, 2, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/copa_sense.jpg', 'Giày bóng đá da cao cấp Copa Sense với cảm giác chạm bóng tuyệt vời', 20),
('Adidas Forum Low', 2900000, 3, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/forum_low.jpg', 'Giày lifestyle Forum Low phong cách retro basketball', 70),
('Adidas Trae Young 2', 3600000, 4, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/trae_young_2.jpg', 'Giày bóng rổ Trae Young 2 nhẹ nhàng và linh hoạt', 30);

-- Dữ liệu cho Customers
INSERT INTO customers (user_id, name, email, phone, address) VALUES
(2, 'Nguyễn Văn An', 'nguyenvanan@gmail.com', '0901234567', '123 Nguyễn Huệ, Quận 1, TP.HCM'),
(3, 'Trần Thị Bình', 'tranthibinh@gmail.com', '0912345678', '456 Lê Lợi, Quận 3, TP.HCM'),
(4, 'Lê Hoàng Cường', 'lehoangcuong@gmail.com', '0923456789', '789 Trần Hưng Đạo, Quận 5, TP.HCM'),
(5, 'Phạm Thị Dung', 'phamthidung@gmail.com', '0934567890', '321 Võ Văn Tần, Quận 3, TP.HCM'),
(6, 'Hoàng Văn Em', 'hoangvanem@gmail.com', '0945678901', '654 Hai Bà Trưng, Quận 1, TP.HCM'),
(7, 'Vũ Thị Phương', 'vuthiphuong@gmail.com', '0956789012', '987 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM'),
(8, 'Đặng Văn Giang', 'dangvangiang@gmail.com', '0967890123', '147 Cách Mạng Tháng 8, Quận 10, TP.HCM'),
(9, 'Bùi Thị Hoa', 'buithihoa@gmail.com', '0978901234', '258 Lý Thường Kiệt, Quận 11, TP.HCM');

-- Dữ liệu cho Orders
INSERT INTO orders (customer_id, total_amount, status, shipping_address) VALUES
(1, 7300000, 'completed', '123 Nguyễn Huệ, Quận 1, TP.HCM'),
(2, 4500000, 'processing', '456 Lê Lợi, Quận 3, TP.HCM'),
(3, 9000000, 'completed', '789 Trần Hưng Đạo, Quận 5, TP.HCM'),
(4, 2800000, 'pending', '321 Võ Văn Tần, Quận 3, TP.HCM'),
(5, 8400000, 'completed', '654 Hai Bà Trưng, Quận 1, TP.HCM'),
(6, 5200000, 'cancelled', '987 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM'),
(7, 6700000, 'processing', '147 Cách Mạng Tháng 8, Quận 10, TP.HCM'),
(8, 3900000, 'completed', '258 Lý Thường Kiệt, Quận 11, TP.HCM');

-- Dữ liệu cho Order_Items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 4500000),
(1, 3, 1, 2800000),
(2, 1, 1, 4500000),
(3, 2, 1, 5200000),
(3, 5, 1, 3800000),
(4, 3, 1, 2800000),
(5, 4, 2, 3900000),
(5, 7, 2, 2500000),
(6, 2, 1, 5200000),
(7, 6, 1, 4800000),
(7, 8, 1, 4200000),
(8, 4, 1, 3900000);

-- Dữ liệu cho Cart
INSERT INTO cart (customer_id, product_id, quantity) VALUES
(1, 5, 1),
(1, 7, 2),
(2, 4, 1),
(3, 6, 1),
(4, 1, 1),
(4, 3, 1),
(5, 8, 1),
(6, 2, 1),
(7, 9, 2);

-- Dữ liệu cho Reviews
INSERT INTO reviews (product_id, customer_id, order_id, rating, comment, status) VALUES
(1, 1, 1, 5, 'Giày rất thoải mái, chạy bộ cả ngày không mỏi chân. Đáng đồng tiền bát gạo!', 'approved'),
(1, 5, 5, 4, 'Chất lượng tốt nhưng giá hơi cao. Tuy nhiên vẫn đáng mua.', 'approved'),
(2, 3, 3, 5, 'Giày bóng đá tuyệt vời! Độ bám bóng và kiểm soát rất tốt.', 'approved'),
(3, 1, 1, 5, 'Stan Smith là classic! Đi với mọi outfit đều đẹp.', 'approved'),
(3, 4, 4, 4, 'Giày đẹp, form chuẩn. Chỉ hơi dễ bẩn thôi.', 'approved'),
(4, 5, 5, 5, 'Giày bóng rổ tốt nhất từng dùng. Đệm êm, bám sân cực tốt.', 'approved'),
(5, 8, 8, 4, 'Giày chạy bộ tốt cho cự ly dài. Hơi nặng một chút.', 'approved'),
(6, 3, 7, 5, 'Speedflow xứng đáng với cái tên. Nhẹ và nhanh!', 'approved'),
(7, 1, 5, 5, 'Superstar không bao giờ lỗi mốt. Must have item!', 'approved'),
(8, 5, 7, 4, 'Giày Harden đẹp và chất lượng tốt. Giá hợp lý.', 'approved');
