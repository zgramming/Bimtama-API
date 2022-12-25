import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MasterCategorySeeder = async () => {
  await prisma.masterCategory.deleteMany();

  const data = [
    { code: "LEVEL_SKILL", name: "Level Skill" },
    { code: "KODE_TEMPLATE_WEB", name: "Kode Template Website" },
    { code: "KODE_TEMPLATE_PDF", name: "Kode Template PDF" },
  ];

  await prisma.masterCategory.createMany({ data: data });
};

export default MasterCategorySeeder;
