import http from "node:http";
import { ProductService } from "../services/ProductService";
import { CreateProductInput, UpdateProductInput } from "../types/product";
import { parseJsonBody, sendEmpty, sendJson } from "../utils/http";

export class ProductController {
  constructor(private readonly productService = new ProductService()) {}

  getAll = async (_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const products = await this.productService.getAll();
    sendJson(res, 200, products);
  };

  getById = async (id: number, _req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const product = await this.productService.getById(id);
    sendJson(res, 200, product);
  };

  create = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const body = await parseJsonBody<CreateProductInput>(req);
    const product = await this.productService.create(body);
    sendJson(res, 201, product);
  };

  update = async (id: number, req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const body = await parseJsonBody<UpdateProductInput>(req);
    const product = await this.productService.update(id, body);
    sendJson(res, 200, product);
  };

  delete = async (id: number, _req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    await this.productService.delete(id);
    sendEmpty(res, 204);
  };
}
