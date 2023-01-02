import Validator from "fastest-validator";
import formidable from "formidable";
import { Next } from "koa";

import { PrismaClient } from "@prisma/client";

import { basePublicFileDir, ERROR_TYPE_VALIDATION } from "../../utils/constant";
import {
  moveFile,
  nextOutlineStudent,
  validateFile,
} from "../../utils/function";
import { HTTP_RESPONSE_CODE } from "../../utils/http_response_code";
import { KoaContext } from "../../utils/types";

const prisma = new PrismaClient();
const validator = new Validator();

export class DosenGuidanceController {
  public static async getMasterOutline(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;
    const activeGroup = await prisma.lectureGroupActive.findUnique({
      where: { user_id: +user_id },
    });

    if (!activeGroup) {
      ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
      return (ctx.body = {
        success: false,
        message: "Kamu tidak mempunyai group yang aktif",
      });
    }

    const result = await prisma.masterData.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        guidance_detail: {
          select: {
            id: true,
            guidance_id: true,
            user_id: true,
            group_id: true,
            title: true,
            user: { select: { name: true } },
          },
          where: {
            group_id: activeGroup.group_id,
            status: "progress",
          },
        },
      },
      where: { master_category_code: "OUTLINE_COMPONENT" },
    });

    return (ctx.body = {
      success: true,
      data: result,
    });
  }

  public static async getGuidanceByCodeMasterOutline(
    ctx: KoaContext,
    next: Next
  ) {
    const { user_id, code } = ctx.params;
    const { status, limit, offset } = ctx.request.query;

    const activeGroup = await prisma.lectureGroupActive.findUnique({
      where: { user_id: +user_id },
    });

    if (!activeGroup) {
      ctx.status = HTTP_RESPONSE_CODE.FORBIDDEN;
      return (ctx.body = {
        success: false,
        message: "Kamu tidak mempunyai kelompok yang aktif",
      });
    }

    const guidanceDetail = await prisma.guidanceDetail.findMany({
      include: {
        user: true,
      },
      where: {
        group_id: activeGroup.group_id,
        ...(status && { status: status as any }),
        mst_outline_component: {
          code: code,
        },
      },
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil mendapatkan bimbingan",
      data: guidanceDetail,
    });
  }

  public static async updateSubmission(ctx: KoaContext, next: Next) {
    try {
      const { id } = ctx.params;
      const { lecture_note, status } = ctx.request.body;
      const files = ctx.request.files;

      const row = await prisma.guidanceDetail.findUnique({
        where: { id: id },
      });

      if (!row) {
        ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
        return (ctx.body = {
          success: false,
          message: "Bimbingan detail tidak ditemukan",
        });
      }

      const createSchema = validator.compile({
        lecture_note: { type: "string" },
        status: { type: "enum", values: ["approved", "progress", "rejected"] },
      });

      const validate = await createSchema({
        lecture_note,
        status,
      });

      if (validate !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }

      const data = {
        lecture_note,
        status,
        file_lecture: "",
      };

      const moveFileConfig = {
        oldPath: "",
        newPath: "",
      };
      if (files?.file) {
        const file = files.file as formidable.File;
        const { error, name } = validateFile(file, {
          config: {
            allowedExtension: [".doc", ".docx", ".pdf"],
            allowedMimetypes: ["application/pdf", "application/msword"],
            allowedSize: 2,
            filename: row.file_lecture ?? undefined,
          },
        });

        if (error) {
          ctx.status = HTTP_RESPONSE_CODE.BAD_REQUEST;
          return (ctx.body = {
            success: true,
            message: error,
          });
        }

        data.file_lecture = name ?? "";
        moveFileConfig.oldPath = file.filepath;
        moveFileConfig.newPath = `${basePublicFileDir}/${name}`;
      }

      const transaction = await prisma.$transaction(async (trx) => {
        const update = await trx.guidanceDetail.update({
          where: { id: row.id },
          data: data,
        });

        if (update.status == "approved") {
          const nextOutline = await nextOutlineStudent(update.user_id);

          if (nextOutline) {
            const dataUpsert = {
              guidance_id: update.guidance_id,
              mst_outline_component_id: nextOutline.mst_outline_component_id,
              user_id: update.user_id,
            };

            const upsert = await prisma.studentGuidanceProgress.upsert({
              where: {
                user_id_mst_outline_component_id: {
                  mst_outline_component_id:
                    nextOutline.mst_outline_component_id,
                  user_id: update.user_id,
                },
              },
              create: dataUpsert,
              update: dataUpsert,
            });
          }
        }

        if (moveFileConfig.newPath) {
          moveFile(moveFileConfig.oldPath, moveFileConfig.newPath);
        }

        return { update };
      });

      return (ctx.body = {
        success: true,
        message: "Berhasil menyimpan detail bimbingan",
        data: transaction,
      });
    } catch (error: any) {
      ctx.status = HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR;
      const message = error?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }
}
