// src/index.ts — Entry point untuk development lokal (Bun)
import { app } from "./app";

const PORT = process.env.PORT || 3000;

// Bun native server
export default {
  port: PORT,
  fetch: app.fetch,
};

console.log(`🦊 Hono is running at http://localhost:${PORT}`);