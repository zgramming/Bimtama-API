import Validator from "fastest-validator";
import { Next } from "koa";

import { PrismaClient } from "@prisma/client";

import { ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { KoaContext } from "../../utils/types";
import { validateFile } from "../../utils/function";

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
    const outline = await prisma.studentOutline.findUnique({
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
      data: outline,
    });
  }

  public static async upsertProposalTitle(ctx: KoaContext, next: Next) {
    try {
      const { title, description, user_id } = ctx.request.body;
      const createSchema = validator.compile({
        user_id: { type: "number" },
        title: { type: "string" },
        description: { type: "string" },
      });
      const validate = await createSchema({
        user_id,
        title,
        description,
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
        where: { user_id: +user_id },
      });

      if (!groupMember) {
        ctx.status = 404;
        return (ctx.body = {
          success: false,
          message:
            "Kamu belum mempunyai kelompok, silahkan masuk ke dalam kelompok terlebih dahulu",
        });
      }

      const codeOutlineComponentBab1 = `OUTLINE_COMPONENT_BAB1`;
      const outlineComponentBab1 = await prisma.masterData.findUnique({
        where: { code: codeOutlineComponentBab1 },
      });

      if (!outlineComponentBab1) {
        ctx.status = 404;
        return (ctx.body = {
          success: false,
          message: `Outline Component dengan kode ${codeOutlineComponentBab1} tidak ditemukan, pastikan master data tersedia.`,
        });
      }

      const data = {
        title,
        description,
        user_id,
        current_progres_mst_outline_component_id: outlineComponentBab1.id,
        group_id: groupMember.group_id,
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
        data: upsert,
        message: "Berhasil menyimpan Proposal Judul",
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

  public static async submissionBab1(ctx: KoaContext, next: Next) {
    try {
      const { user_id, title, description, file } = ctx.request.body;

      const Ctxbody = ctx.request.body;

      const myfile = ctx.request.files?.myfile as any;

      if (myfile) {
        const { originalFilename, size, filepath, mimetype } = myfile;

        const { error, name } = validateFile(
          {
            filename: originalFilename,
            mimetype: mimetype,
            size: size,
          },
          {
            config: {
              allowedExtension: [".pdf"],
              allowedMimetypes: ["application/pdf"],
              allowedSize: 0.1,
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
      }

      // const {} = validateFile(
      //   {
      //     filename: myfile.originalFilename,
      //     mimetype: myfile.mimetype,
      //     size: myfile.size,
      //   },
      //   { config: {} }
      // );

      return (ctx.body = {
        success: true,
      });
      // const codeOutlineComponentBab1 = `OUTLINE_COMPONENT_BAB1`;
      // const outlineComponent = await prisma.masterData.findUnique({
      //   where: { code: codeOutlineComponentBab1 },
      // });

      // if (!outlineComponent) {
      //   ctx.status = 404;
      //   return (ctx.body = {
      //     success: false,
      //     message: `Outline Component dengan kode ${codeOutlineComponentBab1} tidak ditemukan, pastikan master data tersedia.`,
      //   });
      // }

      // const guidance = await prisma.guidance.findUnique({
      //   where: { user_id: user_id },
      // });

      // if (!guidance) {
      //   ctx.status = 404;
      //   return (ctx.body = {
      //     success: false,
      //     message:
      //       "Kamu belum mengajukan bimbingan proposal judul, silahkan untuk mengajukan proposal judul terlebih dahulu",
      //   });
      // }

      // const isHaveSubmissionProgress = await prisma.guidanceDetail.findFirst({
      //   where: {
      //     guidance_id: guidance.id,
      //     mst_outline_component_id: outlineComponent.id,
      //     status: "progress",
      //   },
      // });

      // if (isHaveSubmissionProgress) {
      //   ctx.status = 403;
      //   return (ctx.body = {
      //     success: false,
      //     message:
      //       "Kamu masih mempunyai pengajuan yang belum diperiksa oleh dosen pembimbing, silahkan tunggu sampai dosen pembimbing selesai memeriksa",
      //   });
      // }

      // const create = await prisma.guidanceDetail.create({
      //   data: {
      //     title,
      //     description,
      //     mst_outline_component_id: outlineComponent.id,
      //     group_id: guidance.group_id,
      //     guidance_id: guidance.id,
      //     user_id: +user_id,
      //   },
      // });

      // return (ctx.body = {
      //   success: true,
      //   message: "Berhasil menyimpan pengajuan BAB I",
      //   data: create,
      // });
    } catch (error: any) {
      ctx.status = 500;
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
      ctx.status = 500;
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
      ctx.status = 500;
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
      ctx.status = 500;
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
      ctx.status = 500;
      const message = error?.message || "Unknown Error Message";
      return (ctx.body = {
        success: false,
        message: message,
      });
    }
  }
}
