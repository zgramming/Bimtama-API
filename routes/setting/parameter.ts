import { Next, ParameterizedContext } from "koa";

import { CommonStatus, PrismaClient } from "@prisma/client";
import { KoaContext } from "../../utils/types";

const prisma = new PrismaClient();
export class SettingParameterController {
  public static async get(ctx: KoaContext, next: Next) {
    const {
      code = "",
      name = "",
      value = "",
      status,
      limit,
      offset,
    }: {
      code?: string;
      name?: string;
      value?: string;
      status?: CommonStatus;
      limit?: number;
      offset?: number;
    } = ctx.query;

    const result = await prisma.parameter.findMany({
      where: {
        ...(code && { code: { contains: code } }),
        ...(name && { name: { contains: name } }),
        ...(value && { value: { contains: value } }),
        ...(status && { status: status }),
      },
      ...(limit && { take: +limit }),
      ...(offset && { skip: +offset }),
    });

    return (ctx.body = { success: true, data: result });
  }

  public static async create(ctx: KoaContext, next: Next) {
    try {
      const {
        code = "",
        name = "",
        value = "",
        status = "active",
      }: {
        code?: string;
        name?: string;
        value?: string;
        status?: CommonStatus;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      if (code == "") ctx.throw("Code required", 400);
      if (name == "") ctx.throw("Name required", 400);
      if (value == "") ctx.throw("Value required", 400);

      const result = await prisma.parameter.create({
        data: {
          code,
          name,
          value,
          status,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil membuat Parameter dengan nama " + name,
      });
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      return (ctx.body = {
        success: false,
        message: error.message,
      });
    }
  }

  public static async update(ctx: KoaContext, next: Next) {
    try {
      const { id = 0 }: { id?: number } = ctx.params;
      const {
        code = "",
        name = "",
        value = "",
        status = "active",
      }: {
        code?: string;
        name?: string;
        value?: string;
        status?: CommonStatus;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      if (code == "") ctx.throw("Code required", 400);
      if (name == "") ctx.throw("Name required", 400);
      if (value == "") ctx.throw("Value required", 400);

      const result = await prisma.parameter.update({
        where: { id: +id },
        data: {
          code,
          name,
          value,
          status,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil membuat Parameter dengan nama " + name,
      });
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      return (ctx.body = {
        success: false,
        message: error.message,
      });
    }
  }

  public static async delete(ctx: KoaContext, next: Next) {
    try {
      const { id = 0 }: { id?: number } = ctx.params;
      if (id == 0) ctx.throw("ID is required", 400);
      const result = await prisma.parameter.delete({
        where: { id: +id },
      });

      ctx.status = 200;
      return (ctx.body = {
        success: true,
        message: "Berhasil menghapus Parameter",
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
