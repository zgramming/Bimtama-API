import Validator from "fastest-validator";
import { Next, ParameterizedContext } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";

const prisma = new PrismaClient();
const validator = new Validator();

export class DosenGroupMemberController {
  public static async get(ctx: ParameterizedContext, next: Next) {
    const result = await prisma.groupMember.findMany({
      include: { user: true, group: true },
    });

    return (ctx.body = {
      data: result,
      success: true,
    });
  }

  public static async getById(ctx: ParameterizedContext, next: Next) {
    const { id } = ctx.params;
    const result = await prisma.groupMember.findUnique({
      include: { user: true, group: true },
      where: { id: id },
    });

    return (ctx.body = {
      data: result,
      success: true,
    });
  }

  public static async getByGroupId(ctx: ParameterizedContext, next: Next) {
    const { group_id } = ctx.params;
    const result = await prisma.groupMember.findMany({
      include: { user: true, group: true },
      where: { group_id: +group_id },
    });

    return (ctx.body = {
      data: result,
      success: true,
    });
  }

  public static async getByGroupCode(ctx: ParameterizedContext, next: Next) {
    const { group_code } = ctx.params;
    const result = await prisma.groupMember.findMany({
      include: { user: true, group: true },
      orderBy: { is_admin: "desc" },
      where: { group: { code: group_code } },
    });

    return (ctx.body = {
      data: result,
      success: true,
    });
  }

  public static async join(ctx: ParameterizedContext, next: Next) {
    try {
      const { user_id, group_code } = ctx.request.body;

      const createSchema = validator.compile({
        user_id: { type: "number" },
        group_code: { type: "string" },
      });
      const validate = await createSchema({
        user_id,
        group_code,
      });

      if (validate !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }

      const user = await prisma.users.findUnique({ where: { id: +user_id } });

      if (!user) {
        ctx.status = 404;
        return (ctx.body = {
          success: false,
          message: "User tidak ditemukan",
        });
      }

      const group = await prisma.group.findUnique({
        where: { code: group_code },
      });

      if (!group) {
        ctx.status = 404;
        return (ctx.body = {
          success: false,
          message: `Group dengan code ${group_code} tidak ditemukan`,
        });
      }

      const dataJoin = {
        group_id: group.id,
        user_id: user.id,
        is_admin: false,
      };

      const upsert = await prisma.groupMember.upsert({
        where: { group_id_user_id: { group_id: group.id, user_id: user.id } },
        create: dataJoin,
        update: dataJoin,
      });

      return (ctx.body = {
        success: true,
        message: `Berhasil join kedalam group ${group.name}`,
        data: upsert,
      });
    } catch (error: any) {
      ctx.status = 500;
      const message = error?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }
}
