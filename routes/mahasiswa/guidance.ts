import Validator from "fastest-validator";
import { Next, ParameterizedContext } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";

const prisma = new PrismaClient();
const validator = new Validator();

export class MahasiswaGuidanceController {
  public static async getOutline(ctx: ParameterizedContext, next: Next) {
    const { user_id } = ctx.params;
    const outline = await prisma.studentOutline.findUnique({
      include: {
        user: true,
        outline: {
          include: {
            master_outline: true,
            outline_component: {
              include: {
                master_outline_component: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      where: { user_id: +user_id },
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil mendapatkan outline",
      data: outline,
    });
  }
}
