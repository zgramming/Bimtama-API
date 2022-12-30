/*
  Warnings:

  - Added the required column `updated_at` to the `guidance_detail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `guidance_detail` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `created_by` INTEGER NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `updated_by` INTEGER NULL;
