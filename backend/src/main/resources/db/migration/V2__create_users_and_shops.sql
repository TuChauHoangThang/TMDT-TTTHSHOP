-- ============================================================
-- Migration: Create Users and Shops Tables
-- ============================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('CUSTOMER', 'CONTRACTOR', 'ADMIN') DEFAULT 'CUSTOMER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    provider ENUM('LOCAL', 'GOOGLE', 'FACEBOOK') DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- 2. Create Shops Table
CREATE TABLE IF NOT EXISTS shops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    address TEXT,
    logo_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_slug (slug)
);

-- 3. Add Foreign Keys to existing RFQ tables (Optional but good for integrity)
-- Note: We don't use ALTER TABLE here because V1 might have already been applied without FKs.
-- However, for a clean setup, we can add them if the data is clean.

-- ALTER TABLE custom_order_requests ADD CONSTRAINT fk_request_customer FOREIGN KEY (customer_id) REFERENCES users(id);
-- ALTER TABLE custom_order_quotes ADD CONSTRAINT fk_quote_contractor FOREIGN KEY (contractor_id) REFERENCES users(id);
-- ALTER TABLE custom_order_quotes ADD CONSTRAINT fk_quote_shop FOREIGN KEY (shop_id) REFERENCES shops(id);
