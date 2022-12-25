import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MenuSeeder = async () => {
  await prisma.appMenu.deleteMany();
  const modulSetting = await prisma.appModul.findFirst({
    where: {
      code: "SETTING",
    },
  });
  const modulCV = await prisma.appModul.findFirst({
    where: {
      code: "CV",
    },
  });

  const curriculumVitaeMenu = [
    {
      app_modul_id: modulCV?.id ?? 0,
      code: "CV_PROFILE",
      name: "Profile",
      route: "/cv/profile",
      order: 1,
    },
    {
      app_modul_id: modulCV?.id ?? 0,
      code: "CV_EXPERIENCE",
      name: "Experience",
      route: "/cv/experience",
      order: 2,
    },
    {
      app_modul_id: modulCV?.id ?? 0,
      code: "CV_EDUCATION",
      name: "Education",
      route: "/cv/education",
      order: 3,
    },
    {
      app_modul_id: modulCV?.id ?? 0,
      code: "CV_SKILL",
      name: "Skill",
      route: "/cv/skill",
      order: 4,
    },
    {
      app_modul_id: modulCV?.id ?? 0,
      code: "CV_LICENSE_CERTIFICATE",
      name: "License & Certificate",
      route: "/cv/license_certificate",
      order: 5,
    },
    {
      app_modul_id: modulCV?.id ?? 0,
      code: "CV_PORTFOLIO",
      name: "Portfolio",
      route: "/cv/portfolio",
      order: 6,
    },
    {
      app_modul_id: modulCV?.id ?? 0,
      code: "CV_CONTACT",
      name: "Kontak",
      route: "/cv/contact",
      order: 7,
    },
    {
      app_modul_id: modulCV?.id ?? 0,
      code: "CV_PREVIEW",
      name: "Preview",
      route: "/cv/preview",
      order: 8,
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

  await prisma.appMenu.createMany({
    data: [...settingMenu, ...curriculumVitaeMenu],
  });

  const parentMenu = await prisma.appMenu.findFirst({
    where: { code: "SETTING_PARENT_MENU" },
  });

  await prisma.appMenu.createMany({
    data: [
      {
        app_modul_id: modulSetting?.id ?? 0,
        app_menu_id_parent: parentMenu?.id ?? 0,
        code: "SETTING_CHILDREN_1",
        name: "Children Menu 1",
        route: "/setting/parent/children_1",
        order: 11,
      },
      {
        app_modul_id: modulSetting?.id ?? 0,
        app_menu_id_parent: parentMenu?.id ?? 0,
        code: "SETTING_CHILDREN_2",
        name: "Children Menu 2",
        route: "/setting/parent/children_2",
        order: 12,
      },
    ],
  });
};

export default MenuSeeder;
