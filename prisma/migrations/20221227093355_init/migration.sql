/*
  Warnings:

  - A unique constraint covering the columns `[group_id,user_id]` on the table `group_member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `group_member_group_id_user_id_key` ON `group_member`(`group_id`, `user_id`);
