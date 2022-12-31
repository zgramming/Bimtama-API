/*
  Warnings:

  - You are about to drop the column `outline_id` on the `student_outline` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `student_outline` DROP FOREIGN KEY `student_outline_outline_id_fkey`;

-- AlterTable
ALTER TABLE `student_outline` DROP COLUMN `outline_id`;
