import Validator from "fastest-validator";
import { Next, ParameterizedContext } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";

const prisma = new PrismaClient();
const validator = new Validator();

export class DosenGroupController {
  public static async get(ctx: ParameterizedContext, next: Next) {
    const result = await prisma.group.findMany();
    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async getById(ctx: ParameterizedContext, next: Next) {
    const { id } = ctx.params;
    
    const result = await prisma.group.findUnique({
      where: { id: +id },
      include: { group_member: true },
    });

    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async getByCode(ctx: ParameterizedContext, next: Next) {
    const { code } = ctx.params;
    const result = await prisma.group.findUnique({ where: { code: code } });
    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async getActiveGroup(ctx: ParameterizedContext, next: Next) {
    const { user_id } = ctx.params;
    const result = await prisma.lectureGroupActive.findUnique({
      where: { user_id: +user_id },
      select: { group: true },
    });

    return (ctx.body = {
      success: true,
      data: result?.group,
    });
  }

  public static async create(ctx: ParameterizedContext, next: Next) {
    try {
      const { name, code, description, created_by } = ctx.request.body;

      const createSchema = validator.compile({
        name: { type: "string" },
        code: { type: "string" },
        created_by: { type: "number" },
      });
      const validate = await createSchema({
        name,
        code,
        created_by: +created_by,
      });

      if (validate !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }

      const user = await prisma.users.findFirst({
        where: { id: +created_by },
        include: { app_group_user: true },
      });

      const codeDosen = "dosen";
      if (user?.app_group_user.code != codeDosen) {
        ctx.status = 401;
        return (ctx.body = {
          success: false,
          message: "Hanya group user dosen yang boleh menambah kelompok",
        });
      }

      const data = {
        name,
        code,
        description,
        created_by: +created_by,
      };

      const transaction = await prisma.$transaction(async (trx) => {
        /// Create Group
        const create = await trx.group.create({
          data: data,
        });

        /// Join Group
        const createMember = await trx.groupMember.create({
          data: {
            group_id: create.id,
            user_id: +created_by,
          },
        });
        /// Set Active Group
        const setActiveGroup = await trx.lectureGroupActive.upsert({
          where: { user_id: +created_by },
          create: { user_id: +created_by, group_id: create.id },
          update: { user_id: +created_by, group_id: create.id },
        });

        return create;
      });

      return (ctx.body = {
        data: transaction,
        success: true,
        message: `Berhasil membuat group dengan nama ${transaction.name}`,
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

  public static async update(ctx: ParameterizedContext, next: Next) {
    try {
      const { id } = ctx.params;
      const { name, code, description } = ctx.request.body;

      const createSchema = validator.compile({
        id: { type: "number" },
        name: { type: "string" },
        code: { type: "string" },
      });
      const validate = await createSchema({
        id: +id,
        name,
        code,
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
        name,
        code,
        description,
      };

      const create = await prisma.group.update({
        data: data,
        where: { id: +id },
      });

      return (ctx.body = {
        data: create,
        success: true,
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

  public static async delete(ctx: ParameterizedContext, next: Next) {
    try {
      const { id } = ctx.params;
      const del = await prisma.group.delete({ where: { id: +id } });
      return (ctx.body = {
        data: del,
        success: true,
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
