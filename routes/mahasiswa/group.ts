import Validator from "fastest-validator";
import { Next, ParameterizedContext } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";

const prisma = new PrismaClient();
const validator = new Validator();

export class MahasiswaGroupController {
  public static async getByUserId(ctx: ParameterizedContext, next: Next) {
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

    const result = await prisma.group.findFirst({
      where: {
        id: groupMember.group_id,
      },
      include: {
        group_member: {
          include: {
            user: true,
          },
          orderBy: {
            is_admin: "desc",
          },
        },
      },
    });

    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async searchByGroupCode(ctx: ParameterizedContext, next: Next) {
    const { group_code } = ctx.params;
    const result = await prisma.group.findUnique({
      where: {
        code: group_code,
      },
      include: {
        group_member: true,
      },
    });

    if (!result) {
      ctx.status = 404;
      return (ctx.body = {
        success: false,
        data: null,
        message: `Kelompok dengan code ${group_code} tidak ditemukan`,
      });
    }

    return (ctx.body = {
      success: false,
      data: result,
    });
  }

  public static async join(ctx: ParameterizedContext, next: Next) {
    try {
      const { group_id, user_id } = ctx.request.body;

      const createSchema = validator.compile({
        group_id: { type: "number" },
        user_id: { type: "number" },
      });
      const validate = await createSchema({
        group_id,
        user_id,
      });

      if (validate !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }

      const data = {
        group_id: +group_id,
        user_id: +user_id,
        is_admin: false,
      };

      const upsert = await prisma.groupMember.upsert({
        where: { group_id_user_id: { group_id: +group_id, user_id: +user_id } },
        create: data,
        update: data,
      });

      return (ctx.body = {
        success: true,
        message: `Berhasil masuk ke dalam kelompok`,
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

  public static async exit(ctx: ParameterizedContext, next: Next) {
    try {
      const { user_id, group_id } = ctx.request.body;

      const createSchema = validator.compile({
        user_id: { type: "number" },
        group_id: { type: "number" },
      });
      const validate = await createSchema({
        user_id: +user_id,
        group_id: +group_id,
      });

      if (validate !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }
            
      const del = await prisma.groupMember.deleteMany({
        where: { user_id: user_id },
      });

      return (ctx.body = {
        success: true,
        data: del.count,
        message: "Berhasil keluar group",
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
