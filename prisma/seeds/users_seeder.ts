import { PrismaClient, UserStatus } from "@prisma/client";
import { hashSync } from "bcrypt";
const saltRounds = 10;

const prisma = new PrismaClient();

const UsersSeeder = async () => {
  await prisma.users.deleteMany();
  const superadmin = await prisma.appGroupUser.findFirst({
    where: {
      code: "superadmin",
    },
  });
  const admin = await prisma.appGroupUser.findFirst({
    where: {
      code: "admin",
    },
  });

  const dosen = await prisma.appGroupUser.findFirst({
    where: { code: "dosen" },
  });

  const mahasiswa = await prisma.appGroupUser.findFirst({
    where: { code: "mahasiswa" },
  });

  const data = [
    {
      app_group_user_id: superadmin?.id ?? 0,
      name: "Superadmin",
      email: "superadmin@gmail.com",
      username: "superadmin",
      password: hashSync("superadmin", saltRounds),
      status: "active" as UserStatus,
    },
    {
      app_group_user_id: mahasiswa?.id ?? 0,
      name: "Zeffry Reynando Mahasiswa",
      email: "zeffry.reynando.mahasiswa@gmail.com",
      username: "zeffrymahasiswa",
      password: hashSync("zeffrymahasiswa", saltRounds),
      status: "active" as UserStatus,
    },
    {
      app_group_user_id: dosen?.id ?? 0,
      name: "Zeffry Reynando Dosen",
      email: "zeffry.reynando.dosen@gmail.com",
      username: "zeffrydosen",
      password: hashSync("zeffrydosen", saltRounds),
      status: "active" as UserStatus,
    },
    {
      app_group_user_id: admin?.id ?? 0,
      name: "Zeffry Reynando Admin",
      email: "zeffry.reynando.admin@gmail.com",
      username: "zeffryadmin",
      password: hashSync("zeffryadmin", saltRounds),
      status: "active" as UserStatus,
    },
  ];

  await prisma.users.createMany({ data: data });
};

export default UsersSeeder;
