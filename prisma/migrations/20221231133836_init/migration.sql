/*
  Warnings:

  - You are about to drop the `meeting_schedule_present` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `meeting_schedule_present` DROP FOREIGN KEY `meeting_schedule_present_meeting_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `meeting_schedule_present` DROP FOREIGN KEY `meeting_schedule_present_user_id_fkey`;

-- DropTable
DROP TABLE `meeting_schedule_present`;
