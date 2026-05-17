-- ============================================================
-- Migration: Seed Users and Shops Data
-- ============================================================

-- Xóa dữ liệu cũ để tránh trùng lặp nếu chạy lại (Tùy chọn)
-- DELETE FROM shops;
-- DELETE FROM users;

-- 1. Nạp Users (Mật khẩu là '123456' đã mã hóa BCrypt)
INSERT INTO users (id, full_name, email, password, phone, role, is_active, provider) VALUES
(1, 'Nguyễn Văn A', 'customer@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uXC.1.', '0901234567', 'CUSTOMER', 1, 'LOCAL'),
(2, 'Trần Thị B', 'seller@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uXC.1.', '0909876543', 'CONTRACTOR', 1, 'LOCAL'),
(3, 'Lê Văn C', 'contractor2@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uXC.1.', '0901112223', 'CONTRACTOR', 1, 'LOCAL'),
(4, 'Ngô Mộc Lâm', 'moclam@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uXC.1.', '0903334445', 'CONTRACTOR', 1, 'LOCAL'),
(5, 'Phạm Liêm Khiết', 'liemkhiet@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uXC.1.', '0905556667', 'CONTRACTOR', 1, 'LOCAL'),
(6, 'Admin TTTH', 'admin@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uXC.1.', '0900000001', 'ADMIN', 1, 'LOCAL');

-- 2. Nạp Shops cho các nhà thầu
INSERT INTO shops (owner_id, name, slug, description, address, rating, rating_count) VALUES
(2, 'Nội Thất Hiện Đại', 'noi-that-hien-dai', 'Chuyên thiết kế và thi công nội thất phong cách hiện đại.', '123 Đường ABC, Quận 1, TP.HCM', 4.8, 25),
(3, 'Mộc Decor', 'moc-decor', 'Nội thất gỗ tự nhiên cao cấp.', '456 Đường XYZ, Quận 7, TP.HCM', 4.5, 12),
(4, 'Mộc Lâm Shop', 'moc-lam-shop', 'Xưởng mộc gia truyền, chuyên đồ gỗ nội thất phòng ngủ.', '789 Đường DEF, Quận Bình Tân, TP.HCM', 4.9, 50),
(5, 'Liêm Khiết Shop', 'liem-khiet-shop', 'Nội thất giá xưởng, minh bạch chi phí, chất lượng thật.', '101 Đường GHI, Quận 12, TP.HCM', 4.7, 30);
