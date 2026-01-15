-- Add variant_id and color to order_items table
ALTER TABLE order_items 
ADD COLUMN variant_id INT AFTER product_id,
ADD COLUMN color VARCHAR(50) AFTER variant_id,
ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

-- Add color column to cart table (if not exists)
ALTER TABLE cart 
ADD COLUMN variant_id INT AFTER product_id,
ADD COLUMN color VARCHAR(50) AFTER variant_id,
ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
