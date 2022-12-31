import { PrismaClient } from "@prisma/client";
import { generateUUID } from "../../utils/function";

const prisma = new PrismaClient();

const MenuSeeder = async () => {
  await prisma.appMenu.deleteMany();

  const modulSetting = await prisma.appModul.findFirst({
    where: {
      code: "SETTING",
    },
  });

  const modulAdmin = await prisma.appModul.findFirst({
    where: {
      code: "ADMIN",
    },
  });

  const modulMahasiswa = await prisma.appModul.findFirst({
    where: {
      code: "MAHASISWA",
    },
  });

  const modulDosen = await prisma.appModul.findFirst({
    where: {
      code: "DOSEN",
    },
  });

  const dosenMenu = [
    {
      app_modul_id: modulDosen?.id ?? 0,
      code: "DOSEN_DASHBOARD",
      name: "Dashboard",
      route: "/dosen/dashboard",
      order: 1,
    },
    {
      app_modul_id: modulDosen?.id ?? 0,
      code: "DOSEN_GROUP",
      name: "Kelompok",
      route: "/dosen/group",
      order: 2,
    },
    {
      app_modul_id: modulDosen?.id ?? 0,
      code: "DOSEN_MEETING_SCHEDULE",
      name: "Jadwal Pertemuan",
      route: "?/dosen/meeting_schedule",
      order: 3,
    },
    {
      app_modul_id: modulDosen?.id ?? 0,
      code: "DOSEN_GUIDANCE",
      name: "Bimbingan",
      route: "/dosen/guidance",
      order: 4,
    },
    {
      app_modul_id: modulDosen?.id ?? 0,
      code: "DOSEN_SETTING",
      name: "Setting",
      route: "?/dosen/setting",
      order: 5,
    },
  ];

  const mahasiswaMenu = [
    {
      app_modul_id: modulMahasiswa?.id ?? 0,
      code: "MAHASISWA_DASHBOARD",
      name: "Dashboard",
      route: "/mahasiswa/dashboard",
      order: 1,
    },
    {
      app_modul_id: modulMahasiswa?.id ?? 0,
      code: "MAHASISWA_GROUP",
      name: "Kelompok",
      route: "/mahasiswa/group",
      order: 2,
    },
    {
      app_modul_id: modulMahasiswa?.id ?? 0,
      code: "MAHASISWA_MEETING_SCHEDULE",
      name: "Jadwal Pertemuan",
      route: "?/mahasiswa/meeting_schedule",
      order: 3,
    },
    {
      app_modul_id: modulMahasiswa?.id ?? 0,
      code: "MAHASISWA_GUIDANCE",
      name: "Bimbingan",
      route: "/mahasiswa/guidance",
      order: 4,
    },
    {
      app_modul_id: modulMahasiswa?.id ?? 0,
      code: "MAHASISWA_MENTOR",
      name: "Pembimbing",
      route: "/mahasiswa/mentor",
      order: 5,
    },
    {
      app_modul_id: modulMahasiswa?.id ?? 0,
      code: "MAHASISWA_SETTING",
      name: "Setting",
      route: "?/mahasiswa/setting",
      order: 6,
    },
  ];

  const adminMenu = [
    {
      app_modul_id: modulAdmin?.id ?? 0,
      code: "ADMIN_DASHBOARD",
      name: "Dashboard",
      route: "/admin/dashboard",
      order: 1,
    },
    {
      app_modul_id: modulAdmin?.id ?? 0,
      code: "ADMIN_OUTLINE_COMPONENT",
      name: "Outline Component",
      route: "/admin/outline_component",
      order: 2,
    },
  ];

  const settingMenu = [
    {
      app_modul_id: modulSetting?.id ?? 0,
      code: "SETTING_USER_GROUP",
      name: "Management User Group",
      route: "/setting/user_group",
      order: 1,
    },
    {
      app_modul_id: modulSetting?.id ?? 0,
      code: "SETTING_USER",
      name: "Management User",
      route: "/setting/user",
      order: 2,
    },
    {
      app_modul_id: modulSetting?.id ?? 0,
      code: "SETTING_MODUL",
      name: "Modul",
      route: "/setting/modul",
      order: 3,
    },
    {
      app_modul_id: modulSetting?.id ?? 0,
      code: "SETTING_MENU",
      name: "Menu",
      route: "/setting/menu",
      order: 4,
    },
    {
      app_modul_id: modulSetting?.id ?? 0,
      code: "SETTING_ACCESS_MODUL",
      name: "Akses Modul",
      route: "/setting/access_modul",
      order: 5,
    },
    {
      app_modul_id: modulSetting?.id ?? 0,
      code: "SETTING_ACCESS_MENU",
      name: "Akses Menu",
      route: "/setting/access_menu",
      order: 6,
    },
    {
      app_modul_id: modulSetting?.id ?? 0,
      code: "SETTING_MASTER_CATEGORY",
      name: "Master Kategori",
      route: "/setting/master_category",
      order: 7,
    },
    {
      app_modul_id: modulSetting?.id ?? 0,
      code: "SETTING_DOCUMENTATION",
      name: "Dokumentasi",
      route: "/setting/documentation",
      order: 8,
    },
    {
      app_modul_id: modulSetting?.id ?? 0,
      code: "SETTING_PARAMETER",
      name: "Parameter",
      route: "/setting/parameter",
      order: 9,
    },

    // Parent & Children Menu EXAMPLE
    {
      app_modul_id: modulSetting?.id ?? 0,
      code: "SETTING_PARENT_MENU",
      name: "Parent Menu",
      route: "?/setting/parent",
      order: 10,
    },
  ];

  //! Start Insert Children Menu
  await prisma.appMenu.createMany({
    data: [...settingMenu, ...dosenMenu, ...mahasiswaMenu, ...adminMenu],
  });

  const parentMenu = await prisma.appMenu.findFirst({
    where: { code: "SETTING_PARENT_MENU" },
  });

  const dosenMeetingScheduleParent = await prisma.appMenu.findFirst({
    where: { code: "DOSEN_MEETING_SCHEDULE" },
  });

  const dosenSettingParent = await prisma.appMenu.findFirst({
    where: { code: "DOSEN_SETTING" },
  });

  const mahasiswaMeetingScheduleParent = await prisma.appMenu.findFirst({
    where: { code: "MAHASISWA_MEETING_SCHEDULE" },
  });

  const mahasiswaSettingParent = await prisma.appMenu.findFirst({
    where: { code: "MAHASISWA_SETTING" },
  });

  await prisma.appMenu.createMany({
    data: [
      {
        app_modul_id: modulSetting?.id ?? 0,
        app_menu_id_parent: parentMenu?.id ?? 0,
        code: "SETTING_CHILDREN_1",
        name: "Children Menu 1",
        route: "/setting/parent/children_1",
        order: 1,
      },
      {
        app_modul_id: modulSetting?.id ?? 0,
        app_menu_id_parent: parentMenu?.id ?? 0,
        code: "SETTING_CHILDREN_2",
        name: "Children Menu 2",
        route: "/setting/parent/children_2",
        order: 2,
      },

      //! Dosen
      {
        app_menu_id_parent: dosenMeetingScheduleParent?.id,
        app_modul_id: modulDosen?.id ?? 0,
        code: "DOSEN_MEETING_SCHEDULE_GROUP",
        name: "Kelompok",
        route: "/dosen/meeting_schedule/group",
        order: 1,
      },
      {
        app_menu_id_parent: dosenMeetingScheduleParent?.id,
        app_modul_id: modulDosen?.id ?? 0,
        code: "DOSEN_MEETING_SCHEDULE_PERSONAL",
        name: "Personal",
        route: "/dosen/meeting_schedule/personal",
        order: 2,
      },

      {
        app_menu_id_parent: dosenSettingParent?.id,
        app_modul_id: modulDosen?.id ?? 0,
        code: "DOSEN_SETTING_PROFILE",
        name: "Profile",
        route: "/dosen/setting/profile",
        order: 1,
      },
      {
        app_menu_id_parent: dosenSettingParent?.id,
        app_modul_id: modulDosen?.id ?? 0,
        code: "DOSEN_SETTING_MY_GROUP",
        name: "Kelompok Saya",
        route: "/dosen/setting/my_group",
        order: 2,
      },

      //! Mahasiswa
      {
        app_menu_id_parent: mahasiswaMeetingScheduleParent?.id,
        app_modul_id: modulMahasiswa?.id ?? 0,
        code: "MAHASISWA_MEETING_SCHEDULE_GROUP",
        name: "Kelompok",
        route: "/mahasiswa/meeting_schedule/group",
        order: 1,
      },
      {
        app_menu_id_parent: mahasiswaMeetingScheduleParent?.id,
        app_modul_id: modulMahasiswa?.id ?? 0,
        code: "MAHASISWA_MEETING_SCHEDULE_PERSONAL",
        name: "Personal",
        route: "/mahasiswa/meeting_schedule/personal",
        order: 2,
      },

      {
        app_menu_id_parent: mahasiswaSettingParent?.id,
        app_modul_id: modulMahasiswa?.id ?? 0,
        code: "MAHASISWA_SETTING_OUTLINE",
        name: "Outline",
        route: "/mahasiswa/setting/outline",
        order: 1,
      },
      {
        app_menu_id_parent: mahasiswaSettingParent?.id,
        app_modul_id: modulMahasiswa?.id ?? 0,
        code: "MAHASISWA_SETTING_PROFILE",
        name: "Profile",
        route: "/mahasiswa/setting/profile",
        order: 2,
      },
    ],
  });
};

export default MenuSeeder;
