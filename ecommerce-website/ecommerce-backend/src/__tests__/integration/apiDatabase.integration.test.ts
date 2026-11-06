import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { In } from "typeorm";
import http from "node:http";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { ProductController } from "../../controllers/ProductController";
import { UserController } from "../../controllers/UserController";
import { CartController } from "../../controllers/CartController";
import { OrderController } from "../../controllers/OrderController";
import { TestDataSource } from "../../test-data-source";
import { Product } from "../../entities/Product";
import { User } from "../../entities/User";
import { Cart } from "../../entities/Cart";
import { Order } from "../../entities/Order";
import { CartItem as CartItemRecord } from "../../entities/CartItem";
import { OrderItemRecord } from "../../entities/OrderItemRecord";
import { Payment } from "../../entities/Payment";
import { CartRepository } from "../../repositories/CartRepository";
import { OrderRepository } from "../../repositories/OrderRepository";
import { ProductRepository } from "../../repositories/ProductRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { createRequestListener } from "../../app";
import { CartService } from "../../services/CartService";
import { OrderService } from "../../services/OrderService";
import { ProductService } from "../../services/ProductService";
import { UserService } from "../../services/UserService";
import { sessionCookie } from "../../test-utils/authTestHelpers";
import { AuthService } from "../../services/AuthService";

