// lib/db.ts — Prisma client singleton untuk LOCAL development (SQLite)
// Digunakan saat NODE_ENV !== "production"
import { PrismaClient } from "../../node_modules/.prisma/client-sqlite/index.js";

const globalForPrisma = globalThis as unknown as {
  prismaLocal: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prismaLocal ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaLocal = db;
}
