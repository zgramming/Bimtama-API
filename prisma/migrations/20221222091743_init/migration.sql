-- CreateTable
CREATE TABLE `app_group_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `app_group_user_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_access_menu` (
    `id` VARCHAR(191) NOT NULL,
    `app_group_user_id` INTEGER NOT NULL,
    `app_modul_id` INTEGER NOT NULL,
    `app_menu_id` INTEGER NOT NULL,
    `allowed_access` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_menu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `app_modul_id` INTEGER NOT NULL,
    `app_menu_id_parent` INTEGER NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `route` VARCHAR(100) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `icon` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_access_modul` (
    `id` VARCHAR(191) NOT NULL,
    `app_group_user_id` INTEGER NOT NULL,
    `app_modul_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_modul` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `pattern` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `app_modul_code_key`(`code`),
    UNIQUE INDEX `app_modul_pattern_key`(`pattern`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `job_id` INTEGER NOT NULL,
    `birth_date` DATETIME(3) NOT NULL,
    `money` DECIMAL(19, 4) NOT NULL,
    `hobbies` JSON NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `image` TEXT NULL,
    `file` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `documentation_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `master_category_id` INTEGER NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `master_category_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `master_data_id` INTEGER NULL,
    `master_category_id` INTEGER NOT NULL,
    `master_category_code` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `parameter1_key` VARCHAR(50) NULL,
    `parameter1_value` VARCHAR(50) NULL,
    `parameter2_key` VARCHAR(50) NULL,
    `parameter2_value` VARCHAR(50) NULL,
    `parameter3_key` VARCHAR(50) NULL,
    `parameter3_value` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `master_data_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parameter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `value` TEXT NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `parameter_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `app_group_user_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NULL,
    `email` VARCHAR(100) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` TEXT NOT NULL,
    `status` ENUM('active', 'inactive', 'blocked', 'process_verification') NOT NULL DEFAULT 'inactive',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `app_access_menu` ADD CONSTRAINT `app_access_menu_app_group_user_id_fkey` FOREIGN KEY (`app_group_user_id`) REFERENCES `app_group_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_access_menu` ADD CONSTRAINT `app_access_menu_app_modul_id_fkey` FOREIGN KEY (`app_modul_id`) REFERENCES `app_modul`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_access_menu` ADD CONSTRAINT `app_access_menu_app_menu_id_fkey` FOREIGN KEY (`app_menu_id`) REFERENCES `app_menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_menu` ADD CONSTRAINT `app_menu_app_modul_id_fkey` FOREIGN KEY (`app_modul_id`) REFERENCES `app_modul`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_menu` ADD CONSTRAINT `app_menu_app_menu_id_parent_fkey` FOREIGN KEY (`app_menu_id_parent`) REFERENCES `app_menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_access_modul` ADD CONSTRAINT `app_access_modul_app_group_user_id_fkey` FOREIGN KEY (`app_group_user_id`) REFERENCES `app_group_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_access_modul` ADD CONSTRAINT `app_access_modul_app_modul_id_fkey` FOREIGN KEY (`app_modul_id`) REFERENCES `app_modul`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentation` ADD CONSTRAINT `documentation_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `master_data`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `master_category` ADD CONSTRAINT `master_category_master_category_id_fkey` FOREIGN KEY (`master_category_id`) REFERENCES `master_category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `master_data` ADD CONSTRAINT `master_data_master_category_id_fkey` FOREIGN KEY (`master_category_id`) REFERENCES `master_category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `master_data` ADD CONSTRAINT `master_data_master_data_id_fkey` FOREIGN KEY (`master_data_id`) REFERENCES `master_data`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_app_group_user_id_fkey` FOREIGN KEY (`app_group_user_id`) REFERENCES `app_group_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
