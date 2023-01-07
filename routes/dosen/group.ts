import Validator from "fastest-validator";
import { Next } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { KoaContext } from "../../utils/types";
import { HTTP_RESPONSE_CODE } from "../../utils/http_response_code";

const prisma = new PrismaClient();
const validator = new Validator();

export class DosenGroupController {
  public static async get(ctx: KoaContext, next: Next) {
    const result = await prisma.group.findMany();
    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async getById(ctx: KoaContext, next: Next) {
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

  public static async getByCode(ctx: KoaContext, next: Next) {
    const { code } = ctx.params;
    const result = await prisma.group.findUnique({ where: { code: code } });
    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async getMyActiveGroup(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;
    const result = await prisma.lectureGroupActive.findUnique({
      where: { user_id: +user_id },
      select: { group: true },
    });

    const group = result?.group;
    if (!group) {
      ctx.status = HTTP_RESPONSE_CODE.FORBIDDEN;
      return (ctx.body = {
        success: false,
        message: "Kamu belum mempunyai kelompok yang aktif",
      });
    }

    return (ctx.body = {
      success: true,
      data: group,
    });
  }

  public static async getMyActiveGroupMember(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;
    const result = await prisma.lectureGroupActive.findUnique({
      where: { user_id: +user_id },
    });

    if (!result) {
      ctx.status = HTTP_RESPONSE_CODE.FORBIDDEN;
      return (ctx.body = {
        success: false,
        message: "Kamu belum mempunyai kelompok yang aktif",
      });
    }

    const groupMember = await prisma.groupMember.findMany({
      include: {
        user: {
          select: {
            id: true,
            app_group_user_id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      where: { group_id: result.group_id, user_id: { not: +user_id } },
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil mendapatkan group member",
      data: groupMember,
    });
  }

  public static async getMyGroup(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;
    const result = await prisma.group.findMany({
      where: {
        created_by: +user_id,
      },
    });
    return (ctx.body = {
      success: true,
      message :"Berhasil mendapatkan kelompok",
      data: result,
    });
  }

  public static async create(ctx: KoaContext, next: Next) {
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

  public static async update(ctx: KoaContext, next: Next) {
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

      const update = await prisma.group.update({
        data: data,
        where: { id: +id },
      });

      return (ctx.body = {
        data: update,
        success: true,
        message : `Berhasil mengupdate Kelompok ${update.name}`
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

  public static async delete(ctx: KoaContext, next: Next) {
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

  public static async updateActiveGroup(ctx: KoaContext, next: Next) {
    try {
      const { user_id } = ctx.params;
      const { group_id } = ctx.request.body;

      const createSchema = validator.compile({
        user_id: { type: "number" },
        group_id: { type: "number" },
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

      const update = await prisma.lectureGroupActive.update({
        include: { group: true },
        where: {
          user_id: +user_id,
        },
        data: {
          group_id: +group_id,
        },
      });

      return (ctx.body = {
        data: update,
        message: `Berhasil mengupdate ${update.group.name} menjadi kelompok aktif saya`,
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
