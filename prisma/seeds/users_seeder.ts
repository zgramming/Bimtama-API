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

  const user = await prisma.appGroupUser.findFirst({ where: { code: "user" } });

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
      app_group_user_id: user?.id ?? 0,
      name: "Zeffry Reynando",
      email: "zeffry.reynando@gmail.com",
      username: "zeffry",
      password: hashSync("zeffry", saltRounds),
      status: "active" as UserStatus,
    },
  ];
  await prisma.users.createMany({ data: data });
};

export default UsersSeeder;
