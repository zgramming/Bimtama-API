import { Next, ParameterizedContext } from "koa";

import { CommonStatus, PrismaClient } from "@prisma/client";
import { KoaContext } from "../../utils/types";

const prisma = new PrismaClient();
export class SettingMenuController {
  public static async getMenu(ctx: KoaContext, next: Next) {
    const {
      app_modul_id = 0,
      name = "",
      code = "",
      status = "active",
      limit,
      offset,
    }: {
      app_modul_id?: number;
      name?: string;
      code?: string;
      status?: CommonStatus;
      limit?: number;
      offset?: number;
    } = ctx.query;

    const result = await prisma.appMenu.findMany({
      where: {
        ...(app_modul_id && { app_modul_id: +app_modul_id }),
        ...(name && { name: { contains: name } }),
        ...(code && { code: { contains: code } }),
        ...(status && { status: { equals: status } }),
      },
      ...(limit && limit != 0 && { take: +limit }),
      ...(offset && offset != 0 && { skip: +offset }),
      include: {
        menu_parent: true,
        app_modul: true,
        access_menu: true,
        menu_childrens: true,
      },
      orderBy: [
        {
          app_modul_id: "asc",
        },
        { order: "asc" },
      ],
    });
    return (ctx.body = { success: true, data: result });
  }

  public static async createMenu(ctx: KoaContext, next: Next) {
    try {
      const {
        app_modul_id = 0,
        app_menu_id_parent,
        code = "",
        name = "",
        route = "",
        order = 0,
        icon,
        status = "active",
      }: {
        app_modul_id?: number;
        app_menu_id_parent?: number;
        code?: string;
        name?: string;
        route?: string;
        order?: number;
        icon?: string;
        status?: CommonStatus;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      if (app_modul_id == 0) ctx.throw("Modul required", 400);
      if (code == "") ctx.throw("Code required", 400);
      if (name == "") ctx.throw("Name required", 400);
      if (route == "") ctx.throw("Route required", 400);

      const result = await prisma.appMenu.create({
        data: {
          app_modul_id: +app_modul_id,
          app_menu_id_parent: app_menu_id_parent && +app_menu_id_parent,
          code: code,
          name: name,
          route: route,
          icon: icon,
          order: +order,
          status: status,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil membuat menu dengan nama " + name,
      });
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      return (ctx.body = {
        success: false,
        message: error.message,
      });
    }
  }

  public static async updateMenu(ctx: KoaContext, next: Next) {
    try {
      const { id = 0 }: { id?: number } = ctx.params;
      const {
        app_modul_id = 0,
        app_menu_id_parent = 0,
        code = "",
        name = "",
        route = "",
        order = 0,
        icon,
        status = "active",
      }: {
        app_modul_id?: number;
        app_menu_id_parent?: number;
        code?: string;
        name?: string;
        route?: string;
        order?: number;
        icon?: string;
        status?: CommonStatus;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      if (id == 0) ctx.throw("ID required", 400);
      if (app_modul_id == 0) ctx.throw("Modul required", 400);
      if (code == "") ctx.throw("Code required", 400);
      if (name == "") ctx.throw("Name required", 400);
      if (route == "") ctx.throw("Route required", 400);

      const result = await prisma.appMenu.update({
        where: { id: +id },
        data: {
          app_modul_id: +app_modul_id,
          ...(app_menu_id_parent && {
            app_menu_id_parent: app_menu_id_parent,
          }),
          code: code,
          name: name,
          route: route,
          icon: icon,
          order: +order,
          status: status,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil mengupdate menu dengan nama " + name,
      });
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      return (ctx.body = {
        success: false,
        message: error.message,
      });
    }
  }

  public static async deleteMenu(ctx: KoaContext, next: Next) {
    try {
      const { id = 0 }: { id?: number } = ctx.params;
      if (id == 0) ctx.throw("ID is required", 400);
      const result = await prisma.appMenu.delete({
        where: { id: +id },
      });

      ctx.status = 200;
      return (ctx.body = {
        success: true,
        message: "Berhasil menghapus Menu",
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
