import { Next } from "koa";

import { CommonStatus, PrismaClient } from "@prisma/client";

import { KoaContext } from "../../utils/types";

const prisma = new PrismaClient();
export class SettingMasterDataController {
  public static async get(ctx: KoaContext, next: Next) {
    const {
      master_category_id,
      master_category_code,
      code,
      name,
      status,
      limit,
      offset,
    }: {
      master_category_id?: number;
      master_category_code?: string;
      code?: string;
      name?: string;
      status?: CommonStatus;
      limit?: number;
      offset?: number;
    } = ctx.query;

    const result = await prisma.masterData.findMany({
      where: {
        ...(master_category_code && {
          master_category_code: master_category_code,
        }),
        ...(master_category_id && { master_category_id: +master_category_id }),
        ...(code && { code: code }),
        ...(name && { name: name }),
        ...(status && { status: status }),
      },
      include: {
        master_category: true,
        master_data_children: true,
        master_data_parent: true,
      },
      orderBy: {
        order: "asc",
      },
      // ...(limit !== 0 && { take: +limit }),
      // ...(offset !== 0 && { skip: +offset }),
    });
    return (ctx.body = { success: true, data: result });
  }

  public static async getByCode(ctx: KoaContext, next: Next) {
    const { code } = ctx.params;
    const result = await prisma.masterData.findUnique({
      where: { code: code },
    });
    return (ctx.body = {
      success: true,
      message: "Berhasil mendapatkan master data",
      data: result,
    });
  }

  public static async getByCategoryCodeCategory(ctx: KoaContext, next: Next) {
    try {
      const { category_code } = ctx.params;
      const result = await prisma.masterData.findMany({
        where: { master_category_code: category_code },
        orderBy: {
          order: "asc",
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
      });
    } catch (e: any) {
      ctx.status = 500;
      const message = e?.message ?? "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }

  public static async create(ctx: KoaContext, next: Next) {
    try {
      const {
        master_data_id,
        master_category_code = "",
        code = "",
        name = "",
        description = "",
        order = 1,
        status = "active",
        parameter1_key,
        parameter1_value,
        parameter2_key,
        parameter2_value,
        parameter3_key,
        parameter3_value,
      }: {
        master_data_id?: number;
        master_category_code?: string;
        code?: string;
        name?: string;
        description?: string;
        order?: number;
        status?: CommonStatus;
        parameter1_key?: string;
        parameter1_value?: string;
        parameter2_key?: string;
        parameter2_value?: string;
        parameter3_key?: string;
        parameter3_value?: string;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      if (master_category_code == "") {
        ctx.throw("Master Data Required", 400);
      }
      if (code == "") ctx.throw("Code required", 400);
      if (name == "") ctx.throw("Name required", 400);

      const masterCategory = await prisma.masterCategory.findFirst({
        where: { code: master_category_code },
      });
      if (!masterCategory) ctx.throw("Master Kategori tidak valid", 400);

      const result = await prisma.masterData.create({
        data: {
          master_data_id: master_data_id && +master_data_id,
          master_category_id: +masterCategory!.id,
          master_category_code: masterCategory!.code,
          code,
          name,
          description,
          order,
          status: status,
          parameter1_key,
          parameter1_value,
          parameter2_key,
          parameter2_value,
          parameter3_key,
          parameter3_value,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil membuat Master Data dengan nama " + name,
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
        master_data_id,
        code = "",
        name = "",
        description = "",
        order = 1,
        status = "active",
        parameter1_key,
        parameter1_value,
        parameter2_key,
        parameter2_value,
        parameter3_key,
        parameter3_value,
      }: {
        master_data_id?: number;
        master_category_id?: number;
        master_category_code?: string;
        code?: string;
        name?: string;
        description?: string;
        order?: number;
        status?: CommonStatus;
        parameter1_key?: string;
        parameter1_value?: string;
        parameter2_key?: string;
        parameter2_value?: string;
        parameter3_key?: string;
        parameter3_value?: string;
      } = JSON.parse(JSON.stringify(ctx.request.body));

      if (code == "") ctx.throw("Code required", 400);
      if (name == "") ctx.throw("Name required", 400);

      const result = await prisma.masterData.update({
        where: {
          id: +id,
        },
        data: {
          master_data_id: master_data_id && +master_data_id,
          code,
          name,
          description,
          order,
          status: status,
          parameter1_key,
          parameter1_value,
          parameter2_key,
          parameter2_value,
          parameter3_key,
          parameter3_value,
        },
      });

      return (ctx.body = {
        success: true,
        data: result,
        message: "Berhasil membuat Master Data dengan nama " + name,
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
      const result = await prisma.masterData.delete({
        where: { id: +id },
      });

      ctx.status = 200;
      return (ctx.body = {
        success: true,
        message: "Berhasil menghapus Master Data",
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
