/*
  Warnings:

  - Added the required column `outline_id` to the `student_outline` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student_outline` ADD COLUMN `outline_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `student_outline` ADD CONSTRAINT `student_outline_outline_id_fkey` FOREIGN KEY (`outline_id`) REFERENCES `outline`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
