import Validator from "fastest-validator";
import { Next, ParameterizedContext } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { IRouterParamContext } from "koa-router";
import { KoaContext } from "../../utils/types";

const prisma = new PrismaClient();
const validator = new Validator();

export class MahasiswaGroupController {
  public static async getByUserId(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;

    const groupMember = await prisma.groupMember.findFirst({
      where: {
        user_id: +user_id,
      },
    });

    if (!groupMember) {
      return (ctx.body = {
        success: true,
        message: "Kelompok tidak ditemukan",
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
            user: {
              select: {
                id: true,
                app_group_user_id: true,
                name: true,
                email: true,
                username: true,
                phone: true,
              },
            },
          },
          orderBy: {
            is_admin: "desc",
          },
        },
      },
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil mendapatkan kelompok",
      data: result,
    });
  }

  public static async searchByGroupCode(ctx: KoaContext, next: Next) {
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
      return (ctx.body = {
        success: true,
        message: `Kelompok dengan code ${group_code} tidak ditemukan`,
        data: null,
      });
    }

    return (ctx.body = {
      success: true,
      message: "Berhasil mendapatkan kelompok",
      data: result,
    });
  }

  public static async join(ctx: KoaContext, next: Next) {
    try {
      const { group_id, user_id } = ctx.request.body;

      const createSchema = validator.compile({
        group_id: { type: "number" },
        user_id: { type: "number" },
      });
      const validate = await createSchema({
        group_id: +group_id,
        user_id: +user_id,
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

  public static async exit(ctx: KoaContext, next: Next) {
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
        where: { user_id: +user_id },
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
