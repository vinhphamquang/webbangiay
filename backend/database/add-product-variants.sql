-- Tạo bảng product_variants để quản lý size và màu sắc
USE quanlyshopgiay;

-- Tạo bảng variants
CREATE TABLE IF NOT EXISTS product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    color_code VARCHAR(20),
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_variant (product_id, size, color)
);

-- Thêm index
CREATE INDEX idx_product_id ON product_variants(product_id);
CREATE INDEX idx_stock ON product_variants(stock);

-- Cập nhật bảng cart để lưu variant_id thay vì size
ALTER TABLE cart 
ADD COLUMN variant_id INT NULL AFTER product_id,
ADD COLUMN color VARCHAR(50) NULL AFTER size,
ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;

-- Cập nhật bảng order_items để lưu variant_id
ALTER TABLE order_items 
ADD COLUMN variant_id INT NULL AFTER product_id,
ADD COLUMN color VARCHAR(50) NULL AFTER size,
ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

SELECT 'Đã tạo bảng product_variants thành công!' as message;
