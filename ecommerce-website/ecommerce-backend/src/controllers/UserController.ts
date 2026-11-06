import http from "node:http";
import { UserService } from "../services/UserService";
import { AuthService } from "../services/AuthService";
import { CreateUserInput, UpdateUserInput } from "../types/user";
import { parseJsonBody, sendEmpty, sendJson } from "../utils/http";

const publicUser = (user: Awaited<ReturnType<UserService["getById"]>>) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phoneno: user.phoneno,
  status: user.status,
  role: user.role,
  orders: user.orders,
  joined: user.joined,
  actions: user.actions,
});

export class UserController {
  constructor(
    private readonly userService = new UserService(),
    private readonly authService = new AuthService()
  ) {}

  getAll = async (_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const users = await this.userService.getAll();
    sendJson(res, 200, users.map(publicUser));
  };

  getById = async (id: number, _req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const user = await this.userService.getById(id);
    sendJson(res, 200, publicUser(user));
  };

  create = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const body = await parseJsonBody<CreateUserInput>(req);
    const user = await this.userService.create(body);
    sendJson(res, 201, publicUser(user));
  };

  update = async (id: number, req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const body = await parseJsonBody<UpdateUserInput>(req);
    const user = await this.userService.update(id, body);
    sendJson(res, 200, publicUser(user));
  };

  delete = async (id: number, _req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    await this.userService.delete(id);
    sendEmpty(res, 204);
  };

  resetPassword = async (id: number, req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const body = await parseJsonBody<{ password?: unknown }>(req);
    await this.authService.resetCustomerPassword(id, body.password);
    sendEmpty(res, 204);
  };
}
