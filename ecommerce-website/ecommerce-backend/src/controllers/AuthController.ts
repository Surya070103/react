import http from "node:http";
import { AuthService } from "../services/AuthService";
import { RegisterInput } from "../types/user";
import { parseJsonBody, sendJson } from "../utils/http";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  register = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const body = await parseJsonBody<RegisterInput>(req);
    const result = await this.authService.register(body);
    res.setHeader("Set-Cookie", this.authService.sessionCookie(result.token));
    sendJson(res, 201, { user: result.user });
  };

  login = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const body = await parseJsonBody<{ email?: unknown; password?: unknown }>(req);
    const result = await this.authService.login(body.email, body.password);
    res.setHeader("Set-Cookie", this.authService.sessionCookie(result.token));
    sendJson(res, 200, { user: result.user });
  };

  me = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const user = await this.authService.authenticate(req);
    if (!user) {
      sendJson(res, 401, { message: "Authentication required" });
      return;
    }
    sendJson(res, 200, { user });
  };

  logout = async (_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    res.setHeader("Set-Cookie", this.authService.clearSessionCookie());
    sendJson(res, 200, { message: "Logged out" });
  };
}
