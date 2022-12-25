import { Prisma } from "@prisma/client";

export const handlerPrismaError = (e: any) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    console.log({ type: "Prisma.PrismaClientKnownRequestError" });
  } else if (e instanceof Prisma.PrismaClientUnknownRequestError) {
    console.log({ type: "Prisma.PrismaClientUnknownRequestError" });
  } else if (e instanceof Prisma.PrismaClientRustPanicError) {
    console.log({ type: "Prisma.PrismaClientRustPanicError" });
  } else if (e instanceof Prisma.PrismaClientInitializationError) {
    console.log({ type: "Prisma.PrismaClientInitializationError" });
  } else if (e instanceof Prisma.PrismaClientValidationError) {
    console.log({ type: "Prisma.PrismaClientValidationError" });
  } else {
    console.log({ type: "Unknown Prisma Error, Re-throw again" });
    throw e;
  }
};
