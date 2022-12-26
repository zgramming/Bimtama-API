-- CreateTable
CREATE TABLE `student_outline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `outline_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `student_outline_user_id_key`(`user_id`),
    UNIQUE INDEX `student_outline_outline_id_key`(`outline_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_outline` ADD CONSTRAINT `student_outline_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_outline` ADD CONSTRAINT `student_outline_outline_id_fkey` FOREIGN KEY (`outline_id`) REFERENCES `outline`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
