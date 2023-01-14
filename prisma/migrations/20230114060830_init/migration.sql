/*
  Warnings:

  - A unique constraint covering the columns `[token_firebase]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `token_firebase` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_token_firebase_key` ON `users`(`token_firebase`);
