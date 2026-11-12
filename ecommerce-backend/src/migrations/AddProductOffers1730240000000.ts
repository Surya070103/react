import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductOffers1730240000000 implements MigrationInterface {
  name = "AddProductOffers1730240000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!await queryRunner.hasColumn("products", "discount_percent")) {
      await queryRunner.query(
        "ALTER TABLE `products` ADD `discount_percent` int unsigned NOT NULL DEFAULT 0"
      );
    }
    if (!await queryRunner.hasColumn("products", "delivery_date")) {
      await queryRunner.query(
        "ALTER TABLE `products` ADD `delivery_date` date NULL"
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("products", "delivery_date")) {
      await queryRunner.query("ALTER TABLE `products` DROP COLUMN `delivery_date`");
    }
    if (await queryRunner.hasColumn("products", "discount_percent")) {
      await queryRunner.query("ALTER TABLE `products` DROP COLUMN `discount_percent`");
    }
  }
}
