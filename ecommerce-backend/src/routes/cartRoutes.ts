import http from "node:http";
import { CartController } from "../controllers/CartController";

export const handleCartRoutes = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string,
  controller = new CartController()
): Promise<boolean> => {
  const cartMatch = pathname.match(/^\/api\/carts\/([0-9a-f-]{36})$/i);
  if (!cartMatch) return false;

  if (method === "GET") {
    await controller.get(cartMatch[1], req, res);
    return true;
  }
  if (method === "PUT") {
    await controller.update(cartMatch[1], req, res);
    return true;
  }
  return false;
};
