import { Context, DefaultState } from "koa";
import Router from "koa-router";

import { validateJWTToken } from "./middleware/validate_jwt_token_middleware";
import { AdminOutlineController } from "./routes/admin/outline";
import { AdminOutlineComponentController } from "./routes/admin/outline_component";
import { DosenGroupController } from "./routes/dosen/group";
import { DosenGroupMemberController } from "./routes/dosen/group_member";
import { DosenGuidanceController } from "./routes/dosen/guidance";
import { DosenMeetingScheduleController } from "./routes/dosen/meeting_schedule";
import { DosenProfileController } from "./routes/dosen/profile";
import { MahasiswaGroupController } from "./routes/mahasiswa/group";
import { MahasiswaGuidanceController } from "./routes/mahasiswa/guidance";
import { MahasiswaMeetingScheduleController } from "./routes/mahasiswa/meeting_schedule";
import { MahasiswaMentorController } from "./routes/mahasiswa/mentor";
import { MahasiswaOutlineController } from "./routes/mahasiswa/outline";
import { MahasiswaProfileController } from "./routes/mahasiswa/profile";
import { SettingAccessMenuController } from "./routes/setting/access_menu";
import { SettingAccessModulController } from "./routes/setting/access_modul";
import { AuthController } from "./routes/setting/auth";
import { SettingDocumentationController } from "./routes/setting/documentation";
import { SettingMasterCategoryController } from "./routes/setting/master_category";
import { SettingMasterDataController } from "./routes/setting/master_data";
import { SettingMenuController } from "./routes/setting/menu";
import { SettingModulController } from "./routes/setting/modul";
import { SettingParameterController } from "./routes/setting/parameter";
import { SettingUserController } from "./routes/setting/user";
import { SettingUserGroupController } from "./routes/setting/user_group";
import { sendSingleNotification } from "./utils/firebase_messaging";
import { generateUUID } from "./utils/function";
import { HTTP_RESPONSE_CODE } from "./utils/http_response_code";

const router = new Router<DefaultState, Context>();

router.post("/notification/send", async (ctx, next) => {
  try {
    const token = "e_gLxcnNQDmACuAD26PKNs:APA91bE-bIhwy_rJU-1JD_Ctno1CVTQVKDaU3j9OODTIU_TC7k4vYiGBy1S2n-DwCS1SCsEiy807sRNKmu8o-yiq-EAi-9qJI2ZoC8Yv4fQK11y5AmJuodn9GQWnYuuZd927D3BHiqSI";
    const messaging = await sendSingleNotification(token, {
      title: "Ini adalah title",
      body: "Ini adalah body",
      data: {
        id: generateUUID(),
        name: "Zeffry Reynando",
      },
    });

    if (messaging.failureCount > 0) {
      ctx.status = HTTP_RESPONSE_CODE.BAD_REQUEST;
      return (ctx.body = {
        success: false,
        message: "Failed to send notification",
        description: messaging.results
          .map((result) => result.error?.message)
          .join("\n"),
      });
    }

    return (ctx.body = {
      success: true,
    });
  } catch (error: any) {
    console.log({ error });
    ctx.status = HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR;
    return (ctx.body = {
      success: false,
      message: error?.message ?? "Unknown Error",
    });
  }
});

//! Authentication
router.post(`/login`, AuthController.login);
router.post(`/logout`, AuthController.logout);
router.post(`/beta/register`, AuthController.betaRegister);

//! Setting Section
router.get(`/setting/user`, SettingUserController.getUsers);
router.post(`/setting/user`, SettingUserController.createUsers);
router.put(`/setting/user/:id`, SettingUserController.updateUsers);
router.put(
  `/setting/user/update_name/:id`,
  SettingUserController.updateNameUsers
);
router.del(`/setting/user/:id`, SettingUserController.deleteUsers);

router.get(`/setting/user_group`, SettingUserGroupController.getUserGroup);
router.post(`/setting/user_group`, SettingUserGroupController.createUserGroup);
router.put(
  `/setting/user_group/:id`,
  SettingUserGroupController.updateUserGroup
);
router.del(
  `/setting/user_group/:id`,
  SettingUserGroupController.deleteUserGroup
);

router.get(`/setting/modul`, SettingModulController.getModul);
router.post(`/setting/modul`, SettingModulController.createModul);
router.put(`/setting/modul/:id`, SettingModulController.updateModul);
router.del(`/setting/modul/:id`, SettingModulController.deleteModul);

router.get(`/setting/menu`, SettingMenuController.getMenu);
router.post(`/setting/menu`, SettingMenuController.createMenu);
router.put(`/setting/menu/:id`, SettingMenuController.updateMenu);
router.del(`/setting/menu/:id`, SettingMenuController.deleteMenu);

