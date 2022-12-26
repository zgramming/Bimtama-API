import { Next, ParameterizedContext } from "koa";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AdminOutlineComponentController {
  public static async get(ctx: ParameterizedContext, next: Next) {
    const result = await prisma.outlineComponent.findMany();
    return (ctx.body = {
      success: true,
      data: result,
    });
  }
  public static async getById(ctx: ParameterizedContext, next: Next) {
    const { id } = ctx.params;
    if (!id) {
      ctx.status = 400;
      return (ctx.body = {
        success: false,
        message: "Required ID",
      });
    }

    const result = await prisma.outlineComponent.findFirst({
      where: { id: id },
    });

    return (ctx.body = {
      success: true,
      data: result,
    });
  }
  public static async getByOutlineId(ctx: ParameterizedContext, next: Next) {
    const { outline_id } = ctx.params;
    if (!outline_id) {
      ctx.status = 400;
      return (ctx.body = {
        success: false,
        message: "Required Outline ID",
      });
    }
    const result = await prisma.outlineComponent.findMany({
      where: { outline_id: outline_id },
    });

    return (ctx.body = {
      success: true,
      data: result,
    });
  }
}
