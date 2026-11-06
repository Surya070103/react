import http from "node:http";
import { OrderController } from "../controllers/OrderController";
import { AuthSession } from "../types/user";
import { sendJson } from "../utils/http";

export const handleOrderRoutes = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string,
  controller = new OrderController(),
  session: AuthSession | null = null
): Promise<boolean> => {
  if (pathname !== "/api/orders") return false;

  if (method === "GET") {
    if (!session) {
      sendJson(res, 401, { message: "Authentication required" });
      return true;
    }
    await controller.getAll(req, res, session);
    return true;
  }
  if (method === "POST") {
    if (!session) {
      sendJson(res, 401, { message: "Authentication required" });
      return true;
    }
    if (session.role !== "customer") {
      sendJson(res, 403, { message: "Customer account required" });
      return true;
    }
    await controller.create(req, res, session.id);
    return true;
  }
  return false;
};
