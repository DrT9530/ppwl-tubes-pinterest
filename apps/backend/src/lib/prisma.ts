// lib/prisma.ts — Entry point utama Prisma
// Otomatis pilih SQLite (dev) atau PostgreSQL (production)

export { db } from "./db.js";
export { dbPostgres } from "./dbPostgres.js";

// Export default: gunakan PostgreSQL di production, SQLite di development
import { db } from "./db.js";
import { dbPostgres } from "./dbPostgres.js";

export const prisma = process.env.NODE_ENV === "production" ? dbPostgres : db;
