-- AddForeignKey
ALTER TABLE `meeting_schedule_personal` ADD CONSTRAINT `meeting_schedule_personal_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
