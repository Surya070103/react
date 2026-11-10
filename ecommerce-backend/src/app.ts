import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { ProductController } from "./controllers/ProductController";
import { UserController } from "./controllers/UserController";
import { CartController } from "./controllers/CartController";
import { OrderController } from "./controllers/OrderController";
import { AuthController } from "./controllers/AuthController";
import { CartService } from "./services/CartService";
import { OrderService } from "./services/OrderService";
import { CartRepository } from "./repositories/CartRepository";
import { OrderRepository } from "./repositories/OrderRepository";
import { handleProductRoutes } from "./routes/productRoutes";
import { handleUserRoutes } from "./routes/userRoutes";
import { handleCartRoutes } from "./routes/cartRoutes";
import { handleOrderRoutes } from "./routes/orderRoutes";
import { handleAuthRoutes } from "./routes/authRoutes";
import { AuthService } from "./services/AuthService";
import { sendJson, setCorsHeaders } from "./utils/http";

export const createRequestListener = (
  userController = new UserController(),
  productController = new ProductController(),
  cartController = new CartController(new CartService()),
  orderController = new OrderController(new OrderService()),
  authService = new AuthService()
): http.RequestListener => async (req, res): Promise<void> => {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const host = req.headers.host || "localhost";
    const parsedUrl = new URL(req.url || "/", `http://${host}`);
    const pathname = parsedUrl.pathname;
    const method = req.method?.toUpperCase() || "GET";

    try {
      const authController = new AuthController(authService);
      if (await handleAuthRoutes(req, res, pathname, method, authController)) {
        return;
      }

      if (pathname === "/" && method === "GET") {
        sendJson(res, 200, { message: "E-commerce backend is running" });
        return;
      }

      if (pathname.startsWith("/images/") && method === "GET") {
        const safeSuffix = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
        const filePath = path.join(__dirname, "../public", safeSuffix);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".webp": "image/webp",
          };
          const contentType = mimeTypes[ext] || "application/octet-stream";
          res.writeHead(200, { "Content-Type": contentType });
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }

      const session = await authService.authenticate(req);

      if (await handleUserRoutes(req, res, pathname, method, userController, session)) {
        return;
      }

      if (await handleProductRoutes(req, res, pathname, method, productController, session)) {
        return;
      }

      if (await handleCartRoutes(req, res, pathname, method, cartController)) {
        return;
      }

      if (await handleOrderRoutes(req, res, pathname, method, orderController, session)) {
        return;
      }

      sendJson(res, 404, { message: "Route not found" });
    } catch (error: unknown) {
      console.error("Server error:", error);
      const message = error instanceof Error ? error.message : "Unexpected server error";
      sendJson(res, 400, { message });
    }
  };

export const requestListener = createRequestListener();
export const app = http.createServer(requestListener);
