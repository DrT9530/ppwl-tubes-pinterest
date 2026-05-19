// src/lambda.ts — Entry point khusus untuk AWS Lambda
import { handle } from "hono/aws-lambda";
import { app } from "./app";

// Export handler untuk Lambda
export const handler = handle(app);
