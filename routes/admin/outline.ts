import Validator from "fastest-validator";
import { Next } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { KoaContext } from "../../utils/types";

const prisma = new PrismaClient();
const validator = new Validator();

type OutlineComponentType = {
  mst_outline_component_id: number;
  title: string;
  description?: string;
  order: number;
};

export class AdminOutlineController {
  public static async get(ctx: KoaContext, next: Next) {
    const result = await prisma.outline.findMany({
      include: {
        master_outline: true,
        outline_component: {
          include: { master_outline_component: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return (ctx.body = {
      success: false,
      data: result,
    });
  }

  public static async getById(ctx: KoaContext, next: Next) {
    try {
      const { id } = ctx.params;
      const result = await prisma.outline.findFirst({
        where: { id: +(id ?? null) },
        include: { master_outline: true, outline_component: true },
      });

      return (ctx.body = {
        success: true,
        data: result,
      });
    } catch (error) {
      console.log({ error });
      ctx.status = 500;
      return (ctx.body = {
        message: error,
        success: false,
      });
    }
  }

  public static async create(ctx: KoaContext, next: Next) {
    try {
      const { mst_outline_id, title, description, mst_outline_component } =
        ctx.request.body;

      const createSchema = validator.compile({
        mst_outline_id: { type: "number" },
        title: { type: "string" },
        description: { type: "string" },
        mst_outline_component: { type: "array" },
      });
      const validate = await createSchema({
        mst_outline_id,
        title,
        description,
        mst_outline_component,
      });

      if (validate !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }

      const transaction = await prisma.$transaction(async (trx) => {
        const createOutline = await trx.outline.create({
          data: {
            title,
            description,
            mst_outline_id,
          },
        });

        const mapping = (
          mst_outline_component as Array<OutlineComponentType>
        ).map((val, index) => {
          return {
            outline_id: createOutline.id,
            mst_outline_component_id: val.mst_outline_component_id,
            title: val.title,
            description: val.description,
            order: val.order,
          };
        });
        const createOutlineComponent = await trx.outlineComponent.createMany({
          data: [...mapping],
        });

        return {
          outline: createOutline,
          outline_component: createOutlineComponent.count,
        };
      });

      return (ctx.body = {
        success: true,
        data: transaction,
      });
    } catch (error: any) {
      ctx.status = 500;
      const message = error?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }

  public static async update(ctx: KoaContext, next: Next) {
    try {
      const { id } = ctx.params;
      const { mst_outline_id, title, description, mst_outline_component } =
        ctx.request.body;

      const createSchema = validator.compile({
        id: { type: "string" },
        mst_outline_id: { type: "number" },
        title: { type: "string" },
        description: { type: "string" },
        mst_outline_component: { type: "array" },
      });
      const validate = await createSchema({
        id,
        mst_outline_id,
        title,
        description,
        mst_outline_component,
      });

      if (validate !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }

      const transaction = await prisma.$transaction(async (trx) => {
        const createOutline = await trx.outline.update({
          where: { id: +id },
          data: {
            title,
            description,
            mst_outline_id,
          },
        });

        /// Delete first before insert outline component again
        await trx.outlineComponent.deleteMany({ where: { outline_id: +id } });

        const mapping = (
          mst_outline_component as Array<OutlineComponentType>
        ).map((val, index) => {
          return {
            outline_id: createOutline.id,
            mst_outline_component_id: val.mst_outline_component_id,
            title: val.title,
            description: val.description,
            order: val.order,
          };
        });

        const createOutlineComponent = await trx.outlineComponent.createMany({
          data: [...mapping],
        });

        return {
          outline: createOutline,
          outline_component: createOutlineComponent.count,
        };
      });

      return (ctx.body = {
        success: true,
        data: transaction,
      });
    } catch (error: any) {
      console.log({ error: error });

      ctx.status = 500;
      const message = error?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }

  public static async delete(ctx: KoaContext, next: Next) {
    try {
      const { id } = ctx.params;

      if (!id) {
        ctx.status = 400;
        return (ctx.body = { success: false, message: "Required ID" });
      }

      const deleteOutline = await prisma.outline.delete({
        where: { id: +id },
      });

      return (ctx.body = {
        success: true,
        message: "Berhasil menghapus outline beserta componentnya",
        data: deleteOutline,
      });
    } catch (error: any) {
      ctx.status = 500;
      const message = error?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }
}
