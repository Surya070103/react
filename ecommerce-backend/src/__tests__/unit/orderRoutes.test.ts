import http from "node:http";
import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createRequestListener } from "../../app";
import { Order } from "../../entities/Order";
import { OrderService } from "../../services/OrderService";
import { AuthService } from "../../services/AuthService";
import { User } from "../../entities/User";
import { UserRepository } from "../../repositories/UserRepository";
import { sessionCookie } from "../../test-utils/authTestHelpers";

jest.mock("../../services/OrderService");

describe("Order cancellation route", () => {
  let server: http.Server;

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepository = {
      findById: async (id: number) => ({
        id,
        name: id === 0 ? "Admin" : "Customer",
        email: id === 0 ? "admin@example.com" : "customer@example.com",
        role: id === 0 ? "admin" : "customer",
        status: "active",
      } as User),
      findByEmailForAuth: async () => null,
      create: async () => { throw new Error("Not used by this test"); },
      update: async (user: User) => user,
    } as Pick<UserRepository, "findByEmailForAuth" | "findById" | "create" | "update">;
    server = http.createServer(createRequestListener(
      undefined,
      undefined,
      undefined,
      undefined,
      new AuthService(userRepository),
    ));
  });

  it("allows a customer to cancel their order", async () => {
    const cancelledOrder = { id: 21, customerId: 7, status: "cancelled" } as Order;
    jest.mocked(OrderService.prototype.cancel).mockResolvedValue(cancelledOrder);

    const response = await request(server)
      .delete("/api/orders/21")
      .set("Cookie", sessionCookie("customer", 7, "customer@example.com"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(cancelledOrder);
    expect(OrderService.prototype.cancel).toHaveBeenCalledWith(21, 7);
  });

  it("rejects cancellation by an administrator", async () => {
    const response = await request(server)
      .delete("/api/orders/21")
      .set("Cookie", sessionCookie("admin", 0));

    expect(response.status).toBe(403);
    expect(OrderService.prototype.cancel).not.toHaveBeenCalled();
  });

  it("requires authentication to cancel an order", async () => {
    const response = await request(server).delete("/api/orders/21");

    expect(response.status).toBe(401);
    expect(OrderService.prototype.cancel).not.toHaveBeenCalled();
  });
});
