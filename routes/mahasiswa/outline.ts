import Validator from 'fastest-validator';
import { Next, ParameterizedContext } from 'koa';

import { PrismaClient } from '@prisma/client';

import { ERROR_TYPE_VALIDATION } from '../../utils/constant';

const prisma = new PrismaClient();
const validator = new Validator();

export class MahasiswaOutlineController {
  public static async get(ctx: ParameterizedContext, next: Next) {
    const result = await prisma.studentOutline.findMany({
      include: { outline: true, user: true },
    });
    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async getById(ctx: ParameterizedContext, next: Next) {
    const { id } = ctx.params;
    const result = await prisma.studentOutline.findUnique({
      include: { outline: true, user: true },
      where: { id: +id },
    });
    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async getByUserId(ctx: ParameterizedContext, next: Next) {
    const { user_id } = ctx.params;
    const result = await prisma.studentOutline.findUnique({
      include: { outline: true, user: true },
      where: { user_id: +user_id },
    });
    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async upsert(ctx: ParameterizedContext, next: Next) {
    try {
      const { user_id, outline_id } = ctx.request.body;

      const createSchema = validator.compile({
        user_id: { type: "number" },
        outline_id: { type: "number" },
      });
      const validate = await createSchema({
        user_id: +user_id,
        outline_id: +outline_id,
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
        outline_id,
        user_id,
      };
      const upsert = await prisma.studentOutline.upsert({
        where: { user_id: +user_id },
        create: data,
        update: data,
      });

      return (ctx.body = {
        data: upsert,
        success: true,
        message: `Berhasil menyimpan outline`,
      });
    } catch (e: any) {
      ctx.status = 500;
      const message = e?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }
}
