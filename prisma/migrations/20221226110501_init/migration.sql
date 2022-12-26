-- CreateTable
CREATE TABLE `outline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mst_outline_id` INTEGER NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outline_component` (
    `id` VARCHAR(191) NOT NULL,
    `outline_id` INTEGER NOT NULL,
    `mst_outline_component_id` INTEGER NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `outline` ADD CONSTRAINT `outline_mst_outline_id_fkey` FOREIGN KEY (`mst_outline_id`) REFERENCES `master_data`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outline_component` ADD CONSTRAINT `outline_component_outline_id_fkey` FOREIGN KEY (`outline_id`) REFERENCES `outline`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `outline_component` ADD CONSTRAINT `outline_component_mst_outline_component_id_fkey` FOREIGN KEY (`mst_outline_component_id`) REFERENCES `master_data`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
