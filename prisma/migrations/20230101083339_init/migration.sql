/*
  Warnings:

  - A unique constraint covering the columns `[user_id,mst_outline_component_id]` on the table `student_guidance_progress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `student_guidance_progress_user_id_mst_outline_component_id_key` ON `student_guidance_progress`(`user_id`, `mst_outline_component_id`);
