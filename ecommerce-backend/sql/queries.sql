USE shopeasy_db;


SELECT
  (SELECT COUNT(*) FROM products) AS product_count,
  (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customer_count,
  (SELECT COUNT(*) FROM orders) AS order_count,
  (SELECT COUNT(*) FROM payments) AS payment_count,
  (SELECT COUNT(*) FROM payments WHERE payment_status = 'paid') AS paid_payment_count;


SELECT p.product_id, p.product_name, c.category_name, p.price, p.discount_percent,
       p.stock, p.delivery_date, p.status
FROM products AS p
JOIN categories AS c ON c.category_id = p.category_id
ORDER BY p.product_name;


SELECT c.category_id, c.category_name, c.description, c.status,
       COUNT(p.product_id) AS product_count
FROM categories AS c
LEFT JOIN products AS p ON p.category_id = c.category_id
GROUP BY c.category_id, c.category_name, c.description, c.status
ORDER BY c.category_name;


SELECT user_id, name, email, phone, created_at
FROM users
WHERE role = 'customer'
ORDER BY created_at DESC;

SELECT o.order_id, o.created_at, o.order_status, o.total_amount,
       u.user_id, u.name AS customer_name, u.email,
       a.address, a.city, a.state, a.pincode
FROM orders AS o
JOIN users AS u ON u.user_id = o.user_id
JOIN addresses AS a ON a.address_id = o.address_id
ORDER BY o.created_at DESC;


SELECT oi.order_id, oi.order_item_id, p.product_name,
       oi.quantity, oi.price, (oi.quantity * oi.price) AS line_total
FROM order_items AS oi
JOIN products AS p ON p.product_id = oi.product_id
WHERE oi.order_id = 1
ORDER BY oi.order_item_id;

SELECT oi.order_id, oi.order_item_id, p.product_name,
       oi.quantity, oi.price, (oi.quantity * oi.price) AS line_total
FROM order_items AS oi
JOIN orders AS o ON o.order_id = oi.order_id
JOIN products AS p ON p.product_id = oi.product_id
WHERE oi.order_id = 1 AND o.user_id = 1
ORDER BY oi.order_item_id;


SELECT pay.payment_id, pay.order_id, pay.payment_method,
       pay.payment_status, pay.amount, pay.transaction_id, pay.created_at,
       u.name AS customer_name
FROM payments AS pay
JOIN orders AS o ON o.order_id = pay.order_id
JOIN users AS u ON u.user_id = o.user_id
ORDER BY pay.created_at DESC;


SELECT pay.payment_id, pay.order_id, pay.payment_method,
       pay.payment_status, pay.amount, pay.transaction_id
FROM payments AS pay
JOIN orders AS o ON o.order_id = pay.order_id
WHERE pay.order_id = 1 AND o.user_id = 1;

 
SELECT product_id, product_name, stock, status
FROM products
WHERE stock <= 5
ORDER BY stock ASC, product_name;


SELECT p.product_id, p.product_name, p.description, p.price, p.discount_percent,
       p.stock, p.delivery_date, p.image,
       c.category_id, c.category_name
FROM products AS p
JOIN categories AS c ON c.category_id = p.category_id
WHERE p.status = 'active' AND c.status = 'active'
ORDER BY p.product_name;


SELECT p.product_id, p.product_name, p.description, p.price, p.discount_percent,
       p.stock, p.delivery_date, p.image
FROM products AS p
JOIN categories AS c ON c.category_id = p.category_id
WHERE p.category_id = 1
  AND p.status = 'active'
  AND c.status = 'active'
ORDER BY p.product_name;


SELECT ci.cart_item_id, p.product_id, p.product_name, p.image,
       ROUND(p.price * (100 - p.discount_percent) / 100, 2) AS price,
       ci.quantity,
       (ROUND(p.price * (100 - p.discount_percent) / 100, 2) * ci.quantity) AS line_total
FROM carts AS c
JOIN cart_items AS ci ON ci.cart_id = c.cart_id
JOIN products AS p ON p.product_id = ci.product_id
WHERE c.user_id = 1
ORDER BY ci.cart_item_id;


SELECT p.product_id, p.product_name, p.price, p.discount_percent,
       p.delivery_date, p.image, wi.created_at
FROM wishlists AS w
JOIN wishlist_items AS wi ON wi.wishlist_id = w.wishlist_id
JOIN products AS p ON p.product_id = wi.product_id
WHERE w.user_id = 1
ORDER BY wi.created_at DESC;


SELECT address_id, address, city, state, pincode
FROM addresses
WHERE user_id = 1
ORDER BY address_id DESC;


SELECT o.order_id, o.created_at, o.order_status, o.total_amount,
       COUNT(oi.order_item_id) AS item_count
FROM orders AS o
LEFT JOIN order_items AS oi ON oi.order_id = o.order_id
WHERE o.user_id = 1
GROUP BY o.order_id, o.created_at, o.order_status, o.total_amount
ORDER BY o.created_at DESC;


SELECT user_id, name, email, phone, created_at, updated_at
FROM users
WHERE user_id = 1 AND role = 'customer';
