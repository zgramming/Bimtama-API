import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ModulSeeder = async () => {
  await prisma.appModul.deleteMany();
  const data = [
    { code: "SETTING", name: "Setting", order: 99, pattern: "/setting" },
    { code: "DOSEN", name: "Dosen", order: 1, pattern: "/dosen" },
    { code: "MAHASISWA", name: "Mahasiswa", order: 2, pattern: "/mahasiswa" },
    { code: "ADMIN", name: "Admin", order: 3, pattern: "/admin" },
  ];
  await prisma.appModul.createMany({ data: data });
};

export default ModulSeeder;
