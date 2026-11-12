import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedCatalogAvailability1730270000000 implements MigrationInterface {
  name = "SeedCatalogAvailability1730270000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`product_availability_173027_backup\` (
        \`id\` int NOT NULL,
        \`stock\` int unsigned NOT NULL,
        \`discount_percent\` int unsigned NOT NULL,
        \`delivery_date\` date NULL,
        PRIMARY KEY (\`id\`)
      )
    `);
    await queryRunner.query(`
      INSERT INTO \`product_availability_173027_backup\`
        (\`id\`, \`stock\`, \`discount_percent\`, \`delivery_date\`)
      SELECT \`id\`, \`stock\`, \`discount_percent\`, \`delivery_date\`
      FROM \`products\`
    `);
    await queryRunner.query(`
      UPDATE \`products\`
      SET
        \`stock\` = CASE WHEN MOD(\`id\`, 7) = 0 THEN 0 ELSE 12 END,
        \`discount_percent\` = CASE WHEN MOD(\`id\`, 7) = 3 THEN 15 ELSE 0 END,
        \`delivery_date\` = DATE_ADD(CURRENT_DATE, INTERVAL (3 + MOD(\`id\`, 5)) DAY)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`products\` p
      JOIN \`product_availability_173027_backup\` b ON b.\`id\` = p.\`id\`
      SET p.\`stock\` = b.\`stock\`,
          p.\`discount_percent\` = b.\`discount_percent\`,
          p.\`delivery_date\` = b.\`delivery_date\`
    `);
    await queryRunner.query("DROP TABLE `product_availability_173027_backup`");
  }
}
