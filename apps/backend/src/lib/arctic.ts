import { Google } from "arctic";

const callbackURL = process.env.NODE_ENV === "production"
  ? `${process.env.BACKEND_URL}/auth/google/callback`
  : "http://localhost:3000/auth/google/callback";

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL
);
