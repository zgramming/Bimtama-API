import { Next, ParameterizedContext } from "koa";

import { PrismaClient } from "@prisma/client";
import Validator from "fastest-validator";
import { ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { generateToken } from "../../utils/token";
import { compare } from "bcrypt";
const prisma = new PrismaClient();
const validator = new Validator();

export class AuthController {
  public static async login(ctx: ParameterizedContext, next: Next) {
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

      ctx.status = 200;
      return (ctx.body = {
        success: true,
        message: "Berhasil login",
        data: user, 
        token: generateToken(user!),
      });
    } catch (error: any) {
      ctx.status = 500;
      return (ctx.body = {
        success: false,
        message: error?.message ?? "Unknown Message",
      });
    }
  }
}
