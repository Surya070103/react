import http from "node:http";
import { OrderService } from "../services/OrderService";
import { CreateOrderInput } from "../types/order";
import { AuthSession } from "../types/user";
import { parseJsonBody, sendJson } from "../utils/http";

export class OrderController {
  constructor(private readonly orderService = new OrderService()) {}

  getAll = async (_req: http.IncomingMessage, res: http.ServerResponse, session: AuthSession): Promise<void> => {
    sendJson(res, 200, await this.orderService.getAll(session));
  };

  create = async (req: http.IncomingMessage, res: http.ServerResponse, customerId: number): Promise<void> => {
    const body = await parseJsonBody<CreateOrderInput>(req);
    sendJson(res, 201, await this.orderService.create(body, customerId));
  };

  cancel = async (_req: http.IncomingMessage, res: http.ServerResponse, id: number, customerId: number): Promise<void> => {
    sendJson(res, 200, await this.orderService.cancel(id, customerId));
  };
}
