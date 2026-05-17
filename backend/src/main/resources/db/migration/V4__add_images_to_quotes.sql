-- ============================================================
-- Migration: Add image support and more shop info to quotes
-- ============================================================

-- Thêm cột chứa danh sách ảnh (JSON/TEXT) vào bảng báo giá
ALTER TABLE custom_order_quotes 
ADD COLUMN image_urls TEXT COMMENT 'JSON array of image URLs';

-- Đảm bảo bảng shops có đủ các trường cần thiết (đã có từ V2 nhưng kiểm tra lại)
-- address, logo_url đã có.
