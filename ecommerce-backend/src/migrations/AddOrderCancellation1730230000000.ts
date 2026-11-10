import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderCancellation1730230000000 implements MigrationInterface {
  name = "AddOrderCancellation1730230000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!await queryRunner.hasColumn("orders", "status")) {
      await queryRunner.query("ALTER TABLE `orders` ADD `status` varchar(20) NOT NULL DEFAULT 'placed'");
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("orders", "status")) {
      await queryRunner.query("ALTER TABLE `orders` DROP COLUMN `status`");
    }
  }
}
