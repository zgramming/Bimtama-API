import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MasterCategorySeeder = async () => {
  await prisma.masterCategory.deleteMany();

  const data = [
    { code: "OUTLINE", name: "Outline" },
    { code: "OUTLINE_COMPONENT", name: "Outline Component" },
  ];

  await prisma.masterCategory.createMany({ data: data });
};

export default MasterCategorySeeder;
