CREATE DATABASE IF NOT EXISTS shopeasy_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shopeasy_db;

CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email)
) ;

CREATE TABLE IF NOT EXISTS categories (
  category_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_categories_name (category_name)
) ;

CREATE TABLE IF NOT EXISTS products (
  product_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  price DECIMAL(12, 2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  discount_percent INT UNSIGNED NOT NULL DEFAULT 0,
  delivery_date DATE NULL,
  image VARCHAR(500) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  KEY idx_products_category_status (category_id, status),
  KEY idx_products_status_name (status, product_name),
  CONSTRAINT chk_products_price_nonnegative CHECK (price >= 0),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories (category_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE IF NOT EXISTS carts (
  cart_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (cart_id),
  UNIQUE KEY uq_carts_user (user_id),
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  PRIMARY KEY (cart_item_id),
  UNIQUE KEY uq_cart_items_cart_product (cart_id, product_id),
  KEY idx_cart_items_product (product_id),
  CONSTRAINT chk_cart_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts (cart_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES products (product_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE IF NOT EXISTS wishlists (
  wishlist_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (wishlist_id),
  UNIQUE KEY uq_wishlists_user (user_id),
  CONSTRAINT fk_wishlists_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS wishlist_items (
  wishlist_item_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  wishlist_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (wishlist_item_id),
  UNIQUE KEY uq_wishlist_items_wishlist_product (wishlist_id, product_id),
  KEY idx_wishlist_items_product (product_id),
  CONSTRAINT fk_wishlist_items_wishlist
    FOREIGN KEY (wishlist_id) REFERENCES wishlists (wishlist_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_items_product
    FOREIGN KEY (product_id) REFERENCES products (product_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE IF NOT EXISTS addresses (
  address_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(120) NOT NULL,
  state VARCHAR(120) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (address_id),
  KEY idx_addresses_user (user_id),
  UNIQUE KEY uq_addresses_id_user (address_id, user_id),
  CONSTRAINT fk_addresses_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ;

CREATE TABLE IF NOT EXISTS orders (
  order_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  address_id INT UNSIGNED NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  KEY idx_orders_user_created (user_id, created_at),
  KEY idx_orders_status_created (order_status, created_at),
  CONSTRAINT chk_orders_total_nonnegative CHECK (total_amount >= 0),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_orders_address_user
    FOREIGN KEY (address_id, user_id) REFERENCES addresses (address_id, user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  delivery_date DATE NULL,
  PRIMARY KEY (order_item_id),
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT chk_order_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT chk_order_items_price_nonnegative CHECK (price >= 0),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (order_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products (product_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE IF NOT EXISTS payments (
  payment_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  payment_method VARCHAR(40) NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded')
    NOT NULL DEFAULT 'pending',
  amount DECIMAL(12, 2) NOT NULL,
  transaction_id VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  UNIQUE KEY uq_payments_transaction (transaction_id),
  KEY idx_payments_status_created (payment_status, created_at),
  KEY idx_payments_order (order_id),
  CONSTRAINT chk_payments_amount_nonnegative CHECK (amount >= 0),
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders (order_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;
