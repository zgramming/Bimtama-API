/*
  Warnings:

  - Added the required column `guidance_id` to the `student_guidance_progress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student_guidance_progress` ADD COLUMN `guidance_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `student_guidance_progress` ADD CONSTRAINT `student_guidance_progress_guidance_id_fkey` FOREIGN KEY (`guidance_id`) REFERENCES `guidance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
