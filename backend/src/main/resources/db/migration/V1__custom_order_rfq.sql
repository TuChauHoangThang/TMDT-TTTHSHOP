-- ============================================================
-- Migration: Custom Order RFQ Tables
-- Database: tmdt_noi_that
-- ============================================================

CREATE TABLE IF NOT EXISTS custom_order_requests (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id      BIGINT NOT NULL,
    title            VARCHAR(500) NOT NULL,
    description      TEXT NOT NULL,
    furniture_type   VARCHAR(255),
    material         VARCHAR(255),
    dimensions       VARCHAR(255),
    color_style      VARCHAR(255),
    budget_min       DECIMAL(15, 2),
    budget_max       DECIMAL(15, 2),
    deadline         DATE,
    status           ENUM('OPEN','QUOTED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'OPEN',
    selected_quote_id BIGINT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_deadline (deadline),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS custom_order_images (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_id  BIGINT NOT NULL,
    image_url   TEXT NOT NULL,

    FOREIGN KEY (request_id) REFERENCES custom_order_requests(id) ON DELETE CASCADE,
    INDEX idx_request_id (request_id)
);

CREATE TABLE IF NOT EXISTS custom_order_quotes (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_id      BIGINT NOT NULL,
    contractor_id   BIGINT NOT NULL,
    shop_id         BIGINT NOT NULL,
    quoted_price    DECIMAL(15, 2) NOT NULL,
    estimated_days  INT NOT NULL,
    note            TEXT,
    status          ENUM('PENDING','ACCEPTED','REJECTED') DEFAULT 'PENDING',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id) REFERENCES custom_order_requests(id) ON DELETE CASCADE,
    UNIQUE KEY uq_contractor_request (request_id, contractor_id),  -- Mỗi contractor chỉ báo 1 giá
    INDEX idx_request_id (request_id),
    INDEX idx_contractor_id (contractor_id),
    INDEX idx_shop_id (shop_id),
    INDEX idx_status (status)
);

-- ============================================================
-- Sample Data (for testing)
-- ============================================================

INSERT INTO custom_order_requests
    (customer_id, title, description, furniture_type, material, dimensions, color_style, budget_min, budget_max, deadline, status)
VALUES
    (1, 'Sofa góc L phòng khách màu xanh navy 3m×2m',
     'Cần sofa góc L, vải nhung cao cấp, màu xanh navy, chân gỗ sồi, phong cách hiện đại.',
     'Sofa & Ghế', 'Vải nhung, chân gỗ sồi', '3m × 2m × 0.85m', 'Xanh navy, hiện đại',
     15000000, 25000000, '2026-06-30', 'QUOTED'),

    (1, 'Tủ quần áo âm tường 4 cánh gỗ óc chó',
     'Tủ âm tường 4 cánh, gỗ óc chó thật, có đèn LED bên trong.',
     'Tủ & Kệ', 'Gỗ óc chó nguyên khối', '2.4m × 0.6m × 2.7m', 'Walnut tự nhiên',
     30000000, 50000000, '2026-07-15', 'OPEN'),

    (2, 'Kệ TV phòng khách hiện đại có tủ lưu trữ',
     'Kệ TV tích hợp tủ lưu trữ hai bên, màu trắng sữa kết hợp vân gỗ.',
     'Tủ & Kệ', 'MDF phủ veneer, sơn PU', '2.8m × 0.45m × 1.6m', 'Trắng sữa + vân gỗ sồi',
     12000000, 18000000, '2026-06-10', 'OPEN'),

    (3, 'Bộ bàn ăn 6 chỗ phong cách Indochine',
     'Bàn ăn 6 chỗ, chất liệu gỗ tràm kết hợp mây tre, phong cách Đông Dương.',
     'Bàn & Ghế', 'Gỗ tràm, mây tre', 'Bàn 180×90cm, ghế cao 45cm', 'Nâu mật ong tự nhiên',
     20000000, 35000000, '2026-05-25', 'OPEN');

-- Sample quotes for request #1
INSERT INTO custom_order_quotes (request_id, contractor_id, shop_id, quoted_price, estimated_days, note, status)
VALUES
    (1, 2, 1, 18500000, 25,
     'Sử dụng vải nhung Hàn Quốc cao cấp, đệm mút D40, khung gỗ thông nhập khẩu. Bảo hành 3 năm.', 'PENDING'),
    (1, 3, 2, 21000000, 20,
     'Vải nhung nhập khẩu Ý, màu xanh chuẩn Pantone, giao hàng và lắp đặt tận nơi TP.HCM.', 'PENDING');
