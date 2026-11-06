import http from "node:http";
import { AuthController } from "../controllers/AuthController";

export const handleAuthRoutes = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string,
  controller = new AuthController()
): Promise<boolean> => {
  if (pathname === "/api/auth/register" && method === "POST") {
    await controller.register(req, res);
    return true;
  }
  if (pathname === "/api/auth/login" && method === "POST") {
    await controller.login(req, res);
    return true;
  }
  if (pathname === "/api/auth/me" && method === "GET") {
    await controller.me(req, res);
    return true;
  }
  if (pathname === "/api/auth/logout" && method === "POST") {
    await controller.logout(req, res);
    return true;
  }
  return false;
};
