import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductDiscount1730270000000 implements MigrationInterface {
  name = "AddProductDiscount1730270000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!await queryRunner.hasColumn("products", "discount_percent")) {
      await queryRunner.query(
        "ALTER TABLE `products` ADD `discount_percent` tinyint unsigned NOT NULL DEFAULT 0"
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("products", "discount_percent")) {
      await queryRunner.query("ALTER TABLE `products` DROP COLUMN `discount_percent`");
    }
  }
}
