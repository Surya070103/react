import http from "node:http";
import { ProductController } from "../controllers/ProductController";
import { AuthSession } from "../types/user";
import { sendJson } from "../utils/http";

export const handleProductRoutes = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string,
  controller = new ProductController(),
  session: AuthSession | null = null
): Promise<boolean> => {
  if (pathname === "/api/products") {
    if (method === "GET") {
      await controller.getAll(req, res);
      return true;
    }
    if (method === "POST") {
      if (!session || session.role !== "admin") {
        sendJson(res, session ? 403 : 401, { message: session ? "Admin account required" : "Authentication required" });
        return true;
      }
      await controller.create(req, res);
      return true;
    }
  }

  const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
  if (productMatch) {
    const id = Number(productMatch[1]);
    if (method === "GET") {
      await controller.getById(id, req, res);
      return true;
    }
    if (method === "PATCH" || method === "PUT") {
      if (!session || session.role !== "admin") {
        sendJson(res, session ? 403 : 401, { message: session ? "Admin account required" : "Authentication required" });
        return true;
      }
      await controller.update(id, req, res);
      return true;
    }
    if (method === "DELETE") {
      if (!session || session.role !== "admin") {
        sendJson(res, session ? 403 : 401, { message: session ? "Admin account required" : "Authentication required" });
        return true;
      }
      await controller.delete(id, req, res);
      return true;
    }
  }

  return false;
};
