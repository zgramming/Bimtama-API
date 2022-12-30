import Validator from "fastest-validator";
import { Next } from "koa";

import { PrismaClient } from "@prisma/client";

import { basePublicFileDir, ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { KoaContext } from "../../utils/types";
import { moveFile, validateFile } from "../../utils/function";
import { HTTP_RESPONSE_CODE } from "../../utils/http_response_code";

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
        where: { user_id: +user_id },
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
        ctx.status = 400;
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

      const upsert = await prisma.guidance.upsert({
        where: {
          user_id: +user_id,
        },
        create: data,
        update: data,
      });

      return (ctx.body = {
        success: true,
        message: "Berhasil memulai bimbingan",
        data: upsert,
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

  public static async submissionTitle(ctx: KoaContext, next: Next) {
    try {
      const { user_id, title, description, file } = ctx.request.body;

      const createSchema = validator.compile({
        user_id: { type: "number" },
        title: { type: "string" },
      });
      const validate = await createSchema({
        title,
        user_id,
      });

      if (validate !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }

      const codeMstOutlineComponentJudul = `OUTLINE_COMPONENT_JUDUL`;
      const mstOutlineComponent = await prisma.masterData.findUnique({
        where: { code: codeMstOutlineComponentJudul },
      });

      if (!mstOutlineComponent) {
        ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
        return (ctx.body = {
          success: false,
          message: `Outline Component dengan kode ${codeMstOutlineComponentJudul} tidak ditemukan, pastikan master data tersedia.`,
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

      const submissionProgress = await prisma.guidanceDetail.findFirst({
        where: {
          status: "progress",
          user_id: +user_id,
          mst_outline_component_id: mstOutlineComponent.id,
        },
      });

      if (submissionProgress) {
        ctx.status = HTTP_RESPONSE_CODE.FORBIDDEN;
        return (ctx.body = {
          success: false,
          message:
            "Kamu masih mempunyai submission yang masih progress. Mohon tunggu dosen pembimbing untuk memeriksa submission kamu.",
        });
      }

      const data = {
        guidance_id: guidance.id,
        user_id,
        group_id: guidance.group_id,
        mst_outline_component_id: mstOutlineComponent.id,
        title,
        description,
      };

      const create = await prisma.guidanceDetail.create({
        data: data,
      });

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

  public static async submissionBab1(ctx: KoaContext, next: Next) {
    try {
      const { user_id, title, description } = ctx.request.body;
      const files = ctx.request.files as any;

      const createSchema = validator.compile({
        user_id: { type: "number" },
        title: { type: "string" },
      });
      const validate = await createSchema({
        title,
        user_id,
      });

      if (validate !== true) {
        ctx.status = 400;
        return (ctx.body = {
          success: false,
          type: ERROR_TYPE_VALIDATION,
          message: validate,
        });
      }

      const codeMstOutlineComponentBab1 = `OUTLINE_COMPONENT_BAB1`;
      const mstOutlineComponent = await prisma.masterData.findUnique({
        where: { code: codeMstOutlineComponentBab1 },
      });

      if (!mstOutlineComponent) {
        ctx.status = HTTP_RESPONSE_CODE.NOT_FOUND;
        return (ctx.body = {
          success: false,
          message: `Outline Component dengan kode ${codeMstOutlineComponentBab1} tidak ditemukan, pastikan master data tersedia.`,
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

      const data = {
        guidance_id: guidance.id,
        user_id,
        group_id: guidance.group_id,
        mst_outline_component_id: mstOutlineComponent.id,
        title,
        description,
      };

      /// Start File Validation
      let moveFileConfig = {
        oldPath: "",
        newPath: "",
      };
      if (files.file) {
        console.log({ file: files.file });

        const { size, filepath, originalFilename, mimetype, mtime } =
          files.file;

        const { error, name: filename } = validateFile(
          { filename: originalFilename, mimetype, size },
          {
            config: {
              allowedExtension: [".doc", ".docx", ".pdf"],
              allowedMimetypes: ["application/msword", "application/pdf"],
              allowedSize: 2,
            },
          }
        );

        if (error) {
          ctx.status = 400;
          return (ctx.body = {
            success: false,
            message: error,
          });
        }

        /// Setup oldpath & newpath file for move file later
        moveFileConfig = {
          oldPath: filepath,
          newPath: `${basePublicFileDir}/${filename}`,
        };
      }

      const create = await prisma.guidanceDetail.create({
        data: data,
      });

      /// Move file when all process success
      moveFile(moveFileConfig.oldPath, moveFileConfig.newPath);

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

  public static async submissionBab2(ctx: KoaContext, next: Next) {
    try {
    } catch (error: any) {
      ctx.status = HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR;
      const message = error?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }

  public static async submissionBab3(ctx: KoaContext, next: Next) {
    try {
    } catch (error: any) {
      ctx.status = HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR;
      const message = error?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }

  public static async submissionBab4(ctx: KoaContext, next: Next) {
    try {
    } catch (error: any) {
      ctx.status = HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR;
      const message = error?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }

  public static async submissionBab5(ctx: KoaContext, next: Next) {
    try {
    } catch (error: any) {
      ctx.request.files;
      ctx.status = HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR;
      const message = error?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }
}
