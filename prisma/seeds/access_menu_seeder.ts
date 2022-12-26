import { PrismaClient } from "@prisma/client";
import { AVAILABLE_ACCESS_MENU } from "../../utils/constant";

const prisma = new PrismaClient();

const AccessMenuSeeder = async () => {
  await prisma.appAccessMenu.deleteMany();

  const superadmin = await prisma.appGroupUser.findFirst({
    where: { code: "superadmin" },
  });

  const admin = await prisma.appGroupUser.findFirst({
    where: { code: "admin" },
  });

  const mahasiswa = await prisma.appGroupUser.findFirst({
    where: { code: "mahasiswa" },
  });

  const dosen = await prisma.appGroupUser.findFirst({
    where: { code: "dosen" },
  });

  const menu = await prisma.appMenu.findMany({
    include: { app_modul: true },
  });

  const dataSuperadmin = menu.map((val, index) => {
    return {
      app_group_user_id: superadmin?.id ?? 0,
      app_modul_id: val.app_modul_id,
      app_menu_id: val.id,
      allowed_access: AVAILABLE_ACCESS_MENU,
    };
  });

  const dataAdmin = menu
    .filter((val) => val.app_modul.code == "ADMIN")
    .map((val, index) => {
      return {
        app_group_user_id: admin?.id ?? 0,
        app_modul_id: val.app_modul_id,
        app_menu_id: val.id,
        allowed_access: AVAILABLE_ACCESS_MENU,
      };
    });

  const dataMahasiswa = menu
    .filter((val) => val.app_modul.code == "MAHASISWA")
    .map((val, index) => {
      return {
        app_group_user_id: mahasiswa?.id ?? 0,
        app_modul_id: val.app_modul_id,
        app_menu_id: val.id,
        allowed_access: AVAILABLE_ACCESS_MENU,
      };
    });

  const dataDosen = menu
    .filter((val) => val.app_modul.code == "DOSEN")
    .map((val, index) => {
      return {
        app_group_user_id: dosen?.id ?? 0,
        app_modul_id: val.app_modul_id,
        app_menu_id: val.id,
        allowed_access: AVAILABLE_ACCESS_MENU,
      };
    });

  await prisma.appAccessMenu.createMany({
    data: [...dataSuperadmin, ...dataAdmin, ...dataMahasiswa, ...dataDosen],
  });
};

export default AccessMenuSeeder;
