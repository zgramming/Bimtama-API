import Validator from "fastest-validator";
import { Next, ParameterizedContext } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { sendMultipleNotification } from "../../utils/firebase_messaging";
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

      const transaction = await prisma.$transaction(async (trx) => {
        const upsert = await prisma.groupMember.upsert({
          where: {
            group_id_user_id: { group_id: +group_id, user_id: +user_id },
          },
          create: data,
          update: data,
        });

        // Send notification to group member
        const tokens = (
          await trx.groupMember.findMany({
            select: {
              user: {
                select: {
                  token_firebase: true,
                },
              },
            },
            where: {
              group_id: +group_id,
              user_id: { not: +user_id },
              user: {
                token_firebase: { not: null },
              },
            },
          })
        ).map((item) => item.user.token_firebase ?? "");

        const user = await trx.users.findUniqueOrThrow({
          where: { id: +user_id },
        });

        const sendNotification = await sendMultipleNotification(tokens, {
          title: `💁‍♂️ ${user.name} telah bergabung ke dalam kelompok`,
          body: `Kamu dapat melihatnya di menu kelompok`,
        });

        return { upsert };
      });

      return (ctx.body = {
        success: true,
        message: `Berhasil masuk ke dalam kelompok`,
        data: transaction.upsert,
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

      /// When exit group, delete group member and guidance by user_id
      const transaction = await prisma.$transaction(async (trx) => {
        const delGroupMember = await trx.groupMember.delete({
          where: {
            group_id_user_id: { group_id: +group_id, user_id: +user_id },
          },
        });

        const delGuidance = await trx.guidance.deleteMany({
          where: { user_id: +user_id },
        });

        /// Send notification to group member
        const tokens = (
          await trx.groupMember.findMany({
            select: {
              user: {
                select: {
                  token_firebase: true,
                },
              },
            },
            where: {
              group_id: +group_id,
              user_id: { not: +user_id },
              user: {
                token_firebase: { not: null },
              },
            },
          })
        ).map((item) => item.user.token_firebase ?? "");

        const user = await trx.users.findUniqueOrThrow({
          where: { id: +user_id },
        });

        const sendNotification = await sendMultipleNotification(tokens, {
          title: `👋 ${user.name} telah keluar dari kelompok`,
          body: `Kamu sudah tidak dapat melihatnya di menu kelompok`,
        });

        return { delGroupMember, delGuidance };
      });

      return (ctx.body = {
        success: true,
        data: transaction,
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
