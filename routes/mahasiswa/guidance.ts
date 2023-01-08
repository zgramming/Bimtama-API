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

export class MahasiswaGuidanceController {
  public static async get(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;
    const result = await prisma.guidance.findUnique({
      include: {
        group: true,
        mst_outline_component: true,
        user: true,
      },
      where: { user_id: +user_id },
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil mendapatkan bimbingan",
      data: result,
    });
  }

  public static async getOutline(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;
    const studentOutline = await prisma.studentOutline.findUnique({
      include: {
        user: true,
        outline: {
          include: {
            master_outline: true,
            outline_component: {
              include: {
                master_outline_component: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      where: { user_id: +user_id },
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil mendapatkan outline",
      data: studentOutline,
    });
  }

  public static async getGuidanceProgress(ctx: KoaContext, next: Next) {
    const { user_id } = ctx.params;
    const result = await prisma.studentGuidanceProgress.findMany({
      where: { user_id: +user_id },
    });

    return (ctx.body = {
      success: false,
      message: "Berhasil mendapatkan progress bimbingan",
      data: result,
    });
  }

  public static async getGuidanceDetail(ctx: KoaContext, next: Next) {
    try {
      const { user_id, codeMasterOutlineComponent } = ctx.params;
      const mstOutlineComponent = await prisma.masterData.findUnique({
        where: { code: codeMasterOutlineComponent },
      });

      if (!mstOutlineComponent) {
        ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
        return (ctx.body = {
          success: false,
          message: `Outline Component dengan kode ${codeMasterOutlineComponent} tidak ditemukan, pastikan master data tersedia.`,
        });
      }

      const guidanceDetail = await prisma.guidanceDetail.findMany({
        orderBy: { created_at: "desc" },
        where: {
          user_id: +user_id,
          mst_outline_component_id: mstOutlineComponent.id,
        },
      });

      return (ctx.body = {
        success: true,
        message: "Berhasil mendapatkan Detail Bimbingan",
        data: guidanceDetail,
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

  public static async start(ctx: KoaContext, next: Next) {
    try {
      const { user_id } = ctx.request.body;

      const createSchema = validator.compile({
        user_id: { type: "number" },
      });
      const validate = await createSchema({
        user_id: +user_id,
      });

      if (validate !== true) {
        ctx.status = HTTP_RESPONSE_CODE.BAD_REQUEST;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }

      const groupMember = await prisma.groupMember.findFirst({
        where: {
          user_id: +user_id,
        },
      });

      if (!groupMember) {
        ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
        return (ctx.body = {
          success: false,
          message:
            "Kamu belum mempunyai kelompok, silahkan masuk ke dalam kelompok terlebih dahulu.",
        });
      }

      const studentOutline = await prisma.studentOutline.findUnique({
        include: { outline: true },
        where: { user_id: +user_id },
      });

      if (!studentOutline) {
        ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
        return (ctx.body = {
          success: true,
          message:
            "Kamu belum memilih outline, silahkan pilih outline terlebih dahulu.",
        });
      }

      const outlineComponentFirst = await prisma.outlineComponent.findFirst({
        orderBy: { order: "asc" },
        where: { outline_id: studentOutline.outline_id },
      });

      if (!outlineComponentFirst) {
        ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
        return (ctx.body = {
          success: true,
          message: `Outline Component untuk outline ${studentOutline.outline.title} tidak ditemukan`,
        });
      }

      const data = {
        title: "Default Title",
        user_id: +user_id,
        group_id: groupMember.group_id,
        current_progres_mst_outline_component_id:
          outlineComponentFirst.mst_outline_component_id,
      };

      const transaction = await prisma.$transaction(async () => {
        const upsert = await prisma.guidance.upsert({
          where: {
            user_id: +user_id,
          },
          create: data,
          update: data,
        });

        const nextOutline = await nextOutlineStudent(user_id);
        if (nextOutline) {
          const dataUpsert = {
            guidance_id: upsert.id,
            mst_outline_component_id: nextOutline.mst_outline_component_id,
            user_id: user_id,
          };

          const updateStudentGuidanceProgress =
            await prisma.studentGuidanceProgress.upsert({
              where: {
                user_id_mst_outline_component_id: {
                  mst_outline_component_id:
                    nextOutline.mst_outline_component_id,
                  user_id: user_id,
                },
              },
              create: dataUpsert,
              update: dataUpsert,
            });
        }

        return { upsert };
      });

      return (ctx.body = {
        success: true,
        message: "Berhasil memulai bimbingan",
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

  public static async submission(ctx: KoaContext, next: Next) {
    try {
      const { user_id, title, description, code_master_outline_component } =
        ctx.request.body;
      const files = ctx.request.files;

      const createSchema = validator.compile({
        user_id: { type: "number" },
        title: { type: "string" },
        code_master_outline_component: { type: "string" },
      });
      const validate = await createSchema({
        title,
        user_id: +user_id,
        code_master_outline_component,
      });

      if (validate !== true) {
        ctx.status = HTTP_RESPONSE_CODE.BAD_REQUEST;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }

      const mstOutlineComponent = await prisma.masterData.findUnique({
        where: { code: code_master_outline_component },
      });

      if (!mstOutlineComponent) {
        ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
        return (ctx.body = {
          success: false,
          message: `Outline Component dengan kode ${code_master_outline_component} tidak ditemukan, pastikan master data tersedia.`,
        });
      }

      const guidance = await prisma.guidance.findUnique({
        where: { user_id: +user_id },
      });

      if (!guidance) {
        ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
        return (ctx.body = {
          success: false,
          message: "Kamu belum memulai bimbingan",
        });
      }

      const submissionProgressOrApproved =
        await prisma.guidanceDetail.findFirst({
          where: {
            status: {
              in: ["approved", "progress"],
            },
            user_id: +user_id,
            mst_outline_component_id: mstOutlineComponent.id,
          },
        });

      if (submissionProgressOrApproved) {
        ctx.status = HTTP_RESPONSE_CODE.FORBIDDEN;
        const message =
          submissionProgressOrApproved.status == "approved"
            ? "Submission kamu sudah diapproved"
            : "Kamu masih mempunyai submission yang masih progress. Mohon tunggu dosen pembimbing untuk memeriksa submission kamu.";

        return (ctx.body = {
          success: false,
          message: message,
        });
      }

      const data = {
        guidance_id: guidance.id,
        user_id: +user_id,
        group_id: guidance.group_id,
        mst_outline_component_id: mstOutlineComponent.id,
        title,
        description,
        file: "",
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
            allowedMimetypes: [
              "application/msword",
              "application/pdf",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ],
            allowedSize: 2,
          },
        });

        if (error) {
          ctx.status = HTTP_RESPONSE_CODE.BAD_REQUEST;
          return (ctx.body = {
            success: false,
            message: error,
          });
        }

        data.file = `${name}`;
        moveFileConfig.oldPath = file.filepath;
        moveFileConfig.newPath = `${basePublicFileDir}/${name}`;
      }

      const create = await prisma.guidanceDetail.create({
        data: { ...data },
      });

      if (moveFileConfig.newPath) {
        moveFile(moveFileConfig.oldPath, moveFileConfig.newPath);
      }

      return (ctx.body = {
        success: true,
        data: create,
        message:
          "Berhasil menyimpan Proposal Judul, mohon tunggu dosen pembimbing untuk memeriksa pengajuan kamu.",
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
