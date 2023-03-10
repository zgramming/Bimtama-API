import dayjs from 'dayjs';
import Validator from 'fastest-validator';
import { Next } from 'koa';

import { PrismaClient } from '@prisma/client';

import { ERROR_TYPE_VALIDATION } from '../../utils/constant';
import { sendMultipleNotification } from '../../utils/firebase_messaging';
import { HTTP_RESPONSE_CODE } from '../../utils/http_response_code';
import { KoaContext } from '../../utils/types';

const prisma = new PrismaClient();
const validator = new Validator();

export class DosenMeetingScheduleController {
  public static async getById(ctx: KoaContext, next: Next) {
    const { id } = ctx.params;
    const result = await prisma.meetingSchedule.findUnique({
      include: {
        meeting_schedule_personal: {
          include: { user: { select: { name: true } } },
        },
      },
      where: { id: +id },
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil mendapatkan meeting",
      data: result,
    });
  }

  public static async getByUserIdAndType(ctx: KoaContext, next: Next) {
    const { user_id, type } = ctx.params;
    const activeGroup = await prisma.lectureGroupActive.findUnique({
      where: { user_id: +user_id },
    });

    if (!activeGroup) {
      ctx.status = HTTP_RESPONSE_CODE.BAD_REQUEST;
      return (ctx.body = {
        success: true,
        message: "Kamu belum mempunyai kelompok yang aktif",
      });
    }

    const result = await prisma.meetingSchedule.findMany({
      where: {
        type: type,
        group_id: activeGroup.group_id,
      },
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil mendapatkan Meeting Schedule",
      data: result,
    });
  }

  public static async create(ctx: KoaContext, next: Next) {
    const {
      user_id,
      title,
      description,
      type,
      method,
      start_date,
      end_date,
      link_maps,
      link_meeting,
    } = ctx.request.body;
    console.log({ title });

    const createSchema = validator.compile({
      user_id: { type: "number" },
      title: { type: "string" },
      description: { type: "string" },
      type: { type: "enum", values: ["group", "personal"] },
      method: { type: "enum", values: ["daring", "luring"] },
      ...(method == "luring" && { link_maps: { type: "string" } }),
      ...(method == "daring" && { link_meeting: { type: "string" } }),
      start_date: { type: "date" },
      ...(end_date && { end_date: { type: "date" } }),
    });

    const validate = await createSchema({
      user_id: +user_id,
      title,
      description,
      type,
      method,
      link_maps,
      link_meeting,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    });

    if (validate !== true) {
      ctx.status = 400;
      return (ctx.body = {
        success: false,
        type: ERROR_TYPE_VALIDATION,
        message: validate,
      });
    }

    const activeGroup = await prisma.lectureGroupActive.findUnique({
      where: { user_id: +user_id },
    });

    if (!activeGroup) {
      ctx.status = HTTP_RESPONSE_CODE.FORBIDDEN;
      return (ctx.body = {
        success: false,
        message: "Kamu belum mempunya kelompok",
      });
    }

    const transaction = await prisma.$transaction(async (trx) => {
      const create = await trx.meetingSchedule.create({
        data: {
          group_id: activeGroup.group_id,
          title,
          description,
          start_date: new Date(start_date),
          end_date: end_date ? new Date(end_date) : null,
          type,
          link_maps: link_maps ?? null,
          link_meeting: link_meeting ?? null,
          method,
          created_by: +user_id,
        },
      });

      /// Send notification to all student in group
      const studentTokens = (
        await trx.groupMember.findMany({
          select: {
            user: { select: { token_firebase: true } },
          },
          where: {
            group_id: create.group_id,
            user_id: { not: +user_id },
            user: { token_firebase: { not: null } },
          },
        })
      ).map((item) => item.user.token_firebase ?? "");

      if (studentTokens.length > 0) {
        const createdAt = dayjs(create.created_at).format("DD MMMM YYYY HH:mm");
        const sendNotification = await sendMultipleNotification(studentTokens, {
          title: `${create.title}`,
          body: `${create.description} | ${createdAt} `,
        });
      }

      return create;
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil membuat pertemuan",
      data: transaction,
    });
  }

