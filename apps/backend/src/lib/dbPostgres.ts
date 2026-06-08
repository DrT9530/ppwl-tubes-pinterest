// lib/dbPostgres.ts — Prisma client singleton untuk PRODUCTION (PostgreSQL)
// Digunakan saat NODE_ENV === "production"
// Otomatis tambah connection_limit=1 untuk AWS Lambda agar tidak exhausted
import { PrismaClient } from "../../node_modules/.prisma/client-pg/index.js";

const globalForPrisma = globalThis as unknown as {
  prismaPostgres: PrismaClient | undefined;
};

// Fix untuk AWS Lambda: batasi connection pool supaya tidak habis
let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl && !dbUrl.includes("connection_limit")) {
  const separator = dbUrl.includes("?") ? "&" : "?";
  dbUrl = `${dbUrl}${separator}connection_limit=1`;
}

export const dbPostgres =
  globalForPrisma.prismaPostgres ??
  new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaPostgres = dbPostgres;
}
