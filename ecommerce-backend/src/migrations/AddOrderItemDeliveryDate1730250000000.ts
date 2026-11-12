import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderItemDeliveryDate1730250000000 implements MigrationInterface {
  name = "AddOrderItemDeliveryDate1730250000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!await queryRunner.hasColumn("order_items", "delivery_date")) {
      await queryRunner.query("ALTER TABLE `order_items` ADD `delivery_date` date NULL");
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("order_items", "delivery_date")) {
      await queryRunner.query("ALTER TABLE `order_items` DROP COLUMN `delivery_date`");
    }
  }
}