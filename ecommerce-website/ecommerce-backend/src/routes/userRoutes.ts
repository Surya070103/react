import http from "node:http";
import { UserController } from "../controllers/UserController";
import { AuthSession } from "../types/user";
import { sendJson } from "../utils/http";

export const handleUserRoutes = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string,
  controller = new UserController(),
  session: AuthSession | null = null
): Promise<boolean> => {
  if (pathname === "/api/users" || /^\/api\/users\/\d+(?:\/password)?$/.test(pathname)) {
    if (!session) {
      sendJson(res, 401, { message: "Authentication required" });
      return true;
    }
    if (session.role !== "admin") {
      sendJson(res, 403, { message: "Admin account required" });
      return true;
    }
  }

  if (pathname === "/api/users") {
    if (method === "GET") {
      await controller.getAll(req, res);
      return true;
    }
    if (method === "POST") {
      await controller.create(req, res);
      return true;
    }
  }

  const passwordMatch = pathname.match(/^\/api\/users\/(\d+)\/password$/);
  if (passwordMatch && method === "POST") {
    await controller.resetPassword(Number(passwordMatch[1]), req, res);
    return true;
  }

  const userMatch = pathname.match(/^\/api\/users\/(\d+)$/);
  if (userMatch) {
    const id = Number(userMatch[1]);
    if (method === "GET") {
      await controller.getById(id, req, res);
      return true;
    }
    if (method === "PATCH" || method === "PUT") {
      await controller.update(id, req, res);
      return true;
    }
    if (method === "DELETE") {
      await controller.delete(id, req, res);
      return true;
    }
  }

  return false;
};
