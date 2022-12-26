import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MasterDataSeeder = async () => {
  await prisma.masterData.deleteMany();

  const outline = await prisma.masterCategory.findFirst({
    where: { code: "OUTLINE" },
  });

  const outlineComponent = await prisma.masterCategory.findFirst({
    where: { code: "OUTLINE_COMPONENT" },
  });

  const dataOutline = [
    {
      master_category_id: outline!.id,
      master_category_code: outline!.code,
      code: "D3_SISTEM_INFORMASI",
      name: "D3 Sistem Informasi",
      order: 1,
    },
    {
      master_category_id: outline!.id,
      master_category_code: outline!.code,
      code: "D3_SISTEM_INFORMASI_AKUNTANSI",
      name: "D3 Sistem Informasi Akuntansi",
      order: 2,
    },
    {
      master_category_id: outline!.id,
      master_category_code: outline!.code,
      code: "D3_TEKNOLOGI_KOMPUTER",
      name: "D3 Teknologi Komputer",
      order: 3,
    },
    {
      master_category_id: outline!.id,
      master_category_code: outline!.code,
      code: "S1_ILMU_KOMPUTER",
      name: "S1 Ilmu Komputer",
      order: 4,
    },
    {
      master_category_id: outline!.id,
      master_category_code: outline!.code,
      code: "S1_SISTEM_INFORMASI",
      name: "S1 Sistem Informasi",
      order: 5,
    },
  ];

  const dataOutlineComponent = [
    {
      master_category_id: outlineComponent!.id,
      master_category_code: outlineComponent!.code,
      code: "OUTLINE_COMPONENT_BAB1",
      name: "BAB I",
      order: 1,
    },
    {
      master_category_id: outlineComponent!.id,
      master_category_code: outlineComponent!.code,
      code: "OUTLINE_COMPONENT_BAB2",
      name: "BAB II",
      order: 2,
    },
    {
      master_category_id: outlineComponent!.id,
      master_category_code: outlineComponent!.code,
      code: "OUTLINE_COMPONENT_BAB3",
      name: "BAB III",
      order: 3,
    },
    {
      master_category_id: outlineComponent!.id,
      master_category_code: outlineComponent!.code,
      code: "OUTLINE_COMPONENT_BAB4",
      name: "BAB IV",
      order: 4,
    },
    {
      master_category_id: outlineComponent!.id,
      master_category_code: outlineComponent!.code,
      code: "OUTLINE_COMPONENT_BAB5",
      name: "BAB V",
      order: 5,
    },
  ];

  await prisma.masterData.createMany({
    data: [...dataOutline, ...dataOutlineComponent],
  });
};

export default MasterDataSeeder;
