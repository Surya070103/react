import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import http from "node:http";
import { createRequestListener } from "../../app";
import { Product } from "../../entities/Product";
import { ProductService } from "../../services/ProductService";
import { sessionCookie } from "../../test-utils/authTestHelpers";
import { AuthService } from "../../services/AuthService";
import { User } from "../../entities/User";
import { UserRepository } from "../../repositories/UserRepository";

jest.mock("../../services/ProductService");

describe("Product Routes Unit Tests (Pure Node.js + TypeScript)", () => {
  let server: http.Server;

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepository = {
      findById: async (id: number) => ({
        id,
        name: id === 0 ? "Admin" : "Customer",
        email: id === 0 ? "test@example.com" : "customer@example.com",
        role: id === 0 ? "admin" : "customer",
        status: "active",
      } as User),
      findByEmail: async () => null,
      findByEmailForAuth: async () => null,
      create: async () => { throw new Error("Not used by this test"); },
      update: async (user: User) => user,
    } as Pick<UserRepository, "findByEmailForAuth" | "findById" | "update" | "create">;
    const authService = new AuthService(userRepository);
    server = http.createServer(createRequestListener(undefined, undefined, undefined, undefined, authService));
  });

  describe("GET /api/products", () => {
    it("should return a list of products with 200 status", async () => {
      const mockProducts = [
        { id: 1, name: "Keyboard", category: "Electronics", description: "Nice", price: 100, imageUrl: "url" },
      ];
      jest.mocked(ProductService.prototype.getAll).mockResolvedValue(mockProducts as Product[]);

      const response = await request(server).get("/api/products");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
      expect(ProductService.prototype.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return a single product with 200 status", async () => {
      const mockProduct = { id: 1, name: "Keyboard", category: "Electronics", description: "Nice", price: 100, imageUrl: "url" };
      jest.mocked(ProductService.prototype.getById).mockResolvedValue(mockProduct as Product);

      const response = await request(server).get("/api/products/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
      expect(ProductService.prototype.getById).toHaveBeenCalledWith(1);
    });
  });

  describe("POST /api/products", () => {
    it("allows only admins to create products", async () => {
      const response = await request(server)
        .post("/api/products")
        .set("Cookie", sessionCookie("customer", 7, "customer@example.com"))
        .send({ name: "Mouse" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin account required" });
      expect(ProductService.prototype.create).not.toHaveBeenCalled();
    });

    it("should create and return the product with 201 status", async () => {
      const newProduct = { name: "Mouse", category: "Electronics", description: "Wireless", price: 50, imageUrl: "url" };
      const createdProduct = { id: 2, ...newProduct };
      jest.mocked(ProductService.prototype.create).mockResolvedValue(createdProduct as Product);

      const response = await request(server)
        .post("/api/products")
        .set("Cookie", sessionCookie("admin", 0))
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdProduct);
      expect(ProductService.prototype.create).toHaveBeenCalledWith(newProduct);
    });
  });

  describe("PATCH /api/products/:id", () => {
    it("should update and return the product with 200 status", async () => {
      const updateData = { price: 60 };
      const updatedProduct = { id: 1, name: "Keyboard", category: "Electronics", description: "Nice", price: 60, imageUrl: "url" };
      jest.mocked(ProductService.prototype.update).mockResolvedValue(updatedProduct as Product);

      const response = await request(server)
        .patch("/api/products/1")
        .set("Cookie", sessionCookie("admin", 0))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedProduct);
      expect(ProductService.prototype.update).toHaveBeenCalledWith(1, updateData);
    });

    it("should update through PUT /api/products/:id", async () => {
      const updateData = { price: 60 };
      const updatedProduct = { id: 1, name: "Keyboard", category: "Electronics", description: "Nice", price: 60, imageUrl: "url" };
      jest.mocked(ProductService.prototype.update).mockResolvedValue(updatedProduct as Product);

      const response = await request(server)
        .put("/api/products/1")
        .set("Cookie", sessionCookie("admin", 0))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedProduct);
      expect(ProductService.prototype.update).toHaveBeenCalledWith(1, updateData);
    });

    it("should return an error when the product record ID does not exist", async () => {
      jest.mocked(ProductService.prototype.update).mockRejectedValue(new Error("Product not found"));

      const response = await request(server)
        .patch("/api/products/999")
        .set("Cookie", sessionCookie("admin", 0))
        .send({ price: 60 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Product not found" });
      expect(ProductService.prototype.update).toHaveBeenCalledWith(999, { price: 60 });
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete the product with 204 status", async () => {
      jest.mocked(ProductService.prototype.delete).mockResolvedValue(undefined);

      const response = await request(server)
        .delete("/api/products/1")
        .set("Cookie", sessionCookie("admin", 0));

      expect(response.status).toBe(204);
      expect(ProductService.prototype.delete).toHaveBeenCalledWith(1);
    });

    it("should return an error when deleting a non-existent product record ID", async () => {
      jest.mocked(ProductService.prototype.delete).mockRejectedValue(new Error("Product not found"));

      const response = await request(server)      .delete("/api/products/999")
      .set("Cookie", sessionCookie("admin", 0));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Product not found" });
      expect(ProductService.prototype.delete).toHaveBeenCalledWith(999);
    });
  });
});