  public static async createPersonal(ctx: KoaContext, next: Next) {
    const {
      user_id,
      student_id,
      title,
      description,
      type,
      method,
      start_date,
      end_date,
      link_maps,
      link_meeting,
    } = ctx.request.body;

    const createSchema = validator.compile({
      user_id: { type: "number" },
      student_id: { type: "number" },
      title: { type: "string" },
      description: { type: "string" },
      type: { type: "enum", values: ["group", "personal"] },
      method: { type: "enum", values: ["daring", "luring"] },
      ...(method == "luring" && { link_maps: { type: "string" } }),
      ...(method == "daring" && { link_meeting: { type: "string" } }),
      start_date: { type: "date" },
      ...(end_date && { end_date: { type: "date" } }),
    });

    const validate = await createSchema({
      user_id: +user_id,
      student_id: +student_id,
      title,
      description,
      type,
      method,
      link_maps,
      link_meeting,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    });

    if (validate !== true) {
      ctx.status = 400;
      return (ctx.body = {
        success: false,
        type: ERROR_TYPE_VALIDATION,
        message: validate,
      });
    }

    const activeGroup = await prisma.lectureGroupActive.findUnique({
      where: { user_id: +user_id },
    });

    if (!activeGroup) {
      ctx.status = HTTP_RESPONSE_CODE.FORBIDDEN;
      return (ctx.body = {
        success: false,
        message: "Kamu belum mempunya kelompok",
      });
    }

    const transaction = await prisma.$transaction(async (trx) => {
      const createMeeting = await prisma.meetingSchedule.create({
        data: {
          group_id: activeGroup.group_id,
          title,
          description,
          start_date: new Date(start_date),
          end_date: end_date ? new Date(end_date) : null,
          type,
          link_maps: link_maps ?? null,
          link_meeting: link_meeting ?? null,
          method,
          created_by: +user_id,
        },
      });

      const createMeetingPersonal = await prisma.meetingSchedulePersonal.create(
        {
          data: {
            group_id: activeGroup.group_id,
            user_id: +student_id,
            meeting_schedule_id: createMeeting.id,
          },
        }
      );

      return createMeeting;
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil membuat pertemuan personal",
      data: transaction,
    });
  }

  public static async update(ctx: KoaContext, next: Next) {
    const { id } = ctx.params;
    const {
      user_id,
      title,
      description,
      type,
      method,
      start_date,
      end_date,
      link_maps,
      link_meeting,
    } = ctx.request.body;

    const createSchema = validator.compile({
      id: { type: "number" },
      user_id: { type: "number" },
      title: { type: "string" },
      description: { type: "string" },
      type: { type: "enum", values: ["group", "personal"] },
      method: { type: "enum", values: ["daring", "luring"] },
      ...(method == "luring" && { link_maps: { type: "string" } }),
      ...(method == "daring" && { link_meeting: { type: "string" } }),
      start_date: { type: "date" },
      ...(end_date && { end_date: { type: "date" } }),
    });
    const validate = await createSchema({
      id: +id,
      user_id: +user_id,
      title,
      description,
      type,
      method,
      link_maps,
      link_meeting,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    });

    if (validate !== true) {
      ctx.status = 400;
      return (ctx.body = {
        success: false,
        type: ERROR_TYPE_VALIDATION,
        message: validate,
      });
    }

    const activeGroup = await prisma.lectureGroupActive.findUnique({
      where: { user_id: +user_id },
    });

    if (!activeGroup) {
      ctx.status = HTTP_RESPONSE_CODE.FORBIDDEN;
      return (ctx.body = {
        success: false,
        message: "Kamu belum mempunya kelompok",
      });
    }

    const update = await prisma.meetingSchedule.update({
      where: {
        id: +id,
      },
      data: {
        title,
        description,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        group_id: activeGroup.group_id,
        type,
        link_maps: link_maps ?? null,
        link_meeting: link_meeting ?? null,
        method,
        created_by: +user_id,
      },
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil mengupdate pertemuan",
      data: update,
    });
  }

  public static async updatePersonal(ctx: KoaContext, next: Next) {
    const { id } = ctx.params;
    const {
      user_id,
      student_id,
      title,
      description,
      type,
      method,
      start_date,
      end_date,
      link_maps,
      link_meeting,
    } = ctx.request.body;

    const createSchema = validator.compile({
      id: { type: "number" },
      user_id: { type: "number" },
      student_id: { type: "number" },
      title: { type: "string" },
      description: { type: "string" },
      type: { type: "enum", values: ["group", "personal"] },
      method: { type: "enum", values: ["daring", "luring"] },
      ...(method == "luring" && { link_maps: { type: "string" } }),
      ...(method == "daring" && { link_meeting: { type: "string" } }),
      start_date: { type: "date" },
      ...(end_date && { end_date: { type: "date" } }),
    });

    const validate = await createSchema({
      id: +id,
      user_id: +user_id,
      student_id: +student_id,
      title,
      description,
      type,
      method,
      link_maps,
      link_meeting,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    });

    if (validate !== true) {
      ctx.status = 400;
      return (ctx.body = {
        success: false,
        type: ERROR_TYPE_VALIDATION,
        message: validate,
      });
    }

    const activeGroup = await prisma.lectureGroupActive.findUnique({
      where: { user_id: +user_id },
    });

    if (!activeGroup) {
      ctx.status = HTTP_RESPONSE_CODE.FORBIDDEN;
      return (ctx.body = {
        success: false,
        message: "Kamu belum mempunya kelompok",
      });
    }

    const transaction = await prisma.$transaction(async () => {
      const update = await prisma.meetingSchedule.update({
        where: {
          id: +id,
        },
        data: {
          title,
          description,
          start_date: new Date(start_date),
          end_date: end_date ? new Date(end_date) : null,
          group_id: activeGroup.group_id,
          type,
          link_maps: link_maps ?? null,
          link_meeting: link_meeting ?? null,
          method,
          created_by: +user_id,
        },
      });
      const updatePersonal = await prisma.meetingSchedulePersonal.updateMany({
        where: { meeting_schedule_id: update.id },
        data: {
          user_id: +student_id,
        },
      });

      return update;
    });

    return (ctx.body = {
      success: true,
      message: "Berhasil mengupdate pertemuan",
      data: transaction,
    });
  }
}
