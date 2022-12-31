import Validator from "fastest-validator";
import { Next } from "koa";

import { PrismaClient } from "@prisma/client";

import { basePublicFileDir, ERROR_TYPE_VALIDATION } from "../../utils/constant";
import { KoaContext } from "../../utils/types";
import { moveFile, validateFile } from "../../utils/function";
import { HTTP_RESPONSE_CODE } from "../../utils/http_response_code";

const prisma = new PrismaClient();
const validator = new Validator();

export class DosenGuidanceController {
  public static async get(ctx: KoaContext, next: Next) {}
  public static async submissionTitle(ctx: KoaContext, next: Next) {}
  public static async submissionBab1(ctx: KoaContext, next: Next) {}
  public static async submissionBab2(ctx: KoaContext, next: Next) {}
  public static async submissionBab3(ctx: KoaContext, next: Next) {}
  public static async submissionBab4(ctx: KoaContext, next: Next) {}
  public static async submissionBab5(ctx: KoaContext, next: Next) {}
}
