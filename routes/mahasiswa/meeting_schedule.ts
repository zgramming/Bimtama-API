import { Next } from "koa";

import { MeetingScheduleType, PrismaClient } from "@prisma/client";
import { PrismaClientValidationError } from "@prisma/client/runtime";
import { KoaContext } from "../../utils/types";

const prisma = new PrismaClient();

export class MahasiswaMeetingScheduleController {
  public static async getByUserId(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;

    const groupMember = await prisma.groupMember.findFirst({
      where: {
        user_id: +user_id,
      },
    });

    if (!groupMember) {
      ctx.status = 404;
      return (ctx.body = {
        success: true,
        message: "Mahasiswa belum mempunyai kelompok",
      });
    }

    const result = await prisma.meetingSchedule.findMany({
      include: {
        group: true,
        meeting_schedule_present: true,
      },
      where: { group_id: +groupMember.group_id },
    });

    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async getByUserIdAndType(ctx: KoaContext, next: Next) {
    try {
      const { user_id, type } = ctx.params;

      const groupMember = await prisma.groupMember.findFirst({
        where: {
          user_id: +user_id,
        },
      });

      if (!groupMember) {
        ctx.status = 404;
        return (ctx.body = {
          success: true,
          message: "Mahasiswa belum mempunyai kelompok",
        });
      }

      const result = await prisma.meetingSchedule.findMany({
        include: {
          group: true,
          meeting_schedule_present: true,
        },
        orderBy: {
          start_date: "desc",
        },
        where: {
          group_id: +groupMember.group_id,
          type: type as unknown as MeetingScheduleType,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
      });
    } catch (error: any) {
      ctx.status = 500;
      let message = error?.message || "Unknown Error Message";

      if (error instanceof PrismaClientValidationError) {
        ctx.status = 400;
      }

      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }
}
