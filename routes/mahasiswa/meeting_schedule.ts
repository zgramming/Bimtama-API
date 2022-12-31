import { Next } from "koa";

import { PrismaClient } from "@prisma/client";
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

      const isPersonal = type == "personal";
      const result = await prisma.meetingSchedule.findMany({
        include: {
          group: true,
          meeting_schedule_personal: true,
        },
        orderBy: {
          start_date: "desc",
        },
        where: {
          group_id: +groupMember.group_id,
          type: type,
          /// Jika personal, hanya tampilkan [meeting_schedule_personal] user_id == ${user_id}
          ...(isPersonal && {
            meeting_schedule_personal: {
              user_id: +user_id,
            },
          }),
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
      });
    } catch (error: any) {
      ctx.status = 500;
      let message = error?.message || "Unknown Error Message";

      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }

  public static async getMeetingPersonalByMeetingId(
    ctx: KoaContext,
    next: Next
  ) {
    const { meeting_schedule_id } = ctx.params;
    const result = await prisma.meetingSchedulePersonal.findUnique({
      include: { user: true, meeting_schedule: true },
      where: { meeting_schedule_id: +meeting_schedule_id },
    });
    return (ctx.body = {
      success: true,
      data: result,
    });
  }
}
