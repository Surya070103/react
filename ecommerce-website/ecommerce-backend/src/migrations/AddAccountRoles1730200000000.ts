import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountRoles1730200000000 implements MigrationInterface {
  name = "AddAccountRoles1730200000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!await queryRunner.hasColumn("users", "password_hash")) {
      await queryRunner.query("ALTER TABLE `users` ADD `password_hash` varchar(255) NULL");
    }
    if (!await queryRunner.hasColumn("users", "role")) {
      await queryRunner.query("ALTER TABLE `users` ADD `role` varchar(20) NOT NULL DEFAULT 'customer'");
    }
    if (!await queryRunner.hasColumn("products", "owner_user_id")) {
      await queryRunner.query("ALTER TABLE `products` ADD `owner_user_id` int NULL");
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("products", "owner_user_id")) {
      await queryRunner.query("ALTER TABLE `products` DROP COLUMN `owner_user_id`");
    }
    if (await queryRunner.hasColumn("users", "role")) {
      await queryRunner.query("ALTER TABLE `users` DROP COLUMN `role`");
    }
    if (await queryRunner.hasColumn("users", "password_hash")) {
      await queryRunner.query("ALTER TABLE `users` DROP COLUMN `password_hash`");
    }
  }
}
