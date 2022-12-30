import { Next } from "koa";

import { PrismaClient } from "@prisma/client";
import { KoaContext } from "../../utils/types";

const prisma = new PrismaClient();

export class MahasiswaMentorController {
  public static async getMentorByUserId(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        user_id: +user_id,
      },
    });

    if (!groupMember) {
      ctx.status = 404;
      return (ctx.body = {
        success: false,
        data: null,
      });
    }

    const mentor = await prisma.group.findFirst({
      include: {
        group_member: {
          include: { user: true },
          where: {
            is_admin: true,
          },
        },
      },
      where: {
        id: groupMember.group_id,
      },
    });

    return (ctx.body = {
      success: true,
      data: mentor,
    });
  }
}
