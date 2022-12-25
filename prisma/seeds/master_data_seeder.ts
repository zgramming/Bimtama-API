import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MasterDataSeeder = async () => {
  await prisma.masterData.deleteMany();
  const levelSkillCategory = await prisma.masterCategory.findFirst({
    where: { code: "LEVEL_SKILL" },
  });
  const kodeTemplateWeb = await prisma.masterCategory.findFirst({
    where: { code: "KODE_TEMPLATE_WEB" },
  });
  const kodeTemplatePDF = await prisma.masterCategory.findFirst({
    where: { code: "KODE_TEMPLATE_PDF" },
  });

  const dataLevel = [
    {
      master_category_id: levelSkillCategory!.id,
      master_category_code: levelSkillCategory!.code,
      code: "LEVEL_SKILL_BEGINNER",
      name: "Beginner",
      order: 1,
      parameter1_key: "color",
      parameter1_value: "#9AD0EC",
    },
    {
      master_category_id: levelSkillCategory!.id,
      master_category_code: levelSkillCategory!.code,
      code: "LEVEL_SKILL_BASIC",
      name: "Basic",
      order: 2,
      parameter1_key: "color",
      parameter1_value: "#1572A1",
    },
    {
      master_category_id: levelSkillCategory!.id,
      master_category_code: levelSkillCategory!.code,
      code: "LEVEL_SKILL_INTERMEDIATE",
      name: "Intermediate",
      order: 3,
      parameter1_key: "color",
      parameter1_value: "#F5B971",
    },
    {
      master_category_id: levelSkillCategory!.id,
      master_category_code: levelSkillCategory!.code,
      code: "LEVEL_SKILL_ADVANCE",
      name: "Advance",
      order: 4,
      parameter1_key: "color",
      parameter1_value: "#D45079",
    },
  ];

  const dataKodeTemplateWebsite = [
    // Kageki Shoujo
    /// Reference : https://lmpixels.com/demo/vido/vido_vcard_template_yellow/index.html
    {
      master_category_id: kodeTemplateWeb!.id,
      master_category_code: kodeTemplateWeb!.code,
      code: "KODE_TEMPLATE_WEB_WATANASA",
      name: "Watanasa",
      description: "Watanabe Sarasa",
      order: 1,
    },
    {
      master_category_id: kodeTemplateWeb!.id,
      master_category_code: kodeTemplateWeb!.code,
      code: "KODE_TEMPLATE_WEB_NARAAI",
      name: "Naraai",
      description: "Narata Ai",
      order: 2,
    },
    {
      master_category_id: kodeTemplateWeb!.id,
      master_category_code: kodeTemplateWeb!.code,
      code: "KODE_TEMPLATE_WEB_HOSHIRU",
      name: "Hoshiru",
      description: "Hoshino Kaoru",
      order: 3,
    },
    {
      master_category_id: kodeTemplateWeb!.id,
      master_category_code: kodeTemplateWeb!.code,
      code: "KODE_TEMPLATE_WEB_YAMAKO",
      name: "Yamako",
      description: "Yamada Ayako",
      order: 4,
    },
    {
      master_category_id: kodeTemplateWeb!.id,
      master_category_code: kodeTemplateWeb!.code,
      code: "KODE_TEMPLATE_WEB_SUGISAWA",
      name: "Sugisawa",
      description: "Sugimoto Sawa",
      order: 5,
    },
  ];

  const dataKodeTemplatePDF = [
    {
      master_category_id: kodeTemplatePDF!.id,
      master_category_code: kodeTemplatePDF!.code,
      code: "KODE_TEMPLATE_PDF_SENTAGI",
      name: "Sentagi",
      description: "Senjougahara, Hitagi",
      order: 1,
    },
    {
      master_category_id: kodeTemplatePDF!.id,
      master_category_code: kodeTemplatePDF!.code,
      code: "KODE_TEMPLATE_PDF_OSHIBU",
      name: "Oshibu",
      description: "Oshino, Shinobu",
      order: 2,
    },
    {
      master_category_id: kodeTemplatePDF!.id,
      master_category_code: kodeTemplatePDF!.code,
      code: "KODE_TEMPLATE_PDF_ARAMI",
      name: "Arami",
      description: "Araragi, Koyomi",
      order: 3,
    },
  ];

  await prisma.masterData.createMany({
    data: [...dataLevel, ...dataKodeTemplateWebsite, ...dataKodeTemplatePDF],
  });
};

export default MasterDataSeeder;
