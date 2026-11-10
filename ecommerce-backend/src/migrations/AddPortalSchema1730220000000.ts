import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPortalSchema1730220000000 implements MigrationInterface {
  name = "AddPortalSchema1730220000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!await queryRunner.hasColumn("products", "category_id")) {
      await queryRunner.query("ALTER TABLE `products` ADD `category_id` int unsigned NULL");
    }
    if (!await queryRunner.hasColumn("products", "stock")) {
      await queryRunner.query("ALTER TABLE `products` ADD `stock` int unsigned NOT NULL DEFAULT 0");
    }
    if (!await queryRunner.hasColumn("products", "status")) {
      await queryRunner.query("ALTER TABLE `products` ADD `status` varchar(20) NOT NULL DEFAULT 'active'");
    }
    if (!await queryRunner.hasColumn("carts", "user_id")) {
      await queryRunner.query("ALTER TABLE `carts` ADD `user_id` int NULL");
    }
    if (!await queryRunner.hasColumn("orders", "address_id")) {
      await queryRunner.query("ALTER TABLE `orders` ADD `address_id` int NULL");
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`category_id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`category_name\` varchar(120) NOT NULL,
        \`description\` text NULL,
        \`status\` varchar(20) NOT NULL DEFAULT 'active',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`category_id\`),
        UNIQUE KEY \`uq_categories_name\` (\`category_name\`)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`addresses\` (
        \`address_id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int NOT NULL,
        \`address\` varchar(500) NOT NULL,
        \`city\` varchar(120) NOT NULL,
        \`state\` varchar(120) NOT NULL,
        \`pincode\` varchar(20) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`address_id\`),
        KEY \`idx_addresses_user\` (\`user_id\`),
        UNIQUE KEY \`uq_addresses_id_user\` (\`address_id\`, \`user_id\`),
        CONSTRAINT \`fk_addresses_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
          ON UPDATE CASCADE ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`cart_items\` (
        \`cart_item_id\` int NOT NULL AUTO_INCREMENT,
        \`cart_id\` int NOT NULL,
        \`product_id\` int NOT NULL,
        \`quantity\` int unsigned NOT NULL,
        PRIMARY KEY (\`cart_item_id\`),
        UNIQUE KEY \`uq_cart_items_cart_product\` (\`cart_id\`, \`product_id\`),
        CONSTRAINT \`fk_cart_items_cart\` FOREIGN KEY (\`cart_id\`) REFERENCES \`carts\` (\`id\`)
          ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT \`fk_cart_items_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
          ON UPDATE CASCADE ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`wishlists\` (
        \`wishlist_id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`user_id\` int NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`wishlist_id\`),
        UNIQUE KEY \`uq_wishlists_user\` (\`user_id\`),
        CONSTRAINT \`fk_wishlists_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
          ON UPDATE CASCADE ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`wishlist_items\` (
        \`wishlist_item_id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`wishlist_id\` int unsigned NOT NULL,
        \`product_id\` int NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`wishlist_item_id\`),
        UNIQUE KEY \`uq_wishlist_items_wishlist_product\` (\`wishlist_id\`, \`product_id\`),
        CONSTRAINT \`fk_wishlist_items_wishlist\` FOREIGN KEY (\`wishlist_id\`) REFERENCES \`wishlists\` (\`wishlist_id\`)
          ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT \`fk_wishlist_items_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
          ON UPDATE CASCADE ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`order_item_id\` int NOT NULL AUTO_INCREMENT,
        \`order_id\` int NOT NULL,
        \`product_id\` int NULL,
        \`product_name\` varchar(255) NOT NULL,
        \`quantity\` int unsigned NOT NULL,
        \`price\` decimal(12, 2) NOT NULL,
        PRIMARY KEY (\`order_item_id\`),
        UNIQUE KEY \`uq_order_items_order_product\` (\`order_id\`, \`product_id\`),
        KEY \`idx_order_items_order\` (\`order_id\`),
        KEY \`idx_order_items_product\` (\`product_id\`),
        CONSTRAINT \`fk_order_items_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`)
          ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT \`fk_order_items_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
          ON UPDATE CASCADE ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`payments\` (
        \`payment_id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`order_id\` int NOT NULL,
        \`payment_method\` varchar(40) NOT NULL,
        \`payment_status\` varchar(20) NOT NULL DEFAULT 'pending',
        \`amount\` decimal(12, 2) NOT NULL,
        \`transaction_id\` varchar(120) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`payment_id\`),
        UNIQUE KEY \`uq_payments_transaction\` (\`transaction_id\`),
        KEY \`idx_payments_order\` (\`order_id\`),
        KEY \`idx_payments_status_created\` (\`payment_status\`, \`created_at\`),
        CONSTRAINT \`fk_payments_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`)
          ON UPDATE CASCADE ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      INSERT IGNORE INTO \`categories\` (\`category_name\`)
      SELECT DISTINCT TRIM(\`category\`) FROM \`products\` WHERE TRIM(\`category\`) <> ''
    `);
    await queryRunner.query(`
      UPDATE \`products\` p
      JOIN \`categories\` c ON c.\`category_name\` = TRIM(p.\`category\`)
      SET p.\`category_id\` = c.\`category_id\`
      WHERE p.\`category_id\` IS NULL
    `);
    await queryRunner.query(`
      INSERT IGNORE INTO \`cart_items\` (\`cart_id\`, \`product_id\`, \`quantity\`)
      SELECT c.\`id\`, item.\`product_id\`, item.\`quantity\`
      FROM \`carts\` c
      JOIN JSON_TABLE(c.\`items\`, '$[*]' COLUMNS (
        \`product_id\` int PATH '$.productId' NULL ON ERROR,
        \`quantity\` int unsigned PATH '$.quantity' NULL ON ERROR
      )) AS item
      JOIN \`products\` p ON p.\`id\` = item.\`product_id\`
      WHERE item.\`product_id\` IS NOT NULL AND item.\`quantity\` > 0
    `);
    await queryRunner.query(`
      INSERT IGNORE INTO \`order_items\`
        (\`order_id\`, \`product_id\`, \`product_name\`, \`quantity\`, \`price\`)
      SELECT o.\`id\`, item.\`product_id\`, item.\`product_name\`, item.\`quantity\`, item.\`price\`
      FROM \`orders\` o
      JOIN JSON_TABLE(o.\`items\`, '$[*]' COLUMNS (
        \`product_id\` int PATH '$.productId' NULL ON ERROR,
        \`product_name\` varchar(255) PATH '$.name' NULL ON ERROR,
        \`quantity\` int unsigned PATH '$.quantity' NULL ON ERROR,
        \`price\` decimal(12, 2) PATH '$.price' NULL ON ERROR
      )) AS item
      JOIN \`products\` p ON p.\`id\` = item.\`product_id\`
      WHERE item.\`product_id\` IS NOT NULL AND item.\`product_name\` IS NOT NULL
        AND item.\`quantity\` > 0 AND item.\`price\` >= 0
    `);
    await queryRunner.query(`
      INSERT INTO \`payments\` (\`order_id\`, \`payment_method\`, \`payment_status\`, \`amount\`)
      SELECT o.\`id\`, o.\`payment_method\`, 'pending', o.\`total\`
      FROM \`orders\` o
      WHERE NOT EXISTS (SELECT 1 FROM \`payments\` p WHERE p.\`order_id\` = o.\`id\`)
    `);

    const categoryForeignKey = await queryRunner.query(`
      SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'products'
        AND CONSTRAINT_NAME = 'fk_products_category' AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `) as unknown[];
    if (categoryForeignKey.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`products\` ADD CONSTRAINT \`fk_products_category\`
        FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`category_id\`)
        ON UPDATE CASCADE ON DELETE RESTRICT
      `);
    }

    if (!await this.hasForeignKey(queryRunner, "carts", "fk_carts_user")) {
      await queryRunner.query(`
        ALTER TABLE \`carts\` ADD CONSTRAINT \`fk_carts_user\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON UPDATE CASCADE ON DELETE CASCADE
      `);
    }
    if (!await this.hasForeignKey(queryRunner, "orders", "fk_orders_address_customer")) {
      await queryRunner.query(`
        ALTER TABLE \`orders\` ADD CONSTRAINT \`fk_orders_address_customer\`
        FOREIGN KEY (\`address_id\`, \`customer_id\`)
        REFERENCES \`addresses\` (\`address_id\`, \`user_id\`)
        ON UPDATE CASCADE ON DELETE RESTRICT
      `);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const orders = await queryRunner.getTable("orders");
    const orderAddressForeignKey = orders?.foreignKeys.find(
      (foreignKey) => foreignKey.name === "fk_orders_address_customer"
    );
    if (orderAddressForeignKey) {
      await queryRunner.dropForeignKey("orders", orderAddressForeignKey);
    }
    const carts = await queryRunner.getTable("carts");
    const cartUserForeignKey = carts?.foreignKeys.find((foreignKey) => foreignKey.name === "fk_carts_user");
    if (cartUserForeignKey) {
      await queryRunner.dropForeignKey("carts", cartUserForeignKey);
    }
    const products = await queryRunner.getTable("products");
    const categoryForeignKey = products?.foreignKeys.find((foreignKey) => foreignKey.name === "fk_products_category");
    if (categoryForeignKey) {
      await queryRunner.dropForeignKey("products", categoryForeignKey);
    }

    for (const table of ["payments", "order_items", "wishlist_items", "wishlists", "cart_items", "addresses", "categories"]) {
      if (await queryRunner.hasTable(table)) {
        await queryRunner.dropTable(table);
      }
    }
    for (const column of ["address_id"]) {
      if (await queryRunner.hasColumn("orders", column)) {
        await queryRunner.dropColumn("orders", column);
      }
    }
    if (await queryRunner.hasColumn("carts", "user_id")) {
      await queryRunner.dropColumn("carts", "user_id");
    }
    for (const column of ["status", "stock", "category_id"]) {
      if (await queryRunner.hasColumn("products", column)) {
        await queryRunner.dropColumn("products", column);
      }
    }
  }

  private async hasForeignKey(queryRunner: QueryRunner, tableName: string, constraintName: string): Promise<boolean> {
    const constraints = await queryRunner.query(`
      SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `, [tableName, constraintName]) as unknown[];
    return constraints.length > 0;
  }
}
