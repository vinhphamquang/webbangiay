USE quanlyshopgiay;

-- Thêm cột size vào bảng cart
ALTER TABLE cart ADD COLUMN size VARCHAR(10) DEFAULT '42' AFTER quantity;

-- Thêm cột size vào bảng order_items
ALTER TABLE order_items ADD COLUMN size VARCHAR(10) DEFAULT '42' AFTER quantity;