router.get(`/setting/access_modul`, SettingAccessModulController.get);
router.get(
  `/setting/access_modul/by_user_group/:app_group_user_id`,
  validateJWTToken,
  SettingAccessModulController.getByUserGroup
);
router.post(`/setting/access_modul`, SettingAccessModulController.create);

router.get(`/setting/access_menu`, SettingAccessMenuController.get);
router.get(
  `/setting/access_menu/by_user_group/:app_group_user_id`,
  validateJWTToken,
  SettingAccessMenuController.getByUserGroup
);
router.post(`/setting/access_menu`, SettingAccessMenuController.create);

router.get(`/setting/master_category`, SettingMasterCategoryController.get);
router.post(`/setting/master_category`, SettingMasterCategoryController.create);
router.put(
  `/setting/master_category/:id`,
  SettingMasterCategoryController.update
);
router.del(
  `/setting/master_category/:id`,
  SettingMasterCategoryController.delete
);

router.get(`/setting/master_data`, SettingMasterDataController.get);
router.get(
  `/setting/master_data/by-code/:code`,
  SettingMasterDataController.getByCode
);
router.get(
  `/setting/master_data/by-category-code/:category_code`,
  SettingMasterDataController.getByCategoryCodeCategory
);
router.post(`/setting/master_data`, SettingMasterDataController.create);
router.put(`/setting/master_data/:id`, SettingMasterDataController.update);
router.del(`/setting/master_data/:id`, SettingMasterDataController.delete);

router.get(`/setting/parameter`, SettingParameterController.get);
router.post(`/setting/parameter`, SettingParameterController.create);
router.put(`/setting/parameter/:id`, SettingParameterController.update);
router.del(`/setting/parameter/:id`, SettingParameterController.delete);

router.get(`/setting/documentation`, SettingDocumentationController.get);
router.post(`/setting/documentation`, SettingDocumentationController.create);
router.put(`/setting/documentation/:id`, SettingDocumentationController.update);
router.del(`/setting/documentation/:id`, SettingDocumentationController.delete);

/// Start Application API

//! Admin

router.get(`/admin/outline`, validateJWTToken, AdminOutlineController.get);
router.get(
  `/admin/outline/:id`,
  validateJWTToken,
  AdminOutlineController.getById
);
router.post(`/admin/outline`, validateJWTToken, AdminOutlineController.create);
router.put(
  `/admin/outline/:id`,
  validateJWTToken,
  AdminOutlineController.update
);
router.del(
  `/admin/outline/:id`,
  validateJWTToken,
  AdminOutlineController.delete
);

router.get(
  `/admin/outline-component`,
  validateJWTToken,
  AdminOutlineComponentController.get
);
router.get(
  `/admin/outline-component/:id`,
  validateJWTToken,
  AdminOutlineComponentController.getById
);
router.get(
  `/admin/outline-component/by-outline-id/:outline_id`,
  validateJWTToken,
  AdminOutlineComponentController.getByOutlineId
);

//! Dosen

router.get(
  `/dosen/my-group/active/:user_id`,
  validateJWTToken,
  DosenGroupController.getMyActiveGroup
);
router.get(
  `/dosen/my-group/active/member/:user_id`,
  validateJWTToken,
  DosenGroupController.getMyActiveGroupMember
);
router.get(
  `/dosen/my-group/:user_id`,
  validateJWTToken,
  DosenGroupController.getMyGroup
);
router.get(`/dosen/group`, validateJWTToken, DosenGroupController.get);
router.get(`/dosen/group/:id`, validateJWTToken, DosenGroupController.getById);
router.get(
  `/dosen/group/by-code/:code`,
  validateJWTToken,
  DosenGroupController.getByCode
);

router.post(`/dosen/group`, validateJWTToken, DosenGroupController.create);
router.put(`/dosen/group/:id`, validateJWTToken, DosenGroupController.update);
router.put(
  `/dosen/my-group/:user_id`,
  validateJWTToken,
  DosenGroupController.updateActiveGroup
);
router.del(`/dosen/group/:id`, validateJWTToken, DosenGroupController.delete);

router.get(`/dosen/group-member`, DosenGroupMemberController.get);
router.get(
  `/dosen/group-member/:id`,
  validateJWTToken,
  DosenGroupMemberController.getById
);
router.get(
  `/dosen/group-member/by-group-id/:group_id`,
  validateJWTToken,
  DosenGroupMemberController.getByGroupId
);
router.get(
  `/dosen/group-member/by-group-code/:group_code`,
  validateJWTToken,
  DosenGroupMemberController.getByGroupCode
);

