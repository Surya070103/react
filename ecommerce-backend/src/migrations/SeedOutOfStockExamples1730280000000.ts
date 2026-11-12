import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedOutOfStockExamples1730280000000 implements MigrationInterface {
  name = "SeedOutOfStockExamples1730280000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`product_stock_173028_backup\` (
        \`id\` int NOT NULL,
        \`stock\` int unsigned NOT NULL,
        PRIMARY KEY (\`id\`)
      )
    `);
    await queryRunner.query(`
      INSERT INTO \`product_stock_173028_backup\` (\`id\`, \`stock\`)
      SELECT \`id\`, \`stock\` FROM \`products\`
    `);
    await queryRunner.query(`
      UPDATE \`products\`
      SET \`stock\` = CASE WHEN MOD(\`id\`, 6) = 0 THEN 0 ELSE 12 END
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`products\` p
      JOIN \`product_stock_173028_backup\` b ON b.\`id\` = p.\`id\`
      SET p.\`stock\` = b.\`stock\`
    `);
    await queryRunner.query("DROP TABLE `product_stock_173028_backup`");
  }
}
