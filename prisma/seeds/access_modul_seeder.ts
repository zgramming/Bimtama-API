import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AccessModulSeeder = async () => {
  await prisma.appAccessModul.deleteMany();
  const superadmin = await prisma.appGroupUser.findFirst({
    where: { code: "superadmin" },
  });
  const user = await prisma.appGroupUser.findFirst({ where: { code: "user" } });

  const modul = await prisma.appModul.findMany();

  const dataSuperadmin = modul.map((val, index) => {
    return {
      app_group_user_id: superadmin?.id ?? 0,
      app_modul_id: val.id,
    };
  });

  const dataUser = modul
    .filter((val) => val.code == "CV")
    .map((val, index) => {
      return {
        app_group_user_id: user?.id ?? 0,
        app_modul_id: val.id,
      };
    });

  await prisma.appAccessModul.createMany({
    data: [...dataSuperadmin, ...dataUser],
  });
};

export default AccessModulSeeder;
