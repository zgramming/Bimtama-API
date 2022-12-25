import { Next, ParameterizedContext } from "koa";

import { CommonStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SettingModulController {
  public static async getModul(ctx: ParameterizedContext, next: Next) {
    const {
      code = "",
      name = "",
      pattern = "",
      status,
      limit,
      offset,
    }: {
      code?: string;
      name?: string;
      pattern?: string;
      status?: CommonStatus;
      limit?: number;
      offset?: number;
    } = ctx.query;

    const result = await prisma.appModul.findMany({
      where: {
        ...(code && { code: { contains: code } }),
        ...(name && { name: { contains: name } }),
        ...(pattern && { pattern: pattern }),
        ...(status && { status: status }),
      },
      include: {
        menus: true,
        access_menu: true,
        access_modul: true,
      },
      // ...(limit !== 0 && { take: +limit }),
      // ...(offset !== 0 && { skip: +offset }),
    });

    return (ctx.body = { success: true, data: result });
  }

  public static async createModul(ctx: ParameterizedContext, next: Next) {
    try {
      const {
        code = "",
        name = "",
        pattern = "",
        icon = "",
        order = 0,
        status = "active",
      }: {
        code?: string;
        name?: string;
        pattern?: string;
        icon?: string;
        order?: number;
        status?: CommonStatus;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      if (code == "") ctx.throw("Code required", 400);
      if (name == "") ctx.throw("Name required", 400);
      if (pattern == "") ctx.throw("Pattern required", 400);

      const result = await prisma.appModul.create({
        data: {
          code,
          name,
          pattern,
          icon,
          order: +order,
          status,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil membuat modul dengan nama " + name,
      });
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      return (ctx.body = {
        success: false,
        message: error.message,
      });
    }
  }

  public static async updateModul(ctx: ParameterizedContext, next: Next) {
    try {
      const { id = 0 }: { id?: number } = ctx.params;
      const {
        code = "",
        name = "",
        pattern = "",
        icon = "",
        order = 0,
        status = "active",
      }: {
        code?: string;
        name?: string;
        pattern?: string;
        icon?: string;
        order?: number;
        status?: CommonStatus;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      if (id == 0) ctx.throw("ID Required", 400);
      if (code == "") ctx.throw("Code required", 400);
      if (name == "") ctx.throw("Name required", 400);
      if (pattern == "") ctx.throw("Pattern required", 400);

      const result = await prisma.appModul.update({
        where: { id: +id },
        data: {
          code,
          name,
          pattern,
          icon,
          order: +order,
          status,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil mengupdate modul dengan nama " + name,
      });
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      return (ctx.body = {
        success: false,
        message: error.message,
      });
    }
  }

  public static async deleteModul(ctx: ParameterizedContext, next: Next) {
    try {
      const { id = 0 }: { id?: number } = ctx.params;
      if (id == 0) ctx.throw("ID is required", 400);
      const result = await prisma.appModul.delete({
        where: { id: +id },
      });

      ctx.status = 200;
      return (ctx.body = {
        success: true,
        message: "Berhasil menghapus modul",
        data: result,
      });
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      return (ctx.body = {
        success: false,
        message: error.message,
      });
    }
  }
}
