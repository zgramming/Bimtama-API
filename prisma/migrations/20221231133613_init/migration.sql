-- CreateTable
CREATE TABLE `meeting_schedule_personal` (
    `id` VARCHAR(191) NOT NULL,
    `meeting_schedule_id` INTEGER NOT NULL,
    `group_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `meeting_schedule_personal` ADD CONSTRAINT `meeting_schedule_personal_meeting_schedule_id_fkey` FOREIGN KEY (`meeting_schedule_id`) REFERENCES `meeting_schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
