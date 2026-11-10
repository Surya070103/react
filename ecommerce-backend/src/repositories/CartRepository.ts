import { DataSource, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Cart, CartItem } from "../entities/Cart";
import { CartItem as CartItemRecord } from "../entities/CartItem";

export class CartRepository {
  private readonly repository: Repository<Cart>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(Cart);
  }

  findByKey(cartKey: string): Promise<Cart | null> {
    return this.repository.findOneBy({ cartKey });
  }

  async save(cartKey: string, items: CartItem[]): Promise<Cart> {
    return this.repository.manager.transaction(async (manager) => {
      const carts = manager.getRepository(Cart);
      const cart = await carts.findOneBy({ cartKey }) ?? carts.create({ cartKey, items: [] });
      cart.items = items;
      const savedCart = await carts.save(cart);
      const cartItems = manager.getRepository(CartItemRecord);
      await cartItems.delete({ cartId: savedCart.id });
      if (items.length > 0) {
        await cartItems.save(items.map((item) => ({
          cartId: savedCart.id,
          productId: item.productId,
          quantity: item.quantity,
        })));
      }
      return savedCart;
    });
  }

  async delete(cartKey: string): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      const carts = manager.getRepository(Cart);
      const cart = await carts.findOneBy({ cartKey });
      if (!cart) return;
      await manager.getRepository(CartItemRecord).delete({ cartId: cart.id });
      await carts.delete({ id: cart.id });
    });
  }
}
