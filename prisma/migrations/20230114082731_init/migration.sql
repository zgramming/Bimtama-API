-- DropIndex
DROP INDEX `users_token_firebase_key` ON `users`;

-- AlterTable
ALTER TABLE `users` MODIFY `token_firebase` TEXT NULL;
