import { Next, ParameterizedContext } from "koa";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export class SettingAccessMenuController {
  public static async get(ctx: ParameterizedContext, next: Next) {
    const {
      app_group_user_id = 0,
      app_modul_id = 0,
      app_menu_id = 0,
    }: {
      app_group_user_id?: number;
      app_modul_id?: number;
      app_menu_id?: number;
    } = ctx.query;

    const result = await prisma.appAccessMenu.findMany({
      include: {
        app_modul: true,
        app_menu: true,
        app_group_user: true,
      },
      where: {
        ...(app_group_user_id != 0 && {
          app_group_user_id: +app_group_user_id,
        }),
        ...(app_modul_id != 0 && { app_modul_id: +app_modul_id }),
        ...(app_menu_id != 0 && { app_menu_id: +app_menu_id }),
      },
    });
    return (ctx.body = { success: true, data: result });
  }

  public static async getByUserGroup(ctx: ParameterizedContext, next: Next) {
    const { app_group_user_id } = ctx.params;
    const { route }: { route?: string } = ctx.query;
    const routeModul = !route
      ? undefined
      : "/" + route.split("/").filter((val) => val !== "")[0];

    const result = await prisma.appAccessMenu.findMany({
      include: {
        app_group_user: true,
        app_menu: {
          include: { menu_childrens: true },
        },
        app_modul: true,
      },
      where: {
        app_group_user_id: +(app_group_user_id ?? 0),
        app_modul: { pattern: routeModul },
      },
      orderBy: {
        app_menu: { order: "asc" },
      },
    });

    return (ctx.body = { success: true, data: result });
  }

  public static async create(ctx: ParameterizedContext, next: Next) {
    try {
      const {
        app_group_user_id = 0,
        access_menu = [],
      }: {
        app_group_user_id?: number;
        access_menu: Array<{
          app_group_user_id?: number;
          app_menu_id?: number;
          app_modul_id?: number;
          allowed_access: string[];
        }>;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      const removeAll = await prisma.appAccessMenu.deleteMany({
        where: {
          app_group_user_id: +app_group_user_id,
        },
      });

      const data = access_menu
        .map((val) => {
          return {
            app_group_user_id: +app_group_user_id,
            app_menu_id: +(val.app_menu_id ?? 0),
            app_modul_id: +(val.app_modul_id ?? 0),
            allowed_access: val.allowed_access ?? [],
          };
        })
        .filter((val) => val.allowed_access.length != 0);

      const result = await prisma.appAccessMenu.createMany({
        data: data,
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil membuat access menu",
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
