import { Prisma } from "@prisma/client";

export const handlerPrismaError = (e: any) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    console.log({ type: "Prisma.PrismaClientKnownRequestError", e });
  } else if (e instanceof Prisma.PrismaClientUnknownRequestError) {
    console.log({ type: "Prisma.PrismaClientUnknownRequestError", e });
  } else if (e instanceof Prisma.PrismaClientRustPanicError) {
    console.log({ type: "Prisma.PrismaClientRustPanicError", e });
  } else if (e instanceof Prisma.PrismaClientInitializationError) {
    console.log({ type: "Prisma.PrismaClientInitializationError", e });
  } else if (e instanceof Prisma.PrismaClientValidationError) {
    console.log({ type: "Prisma.PrismaClientValidationError", e });
  } else {
    console.log({ type: "Unknown Prisma Error, Re-throw again", e });
    throw e;
  }
};
