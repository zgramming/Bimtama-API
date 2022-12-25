import { PrismaClient } from "@prisma/client";
import { AVAILABLE_ACCESS_MENU } from "../../utils/constant";

const prisma = new PrismaClient();

const AccessMenuSeeder = async () => {
  await prisma.appAccessMenu.deleteMany();
  const superadmin = await prisma.appGroupUser.findFirst({
    where: { code: "superadmin" },
  });
  const user = await prisma.appGroupUser.findFirst({ where: { code: "user" } });

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

  const dataUser = menu
    .filter((val) => val.app_modul.code == "CV")
    .map((val, index) => {
      return {
        app_group_user_id: user?.id ?? 0,
        app_modul_id: val.app_modul_id,
        app_menu_id: val.id,
        allowed_access: AVAILABLE_ACCESS_MENU,
      };
    });

  await prisma.appAccessMenu.createMany({
    data: [...dataSuperadmin, ...dataUser],
  });
};

export default AccessMenuSeeder;
