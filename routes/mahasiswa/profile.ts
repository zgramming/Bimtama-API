import Validator from "fastest-validator";
import { Next } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { KoaContext } from "../../utils/types";
import { generateToken } from "../../utils/token";

const prisma = new PrismaClient();
const validator = new Validator();

export class MahasiswaProfileController {
  public static async getById(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;
    const result = await prisma.users.findUnique({
      select: {
        id: true,
        app_group_user_id: true,
        username: true,
        name: true,
        phone: true,
        email: true,
      },
      where: {
        id: +user_id,
      },
    });

    if (!result) {
      ctx.status = 404;
      return (ctx.body = {
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return (ctx.body = {
      success: true,
      message: `Berhasil mendapatkan profile ${result.name}`,
      data: result,
    });
  }

  public static async update(ctx: KoaContext, next: Next) {
    try {
      const { user_id, name, phone, image } = ctx.request.body;

      const createSchema = validator.compile({
        user_id: { type: "number" },
        name: { type: "string" },
      });
      const validate = await createSchema({
        user_id: +user_id,
        name,
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

      const update = await prisma.users.update({
        select: {
          id: true,
          app_group_user_id: true,
          username: true,
          name: true,
          phone: true,
          email: true,
          app_group_user: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        where: {
          id: +user_id,
        },
        data: {
          phone: phone,
          name: name,
        },
      });

      return (ctx.body = {
        success: true,
        message: "Berhasil update profile",
        token: generateToken(update),
        data: update,
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
