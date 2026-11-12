import { describe, expect, it } from "@jest/globals";
import { OrderService } from "../../services/OrderService";
import { Cart } from "../../entities/Cart";
import { Order } from "../../entities/Order";
import { Product } from "../../entities/Product";
import { User } from "../../entities/User";
import { OrderRepository } from "../../repositories/OrderRepository";

describe("OrderService checkout details", () => {
  const service = new OrderService();
  const cartKey = "a73c0f55-7d14-4b19-8f72-9d5090e60856";

  it("requires a non-empty delivery address", async () => {
    await expect(service.create({
      cartKey,
      shippingAddress: "   ",
      paymentMethod: "cash_on_delivery",
    }, 1)).rejects.toThrow("Provide a delivery address");
  });

  it("uses the current percentage offer when calculating order prices", async () => {
    const createdOrderInputs: Array<Parameters<OrderRepository["create"]>[0]> = [];
    const customer: User = {
      id: 1,
      name: "Shopper",
      email: "shopper@example.com",
      phoneno: 1234567890,
      passwordHash: null,
      role: "customer",
      status: "active",
      orders: 0,
      joined: new Date(),
      actions: "",
    };
    const product: Product = {
      id: 7,
      name: "Mouse",
      category: "Electronics",
      categoryId: null,
      description: "Wireless mouse",
      price: 19.99,
      stock: 5,
      discountPercent: 10,
      status: "active",
      imageUrl: "https://example.com/mouse.png",
      ownerUserId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const cart: Cart = {
      id: 1,
      cartKey,
      userId: null,
      items: [{ productId: product.id, quantity: 2 }],
      updatedAt: new Date(),
    };
    const discountedOrder = new Order();
    const orderService = new OrderService(
      {
        findAll: async () => [],
        findByCustomerId: async () => [],
        create: async (input) => {
          createdOrderInputs.push(input);
          Object.assign(discountedOrder, input, { id: 3, addressId: null, createdAt: new Date() });
          return discountedOrder;
        },
      },
      {
        findByKey: async () => cart,
        delete: async () => {},
      },
      { findById: async () => product },
      {
        findById: async () => customer,
        update: async (user, fields) => Object.assign(user, fields),
      }
    );

    await orderService.create({
      cartKey,
      shippingAddress: "1 Main Street",
      paymentMethod: "cash_on_delivery",
    }, customer.id);

    expect(createdOrderInputs).toHaveLength(1);
    expect(createdOrderInputs[0]?.items).toEqual([{
      productId: product.id,
      name: product.name,
      price: 17.99,
      quantity: 2,
    }]);
    expect(createdOrderInputs[0]?.total).toBe(35.98);
  });

  it("rejects checkout when the cart quantity exceeds inventory", async () => {
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
    const cart: Cart = {
      id: 1,
      cartKey,
      userId: null,
      items: [{ productId: product.id, quantity: 2 }],
      updatedAt: new Date(),
    };
    let orderCreated = false;
    const orderService = new OrderService(
      {
        findAll: async () => [],
        findByCustomerId: async () => [],
        create: async () => {
          orderCreated = true;
          return new Order();
        },
      },
      { findByKey: async () => cart, delete: async () => {} },
      { findById: async () => product },
      {
        findById: async () => ({
          id: 1,
          name: "Shopper",
          email: "shopper@example.com",
          phoneno: 1234567890,
          passwordHash: null,
          role: "customer",
          status: "active",
          orders: 0,
          joined: new Date(),
          actions: "",
        }),
        update: async (user) => user,
      }
    );

    await expect(orderService.create({
      cartKey,
      shippingAddress: "1 Main Street",
      paymentMethod: "cash_on_delivery",
    }, 1)).rejects.toThrow("Only 1 Mouse units are in stock");
    expect(orderCreated).toBe(false);
  });
});