describe("API and database integration", () => {
  let server: http.Server;
  let userIds: number[] = [];
  let productIds: number[] = [];
  let orderIds: number[] = [];
  let cartKeys: string[] = [];

  beforeAll(async () => {
    if (TestDataSource.options.database !== "shopeasy_test_db") {
      throw new Error("Integration tests must use the shopeasy_test_db database");
    }
    await TestDataSource.initialize();
  });

  beforeEach(async () => {
    userIds = [];
    productIds = [];
    orderIds = [];
    cartKeys = [];

    const userRepository = new UserRepository(TestDataSource);
    const authService = new AuthService(userRepository);
    const userController = new UserController(
      new UserService(userRepository),
      authService
    );
    const productController = new ProductController(
      new ProductService(new ProductRepository(TestDataSource))
    );
    const cartController = new CartController(
      new CartService(new CartRepository(TestDataSource), new ProductRepository(TestDataSource))
    );
    const orderController = new OrderController(new OrderService(
      new OrderRepository(TestDataSource),
      new CartRepository(TestDataSource),
      new ProductRepository(TestDataSource),
      new UserRepository(TestDataSource)
    ));
    server = http.createServer(createRequestListener(userController, productController, cartController, orderController, authService));
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, resolve);
    });
  });

  afterEach(async () => {
    if (orderIds.length > 0) {
      await TestDataSource.getRepository(Payment).delete({ orderId: In(orderIds) });
      await TestDataSource.getRepository(OrderItemRecord).delete({ orderId: In(orderIds) });
      await TestDataSource.getRepository(Order).delete(orderIds);
    }
    if (cartKeys.length > 0) {
      const cart = await TestDataSource.getRepository(Cart).findOneBy({ cartKey: cartKeys[0] });
      if (cart) {
        await TestDataSource.getRepository(CartItemRecord).delete({ cartId: cart.id });
        await TestDataSource.getRepository(Cart).delete({ id: cart.id });
      }
    }
    if (productIds.length > 0) {
      await TestDataSource.getRepository(Product).delete(productIds);
    }
    if (userIds.length > 0) {
      await TestDataSource.getRepository(User).delete(userIds);
    }
    if (server.listening) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  afterAll(async () => {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }
  });

  it("persists user API create, read, update, and delete operations", async () => {
    const suffix = randomUUID();
    const createResponse = await request(server)
      .post("/api/users")
      .set("Cookie", sessionCookie("admin", 0))
      .send({
        name: "Integration User",
        email: `integration-${suffix}@example.com`,
        phoneno: 1234567890,
      });

    expect(createResponse.status).toBe(201);
    const userId = Number(createResponse.body.id);
    userIds.push(userId);

    const newPassword = "new-customer-password";
    const unauthorizedResetResponse = await request(server)
      .post(`/api/users/${userId}/password`)
      .set("Cookie", sessionCookie("customer", userId, `integration-${suffix}@example.com`))
      .send({ password: newPassword });
    expect(unauthorizedResetResponse.status).toBe(403);

    const resetResponse = await request(server)
      .post(`/api/users/${userId}/password`)
      .set("Cookie", sessionCookie("admin", 0))
      .send({ password: newPassword });
    expect(resetResponse.status).toBe(204);

    const loginResponse = await request(server)
      .post("/api/auth/login")
      .send({ email: `integration-${suffix}@example.com`, password: newPassword });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.id).toBe(userId);

    const savedUser = await TestDataSource.getRepository(User).findOneByOrFail({ id: userId });
    expect(savedUser.email).toBe(`integration-${suffix}@example.com`);

    const readResponse = await request(server)
      .get(`/api/users/${userId}`)
      .set("Cookie", sessionCookie("admin", 0));
    expect(readResponse.status).toBe(200);
    expect(readResponse.body.email).toBe(savedUser.email);

    const updateResponse = await request(server)
      .patch(`/api/users/${userId}`)
      .set("Cookie", sessionCookie("admin", 0))
      .send({ name: "Updated Integration User" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe("Updated Integration User");

    const updatedUser = await TestDataSource.getRepository(User).findOneByOrFail({ id: userId });
    expect(updatedUser.name).toBe("Updated Integration User");

    const deleteResponse = await request(server)
      .delete(`/api/users/${userId}`)
      .set("Cookie", sessionCookie("admin", 0));
    expect(deleteResponse.status).toBe(204);
    expect(await TestDataSource.getRepository(User).findOneBy({ id: userId })).toBeNull();
  });

  it("persists product API create, read, update, and delete operations", async () => {
    const productName = `Integration Product ${randomUUID()}`;
    const createResponse = await request(server)
      .post("/api/products")
      .set("Cookie", sessionCookie("admin", 0))
      .send({
        name: productName,
        category: "Testing",
        description: "Database integration fixture",
        price: 19.99,
        imageUrl: "https://example.com/integration-product.png",
      });

    expect(createResponse.status).toBe(201);
    const productId = Number(createResponse.body.id);
    productIds.push(productId);

    const savedProduct = await TestDataSource.getRepository(Product).findOneByOrFail({ id: productId });
    expect(savedProduct.name).toBe(productName);
    expect(Number(savedProduct.price)).toBe(19.99);

    const readResponse = await request(server).get(`/api/products/${productId}`);
    expect(readResponse.status).toBe(200);
    expect(readResponse.body.name).toBe(productName);

    const updateResponse = await request(server)
      .patch(`/api/products/${productId}`)
      .set("Cookie", sessionCookie("admin", 0))
      .send({ price: 24.5 });
    expect(updateResponse.status).toBe(200);
    expect(Number(updateResponse.body.price)).toBe(24.5);

    const updatedProduct = await TestDataSource.getRepository(Product).findOneByOrFail({ id: productId });
    expect(Number(updatedProduct.price)).toBe(24.5);

    const deleteResponse = await request(server)
      .delete(`/api/products/${productId}`)
      .set("Cookie", sessionCookie("admin", 0));
    expect(deleteResponse.status).toBe(204);
    expect(await TestDataSource.getRepository(Product).findOneBy({ id: productId })).toBeNull();
  });

  it("persists carts, customer checkout, and orders in the database", async () => {
    const suffix = randomUUID();
    const cartKey = randomUUID();
    cartKeys.push(cartKey);
    const productResponse = await request(server)
      .post("/api/products")
      .set("Cookie", sessionCookie("admin", 0))
      .send({
        name: `Order Product ${suffix}`,
        category: "Testing",
        description: "Order integration fixture",
        price: 19.99,
        imageUrl: "https://example.com/order-product.png",
      });
    expect(productResponse.status).toBe(201);
    const productId = Number(productResponse.body.id);
    productIds.push(productId);

    const cartResponse = await request(server)
      .put(`/api/carts/${cartKey}`)
      .send([{ productId, quantity: 2 }]);
    expect(cartResponse.status).toBe(200);
    expect(await TestDataSource.getRepository(Cart).findOneByOrFail({ cartKey })).toMatchObject({
      items: [{ productId, quantity: 2 }],
    });
    expect(await TestDataSource.getRepository(CartItemRecord).findOneByOrFail({
      cartId: (await TestDataSource.getRepository(Cart).findOneByOrFail({ cartKey })).id,
      productId,
    })).toMatchObject({ quantity: 2 });

    const email = `checkout-${suffix}@example.com`;
    const customer = await TestDataSource.getRepository(User).save({
      name: "Checkout Customer",
      email,
      phoneno: 1234567890,
      role: "customer",
      status: "active",
    });
    userIds.push(customer.id);
    const invalidPaymentResponse = await request(server)
      .post("/api/orders")
      .set("Cookie", sessionCookie("customer", customer.id, email))
      .send({
        cartKey,
        shippingAddress: "12 Main Street, Pune",
        paymentMethod: "bank_transfer",
      });
    expect(invalidPaymentResponse.status).toBe(400);

    const orderResponse = await request(server)
      .post("/api/orders")
      .set("Cookie", sessionCookie("customer", customer.id, email))
      .send({
        cartKey,
        shippingAddress: " 12 Main Street, Pune ",
        paymentMethod: "upi",
      });
    expect(orderResponse.status).toBe(201);
    const orderId = Number(orderResponse.body.id);
    orderIds.push(orderId);
    const savedOrder = await TestDataSource.getRepository(Order).findOneByOrFail({ id: orderId });
    expect(Number(savedOrder.total)).toBe(39.98);
    expect(savedOrder.customerId).toBe(customer.id);
    expect(savedOrder.items).toMatchObject([{ productId, quantity: 2, price: 19.99 }]);
    expect(savedOrder.shippingAddress).toBe("12 Main Street, Pune");
    expect(savedOrder.paymentMethod).toBe("upi");
    expect(await TestDataSource.getRepository(OrderItemRecord).findOneByOrFail({
      orderId,
      productId,
    })).toMatchObject({ productName: `Order Product ${suffix}`, quantity: 2 });
    expect(await TestDataSource.getRepository(Payment).findOneByOrFail({ orderId })).toMatchObject({
      paymentMethod: "upi",
      paymentStatus: "pending",
      amount: "39.98",
    });
    expect(await TestDataSource.getRepository(Cart).findOneBy({ cartKey })).toBeNull();
    expect((await request(server)
      .get("/api/orders")
      .set("Cookie", sessionCookie("admin", 0))).body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: orderId, customerEmail: email })])
    );
  });
});
