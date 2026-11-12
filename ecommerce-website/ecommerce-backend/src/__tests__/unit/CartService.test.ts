import { describe, expect, it } from "@jest/globals";
import { CartService } from "../../services/CartService";
import { Cart } from "../../entities/Cart";
import { Product } from "../../entities/Product";

describe("CartService inventory validation", () => {
  it("rejects cart quantities greater than current stock", async () => {
    const product: Product = {
      id: 7,
      name: "Mouse",
      category: "Electronics",
      categoryId: null,
      description: "Wireless mouse",
      price: 19.99,
      stock: 1,
      discountPercent: 0,
      status: "active",
      imageUrl: "https://example.com/mouse.png",
      ownerUserId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    let cartSaved = false;
    const cartService = new CartService(
      {
        findByKey: async () => null,
        save: async (cartKey, items): Promise<Cart> => {
          cartSaved = true;
          return { id: 1, cartKey, userId: null, items, updatedAt: new Date() };
        },
        delete: async () => {},
      },
      { findById: async () => product }
    );

    await expect(cartService.update("a73c0f55-7d14-4b19-8f72-9d5090e60856", [
      { productId: product.id, quantity: 2 },
    ])).rejects.toThrow("Only 1 Mouse units are in stock");
    expect(cartSaved).toBe(false);
  });
});
