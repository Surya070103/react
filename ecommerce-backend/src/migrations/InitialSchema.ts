import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1730190000000 implements MigrationInterface {
  name = "InitialSchema1730190000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`phoneno\` bigint NOT NULL,
        \`status\` varchar(255) NOT NULL DEFAULT 'active',
        \`orders\` int NOT NULL DEFAULT 0,
        \`joined\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`actions\` varchar(255) NULL,
        CONSTRAINT \`UQ_users_email\` UNIQUE (\`email\`),
        PRIMARY KEY (\`id\`)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(120) NOT NULL,
        \`category\` varchar(60) NOT NULL,
        \`description\` varchar(1000) NOT NULL,
        \`price\` decimal(12, 2) NOT NULL,
        \`image_url\` varchar(500) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        CONSTRAINT \`UQ_products_name\` UNIQUE (\`name\`),
        PRIMARY KEY (\`id\`)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`carts\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`cart_key\` varchar(36) NOT NULL,
        \`items\` json NOT NULL,
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        CONSTRAINT \`UQ_carts_cart_key\` UNIQUE (\`cart_key\`),
        PRIMARY KEY (\`id\`)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`customer_id\` int NULL,
        \`customer_name\` varchar(255) NOT NULL,
        \`customer_email\` varchar(255) NOT NULL,
        \`total\` decimal(12, 2) NOT NULL,
        \`items\` json NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `orders`');
    await queryRunner.query('DROP TABLE `carts`');
    await queryRunner.query('DROP TABLE `products`');
    await queryRunner.query('DROP TABLE `users`');
  }
}
