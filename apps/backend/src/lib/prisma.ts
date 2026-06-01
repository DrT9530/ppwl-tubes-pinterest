// lib/prisma.ts — Prisma client singleton
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fix for AWS Lambda (Serverless) DB Connection Exhaustion
let dbUrl = process.env.DATABASE_URL || "";
if (process.env.NODE_ENV === "production" && dbUrl && !dbUrl.includes("connection_limit")) {
  const separator = dbUrl.includes("?") ? "&" : "?";
  dbUrl = `${dbUrl}${separator}connection_limit=1`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
