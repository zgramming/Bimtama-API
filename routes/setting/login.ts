import { compare } from "bcrypt";
import { Next, ParameterizedContext } from "koa";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class LoginController {
  public static async login(ctx: ParameterizedContext, next: Next) {
    try {
      const { username, password } = ctx.request.body;

      const user = await prisma.users.findFirst({
        where: {
          username,
        },
        include: {
          app_group_user: {
            include: {
              access_menu: {
                include: {
                  app_menu: true,
                },
              },
            },
          },
        },
      });

      const checkPassword = await compare(password, user?.password ?? "");

      if (!user || !checkPassword) {
        ctx.throw(`Username ${username} atau password tidak valid`, 400);
      }

      if (user?.status != "active") {
        if (user?.status == "blocked") {
          ctx.throw(`Akun dengan username ${username} terblokir`, 403);
        } else if (user?.status == "process_verification") {
          ctx.throw(
            `Silahkan lanjutkan proses verifikasi email terlebih dahulu`,
            403
          );
        } else {
          ctx.throw(
            `Akun tidak aktif, silahkan hubungin admin untuk proses pemulihan akun`,
            403
          );
        }
      }

      const accessMenu = user!.app_group_user.access_menu;

      if (accessMenu.length == 0) {
        ctx.throw(
          `Username ${username} tidak mempunyai hak akses menu di aplikasi, silahkan hubungi admin`,
          403
        );
      }

      accessMenu.sort((a, b) => a.app_menu.order - b.app_menu.order);
      const firstRoute = accessMenu[0].app_menu.route;

      const resultUser = await prisma.users.findFirst({
        where: { username },
      });

      ctx.body = {
        success: true,
        message: "Success login",
        data: {
          route: firstRoute,
          user: resultUser,
        },
      };
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}
