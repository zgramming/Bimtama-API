import { CommonStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UserGroupData {
  name: string;
  code: string;
  status: CommonStatus;
}

const UserGroupSeeder = async () => {
  await prisma.appGroupUser.deleteMany();
  const data: UserGroupData[] = [
    { name: "Superadmin", code: "superadmin", status: "active" },
    { name: "Admin", code: "admin", status: "active" },
    { name: "Dosen", code: "dosen", status: "active" },
    { name: "Mahasiswa", code: "mahasiswa", status: "active" },
  ];
  await prisma.appGroupUser.createMany({ data: data });
};

export default UserGroupSeeder;
