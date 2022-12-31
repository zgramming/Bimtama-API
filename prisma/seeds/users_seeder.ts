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
      app_group_user_id: dosen?.id ?? 0,
      name: "Andri Apriyono",
      email: "andri.apriyono@gmail.com",
      username: "andriapriyono",
      password: hashSync("andriapriyono", saltRounds),
      status: "active" as UserStatus,
    },
    {
      app_group_user_id: mahasiswa?.id ?? 0,
      name: "Zeffry Reynando",
      email: "zeffry.reynando@gmail.com",
      username: "zeffry",
      password: hashSync("zeffry", saltRounds),
      status: "active" as UserStatus,
    },
    {
      app_group_user_id: mahasiswa?.id ?? 0,
      name: "Syarif Hidayatullah",
      email: "syarif@gmail.com",
      username: "syarif",
      password: hashSync("syarif", saltRounds),
      status: "active" as UserStatus,
    },
    {
      app_group_user_id: mahasiswa?.id ?? 0,
      name: "Helmi Aji Hamamamiardi",
      email: "helmi@gmail.com",
      username: "helmi",
      password: hashSync("helmi", saltRounds),
      status: "active" as UserStatus,
    },
    {
      app_group_user_id: admin?.id ?? 0,
      name: "Admin Website",
      email: "admin.website@gmail.com",
      username: "admin",
      password: hashSync("admin", saltRounds),
      status: "active" as UserStatus,
    },
  ];

  await prisma.users.createMany({ data: data });
};

export default UsersSeeder;
