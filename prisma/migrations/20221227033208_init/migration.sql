-- CreateTable
CREATE TABLE `group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `image` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `group_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_member` (
    `id` VARCHAR(191) NOT NULL,
    `group_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `is_admin` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `group_member` ADD CONSTRAINT `group_member_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_member` ADD CONSTRAINT `group_member_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
