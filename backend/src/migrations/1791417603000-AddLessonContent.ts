import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLessonContent1791417603000 implements MigrationInterface {
  name = "AddLessonContent1791417603000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Lesson_table" ADD COLUMN "content" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Lesson_table" DROP COLUMN "content"`
    );
  }
}
