-- Thêm cột is_read vào bảng contacts
USE quanlyshopgiay;

ALTER TABLE contacts 
ADD COLUMN is_read BOOLEAN DEFAULT FALSE AFTER reply_date;

SELECT 'Đã thêm cột is_read thành công!' as message;
