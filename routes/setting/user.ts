import { hashSync } from "bcrypt";
import Validator from "fastest-validator";
import { Next, ParameterizedContext } from "koa";

import { PrismaClient, UserStatus } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { generateToken, setCookiesUser } from "../../utils/token";
import { KoaContext } from "../../utils/types";

const validator = new Validator();
const prisma = new PrismaClient();
const saltRounds = 10;

export class SettingUserController {
  public static async getUsers(ctx: KoaContext, next: Next) {
    const {
      username,
      name,
      app_group_user_id = 0,
      status,
      limit,
      offset,
    }: {
      username?: string;
      name?: string;
      app_group_user_id?: number;
      status?: UserStatus;
      limit?: number;
      offset?: number;
    } = ctx.query;

    const users = await prisma.users.findMany({
      include: {
        app_group_user: true,
      },
      where: {
        ...(username && { username: { contains: username } }),
        ...(name && { name: { contains: name } }),
        ...(status && { status: status }),
        ...(app_group_user_id != 0 && {
          app_group_user_id: +app_group_user_id,
        }),
      },
      // ...(limit !== 0 && { take: +limit }),
      // ...(offset !== 0 && { skip: +offset }),
    });
    return (ctx.body = { success: true, data: users });
  }

  public static async createUsers(ctx: KoaContext, next: Next) {
    try {
      const {
        app_group_user_id = 0,
        name = "",
        email = "",
        username = "",
        password = "",
        status = "active",
      }: {
        app_group_user_id?: number;
        name?: string;
        email?: string;
        username?: string;
        password?: string;
        status?: UserStatus;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      if (app_group_user_id == 0) ctx.throw("Group User required", 400);
      if (name == "") ctx.throw("Nama required", 400);
      if (email == "") ctx.throw("Email required", 400);
      if (username == "") ctx.throw("Username required", 400);
      if (password == "") ctx.throw("Password required", 400);

      const result = await prisma.users.create({
        data: {
          email: email,
          name: name,
          password: hashSync(password, saltRounds),
          username: username,
          app_group_user_id: +app_group_user_id,
          status: status,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil membuat user dengan nama " + name,
      });
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      return (ctx.body = {
        success: false,
        message: error.message,
      });
    }
  }

  public static async updateUsers(ctx: KoaContext, next: Next) {
    try {
      const { id = 0 }: { id?: number } = ctx.params;
      const {
        app_group_user_id = 0,
        name = "",
        email = "",
        username = "",
        password = "",
        status = "active",
      }: {
        app_group_user_id?: number;
        name?: string;
        email?: string;
        username?: string;
        password?: string;
        status?: UserStatus;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      if (id == 0) ctx.throw("ID Required", 400);
      if (app_group_user_id == 0) ctx.throw("Group User required", 400);
      if (name == "") ctx.throw("Nama required", 400);
      if (email == "") ctx.throw("Email required", 400);
      if (username == "") ctx.throw("Username required", 400);
      if (password == "") ctx.throw("Password required", 400);

      const result = await prisma.users.update({
        where: {
          id: +id,
        },
        data: {
          email: email,
          name: name,
          password: hashSync(password, saltRounds),
          username: username,
          app_group_user_id: +app_group_user_id,
          status: status,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil mengupdate user dengan nama " + name,
      });
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      return (ctx.body = {
        success: false,
        message: error.message,
      });
    }
  }

  public static async updateNameUsers(ctx: KoaContext, next: Next) {
    try {
      const { id } = ctx.params;
      const { name } = ctx.request.body;

      const user = await prisma.users.findFirstOrThrow({
        where: { id: +id },
      });

      const schema = {
        name: { type: "string", empty: false },
      };

      const createSchema = validator.compile(schema);
      const check = await createSchema({
        name,
      });

      if (check !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: check,
        });
      }

      const update = await prisma.users.update({
        where: { id: user.id },
        data: {
          ...user,
          name: name,
        },
      });
      ctx.status = 200;

      return (ctx.body = {
        success: true,
        message: "Berhasil mengupdate nama menjadi " + name,
        token: generateToken(update),
        data: update,
      });
    } catch (error: any) {
      console.log({ error: error });
      ctx.status = error.statusCode || error.status || 500;
      return (ctx.body = {
        success: false,
        message: error.message,
      });
    }
  }

  public static async deleteUsers(ctx: KoaContext, next: Next) {
    try {
      const { id = 0 }: { id?: number } = ctx.params;
      if (id == 0) ctx.throw("ID is required", 400);
      const result = await prisma.users.delete({
        where: { id: +id },
      });

      ctx.status = 200;
      return (ctx.body = {
        success: true,
        message: "Berhasil menghapus user",
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
