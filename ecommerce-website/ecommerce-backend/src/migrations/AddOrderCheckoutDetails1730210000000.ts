import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderCheckoutDetails1730210000000 implements MigrationInterface {
  name = "AddOrderCheckoutDetails1730210000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!await queryRunner.hasColumn("orders", "shipping_address")) {
      await queryRunner.query("ALTER TABLE `orders` ADD `shipping_address` varchar(1000) NULL");
    }
    if (!await queryRunner.hasColumn("orders", "payment_method")) {
      await queryRunner.query("ALTER TABLE `orders` ADD `payment_method` varchar(30) NOT NULL DEFAULT 'cash_on_delivery'");
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("orders", "payment_method")) {
      await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `payment_method`");
    }
    if (await queryRunner.hasColumn("orders", "shipping_address")) {
      await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `shipping_address`");
    }
  }
}