router.get(
  `/dosen/meeting-schedule/:id`,
  validateJWTToken,
  DosenMeetingScheduleController.getById
);
router.get(
  `/dosen/meeting-schedule/:user_id/type/:type`,
  validateJWTToken,
  DosenMeetingScheduleController.getByUserIdAndType
);
router.post(`/dosen/meeting-schedule`, DosenMeetingScheduleController.create);
router.post(
  `/dosen/meeting-schedule/personal`,
  DosenMeetingScheduleController.createPersonal
);
router.put(
  `/dosen/meeting-schedule/:id`,
  DosenMeetingScheduleController.update
);
router.put(
  `/dosen/meeting-schedule/personal/:id`,
  DosenMeetingScheduleController.updatePersonal
);

router.get(
  `/dosen/profile/:user_id`,
  validateJWTToken,
  DosenProfileController.getById
);
router.put(`/dosen/profile`, validateJWTToken, DosenProfileController.update);

router.get(
  `/dosen/guidance/detail/submission/:id`,
  DosenGuidanceController.getById
);
router.get(
  `/dosen/guidance/master-outline-component/:user_id`,
  DosenGuidanceController.getMasterOutline
);
router.get(
  `/dosen/guidance/detail/:user_id/code-master-outline-component/:code`,
  DosenGuidanceController.getGuidanceByCodeMasterOutline
);
router.put(
  `/dosen/guidance/detail/submission/:id`,
  validateJWTToken,
  DosenGuidanceController.updateSubmission
);

//! Mahasiswa
router.get(
  `/mahasiswa/my-group/:user_id`,
  validateJWTToken,
  MahasiswaGroupController.getByUserId
);
router.get(
  `/mahasiswa/group/search-by-code/:group_code`,
  validateJWTToken,
  MahasiswaGroupController.searchByGroupCode
);
router.post(
  `/mahasiswa/group/join`,
  validateJWTToken,
  MahasiswaGroupController.join
);
router.post(
  `/mahasiswa/group/exit`,
  validateJWTToken,
  MahasiswaGroupController.exit
);

router.get(
  `/mahasiswa/outline`,
  validateJWTToken,
  MahasiswaOutlineController.get
);
router.get(
  `/mahasiswa/outline/:id`,
  validateJWTToken,
  MahasiswaOutlineController.getById
);
router.get(
  `/mahasiswa/outline/by-user-id/:user_id`,
  validateJWTToken,
  MahasiswaOutlineController.getByUserId
);
router.post(
  `/mahasiswa/outline`,
  validateJWTToken,
  MahasiswaOutlineController.upsert
);

router.get(
  `/mahasiswa/meeting-schedule/:user_id`,
  validateJWTToken,
  MahasiswaMeetingScheduleController.getByUserId
);
router.get(
  `/mahasiswa/meeting-schedule/:user_id/type/:type`,
  validateJWTToken,
  MahasiswaMeetingScheduleController.getByUserIdAndType
);
router.get(
  `/mahasiswa/meeting-schedule/personal/by-meeting-schedule-id/:meeting_schedule_id`,
  validateJWTToken,
  MahasiswaMeetingScheduleController.getMeetingPersonalByMeetingId
);

router.get(
  `/mahasiswa/my-mentor/:user_id`,
  validateJWTToken,
  MahasiswaMentorController.getMentorByUserId
);

router.get(
  `/mahasiswa/profile/:user_id`,
  validateJWTToken,
  MahasiswaProfileController.getById
);
router.put(
  `/mahasiswa/profile`,
  validateJWTToken,
  MahasiswaProfileController.update
);

router.get(
  `/mahasiswa/guidance/:user_id`,
  validateJWTToken,
  MahasiswaGuidanceController.get
);
router.get(
  `/mahasiswa/guidance/detail/:user_id/code/:codeMasterOutlineComponent`,
  // validateJWTToken,
  MahasiswaGuidanceController.getGuidanceDetail
);
router.get(
  `/mahasiswa/guidance/outline/:user_id`,
  validateJWTToken,
  MahasiswaGuidanceController.getOutline
);
router.get(
  `/mahasiswa/guidance/progress/:user_id`,
  MahasiswaGuidanceController.getGuidanceProgress
);
router.post(
  `/mahasiswa/guidance/submission/start`,
  validateJWTToken,
  MahasiswaGuidanceController.start
);
router.post(
  `/mahasiswa/guidance/submission`,
  validateJWTToken,
  MahasiswaGuidanceController.submission
);

export default router;
