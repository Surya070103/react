import { CartItem } from "../entities/Cart";
import { CartRepository } from "../repositories/CartRepository";
import { ProductRepository } from "../repositories/ProductRepository";

export class CartService {
  constructor(
    private readonly cartRepository: Pick<CartRepository, "findByKey" | "save" | "delete"> = new CartRepository(),
    private readonly productRepository: Pick<ProductRepository, "findById"> = new ProductRepository()
  ) {}

  async get(cartKey: string): Promise<CartItem[]> {
    return (await this.cartRepository.findByKey(cartKey))?.items ?? [];
  }

  async update(cartKey: string, input: unknown): Promise<CartItem[]> {
    if (!Array.isArray(input)) {
      throw new Error("Cart items must be an array");
    }

    const items: CartItem[] = [];
    const seenProductIds = new Set<number>();
    for (const item of input) {
      if (
        !item ||
        !Number.isSafeInteger(item.productId) ||
        item.productId <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99 ||
        seenProductIds.has(item.productId)
      ) {
        throw new Error("Each cart item must have a unique productId and a quantity from 1 to 99");
      }
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} was not found`);
      }
      if (product.status !== "active") {
        throw new Error(`${product.name} is no longer available`);
      }
      if (item.quantity > product.stock) {
        throw new Error(`Only ${product.stock} ${product.name} units are in stock`);
      }
      seenProductIds.add(item.productId);
      items.push({ productId: item.productId, quantity: item.quantity });
    }

    if (items.length === 0) {
      await this.cartRepository.delete(cartKey);
      return [];
    }

    return (await this.cartRepository.save(cartKey, items)).items;
  }

  clear(cartKey: string): Promise<void> {
    return this.cartRepository.delete(cartKey);
  }
}
