import http from "node:http";
import { CartService } from "../services/CartService";
import { parseJsonBody, sendJson } from "../utils/http";

export class CartController {
  constructor(private readonly cartService = new CartService()) {}

  get = async (cartKey: string, _req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    sendJson(res, 200, await this.cartService.get(cartKey));
  };

  update = async (cartKey: string, req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const body = await parseJsonBody<unknown>(req);
    sendJson(res, 200, await this.cartService.update(cartKey, body));
  };
}
