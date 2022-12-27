/*
  Warnings:

  - You are about to drop the `lecture_preference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `lecture_preference`;

-- CreateTable
CREATE TABLE `lecture_group_active` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `group_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `lecture_group_active_user_id_key`(`user_id`),
    UNIQUE INDEX `lecture_group_active_group_id_key`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `group` ADD CONSTRAINT `group_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture_group_active` ADD CONSTRAINT `lecture_group_active_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture_group_active` ADD CONSTRAINT `lecture_group_active_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
