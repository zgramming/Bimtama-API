import { compare, hashSync } from "bcrypt";
import Validator from "fastest-validator";
import { Next } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { HTTP_RESPONSE_CODE } from "../../utils/http_response_code";
import { generateToken } from "../../utils/token";
import { KoaContext } from "../../utils/types";

const prisma = new PrismaClient();
const validator = new Validator();
const saltRounds = 10;

export class AuthController {
  public static async betaRegister(ctx: KoaContext, next: Next) {
    try {
      const { username, password, code_group } = ctx.request.body;

      const createSchema = validator.compile({
        username: { type: "string", alphanum: true },
        password: { type: "string", max: 16 },
        code_group: { type: "enum", values: ["mahasiswa", "dosen"] },
      });
      const check = await createSchema({
        username,
        password,
        code_group,
      });

      if (check !== true) {
        ctx.status = HTTP_RESPONSE_CODE.BAD_REQUEST;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: check,
        });
      }

      const mahasiswaGroup = await prisma.appGroupUser.findUnique({
        where: { code: code_group },
      });

      if (!mahasiswaGroup) {
        ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
        return (ctx.body = {
          success: false,
          message: "Group user tidak tersedia",
        });
      }

      const userExists = await prisma.users.findUnique({
        where: { username: username },
      });

      if (userExists) {
        ctx.status = HTTP_RESPONSE_CODE.FORBIDDEN;
        return (ctx.body = {
          success: false,
          message: `Username ${username} telah dipakai`,
        });
      }

      const result = await prisma.users.create({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          username: true,
          app_group_user_id: true,
          app_group_user: {
            select: { id: true, code: true, name: true },
          },
        },
        data: {
          username,
          name: username,
          password: hashSync(password, saltRounds),
          app_group_user_id: mahasiswaGroup.id,
          status: "active",
        },
      });

      return (ctx.body = {
        success: true,
        message: "Berhasil registrasi",
        data: result,
        token: generateToken(result),
      });
    } catch (error: any) {
      ctx.status = HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR;
      return (ctx.body = {
        success: false,
        message: error?.message ?? "Unknown Message",
      });
    }
  }

  public static async login(ctx: KoaContext, next: Next) {
    try {
      const { username, password } = ctx.request.body;

      const schema = {
        username: { type: "string" },
        password: { type: "string" },
      };

      const createSchema = validator.compile(schema);
      const check = await createSchema({
        username,
        password,
      });

      if (check !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: check,
        });
      }

      const user = await prisma.users.findFirst({
        where: {
          username: username ?? null,
        },
      });

      const checkPassword = await compare(password, user?.password ?? "");

      if (!user || !checkPassword) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          message: "Password / Username tidak valid",
        });
      }

      const data = await prisma.users.findUnique({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          username: true,
          app_group_user_id: true,
          app_group_user: {
            select: { id: true, code: true, name: true },
          },
        },
        where: { id: user.id },
      });

      return (ctx.body = {
        success: true,
        message: "Berhasil login",
        data: data,
        token: generateToken(data),
      });
    } catch (error: any) {
      
      ctx.status = HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR;
      return (ctx.body = {
        success: false,
        message: error?.message ?? "Unknown Message",
      });
    }
  }
}
