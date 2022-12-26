import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AccessModulSeeder = async () => {
  await prisma.appAccessModul.deleteMany();
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

  const modul = await prisma.appModul.findMany();

  const dataSuperadmin = modul.map((val, index) => {
    return {
      app_group_user_id: superadmin?.id ?? 0,
      app_modul_id: val.id,
    };
  });

  const dataAdmin = modul
    .filter((val) => val.code == "ADMIN")
    .map((val, index) => {
      return {
        app_group_user_id: admin?.id ?? 0,
        app_modul_id: val.id,
      };
    });

  const dataDosen = modul
    .filter((val) => val.code == "DOSEN")
    .map((val, index) => {
      return {
        app_group_user_id: dosen?.id ?? 0,
        app_modul_id: val.id,
      };
    });

  const dataMahasiswa = modul
    .filter((val) => val.code == "MAHASISWA")
    .map((val, index) => {
      return {
        app_group_user_id: mahasiswa?.id ?? 0,
        app_modul_id: val.id,
      };
    });

  await prisma.appAccessModul.createMany({
    data: [...dataSuperadmin, ...dataAdmin, ...dataDosen, ...dataMahasiswa],
  });
};

export default AccessModulSeeder;
