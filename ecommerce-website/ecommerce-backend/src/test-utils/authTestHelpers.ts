import { createHmac } from "node:crypto";
import { UserRole } from "../types/user";

process.env.AUTH_SECRET = "test-auth-secret-that-is-at-least-thirty-two-characters";

export const sessionCookie = (role: UserRole, id = 1, email = "test@example.com"): string => {
  const payload = Buffer.from(JSON.stringify({
    id,
    name: "Test User",
    email,
    role,
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
  })).toString("base64url");
  const signature = createHmac("sha256", process.env.AUTH_SECRET as string)
    .update(payload)
    .digest("base64url");
  return `shop_easy_session=${payload}.${signature}`;
};
