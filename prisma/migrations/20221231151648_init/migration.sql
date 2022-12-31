/*
  Warnings:

  - A unique constraint covering the columns `[meeting_schedule_id]` on the table `meeting_schedule_personal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `meeting_schedule_personal_meeting_schedule_id_key` ON `meeting_schedule_personal`(`meeting_schedule_id`);
