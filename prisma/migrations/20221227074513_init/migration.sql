/*
  Warnings:

  - Made the column `created_by` on table `group` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `group` MODIFY `created_by` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `lecture_preference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `lecture_preference_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
