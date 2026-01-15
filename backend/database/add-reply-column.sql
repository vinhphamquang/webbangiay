-- Thêm cột admin_reply và reply_date vào bảng contacts
USE quanlyshopgiay;

ALTER TABLE contacts 
ADD COLUMN admin_reply TEXT NULL AFTER message,
ADD COLUMN reply_date TIMESTAMP NULL AFTER admin_reply;

SELECT 'Đã thêm cột admin_reply và reply_date thành công!' as message;
