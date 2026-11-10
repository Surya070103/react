import request from "supertest";
import http from "node:http";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { requestListener } from "../../app";
import { User } from "../../entities/User";
import { UserService } from "../../services/UserService";
import { CreateUserInput } from "../../types/user";
import { sessionCookie } from "../../test-utils/authTestHelpers";

jest.mock("../../services/UserService");

describe("User Routes Unit Tests (Pure Node.js + TypeScript)", () => {
  let server: http.Server;

  beforeEach(() => {
    jest.clearAllMocks();
    server = http.createServer(requestListener);
  });

  it("requires an admin session to read customer records", async () => {
    const response = await request(server).get("/api/users");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Authentication required" });
    expect(UserService.prototype.getAll).not.toHaveBeenCalled();
  });

  it("requires an admin session to reset a customer password", async () => {
    const response = await request(server)
      .post("/api/users/1/password")
      .send({ password: "new-customer-password" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Authentication required" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/users", () => {
    it("should return a list of users with 200 status", async () => {
      const mockUsers = [
        { id: 1, name: "John Doe", email: "john@example.com", phoneno: 1234567890, status: "active" },
      ];

      jest.mocked(UserService.prototype.getAll).mockResolvedValue(mockUsers as User[]);

      const response = await request(server)
        .get("/api/users")
        .set("Cookie", sessionCookie("admin", 0));

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(UserService.prototype.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a single user with 200 status", async () => {
      const mockUser = { id: 1, name: "John Doe", email: "john@example.com", phoneno: 1234567890, status: "active" };
      jest.mocked(UserService.prototype.getById).mockResolvedValue(mockUser as User);

      const response = await request(server)
        .get("/api/users/1")
        .set("Cookie", sessionCookie("admin", 0));

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(UserService.prototype.getById).toHaveBeenCalledWith(1);
    });

    it("should return 400 status when user is not found", async () => {
      const errorLog = jest.spyOn(console, "error").mockImplementation(() => undefined);
      jest.mocked(UserService.prototype.getById).mockRejectedValue(new Error("User not found"));

      const response = await request(server)
        .get("/api/users/999")
        .set("Cookie", sessionCookie("admin", 0));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "User not found" });
      expect(UserService.prototype.getById).toHaveBeenCalledWith(999);
      expect(errorLog).toHaveBeenCalledWith("Server error:", expect.any(Error));
    });
  });

  describe("POST /api/users", () => {
    it("should create and return the user with 201 status", async () => {
      const newUser: CreateUserInput = {
        name: "Jane Doe",
        email: "jane@example.com",
        phoneno: 9876543210,
        status: "active",
      };
      const createdUser = { id: 2, ...newUser };

      jest.mocked(UserService.prototype.create).mockResolvedValue(createdUser as User);

      const response = await request(server)
        .post("/api/users")
        .set("Cookie", sessionCookie("admin", 0))
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdUser);
      expect(UserService.prototype.create).toHaveBeenCalledWith(newUser);
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("should edit/update and return the user with 200 status using the record ID", async () => {
      const updateData = { name: "Jane Smith", phoneno: 9988776655 };
      const updatedUser = {
        id: 1,
        name: "Jane Smith",
        email: "jane@example.com",
        phoneno: 9988776655,
        status: "active",
      };

      jest.mocked(UserService.prototype.update).mockResolvedValue(updatedUser as User);

      const response = await request(server)
        .patch("/api/users/1")
        .set("Cookie", sessionCookie("admin", 0))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
      expect(UserService.prototype.update).toHaveBeenCalledWith(1, updateData);
    });

    it("should also allow editing via PUT /api/users/:id", async () => {
      const updateData = { name: "Jane Smith Updated" };
      const updatedUser = {
        id: 1,
        name: "Jane Smith Updated",
        email: "jane@example.com",
        phoneno: 1234567890,
        status: "active",
      };

      jest.mocked(UserService.prototype.update).mockResolvedValue(updatedUser as User);

      const response = await request(server)
        .put("/api/users/1")
        .set("Cookie", sessionCookie("admin", 0))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
      expect(UserService.prototype.update).toHaveBeenCalledWith(1, updateData);
    });

    it("should return 400 status when update fails (e.g. user not found)", async () => {
      const errorLog = jest.spyOn(console, "error").mockImplementation(() => undefined);
      jest.mocked(UserService.prototype.update).mockRejectedValue(new Error("User not found"));

      const response = await request(server)
        .patch("/api/users/999")
        .set("Cookie", sessionCookie("admin", 0))
        .send({ name: "Ghost" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "User not found" });
      expect(errorLog).toHaveBeenCalledWith("Server error:", expect.any(Error));
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete the user with 204 status using the record ID", async () => {
      jest.mocked(UserService.prototype.delete).mockResolvedValue(undefined);

      const response = await request(server)
        .delete("/api/users/1")
        .set("Cookie", sessionCookie("admin", 0));

      expect(response.status).toBe(204);
      expect(UserService.prototype.delete).toHaveBeenCalledWith(1);
    });

    it("should return 400 status when delete fails (e.g. user not found)", async () => {
      const errorLog = jest.spyOn(console, "error").mockImplementation(() => undefined);
      jest.mocked(UserService.prototype.delete).mockRejectedValue(new Error("User not found"));

      const response = await request(server)
        .delete("/api/users/999")
        .set("Cookie", sessionCookie("admin", 0));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "User not found" });
      expect(UserService.prototype.delete).toHaveBeenCalledWith(999);
      expect(errorLog).toHaveBeenCalledWith("Server error:", expect.any(Error));
    });
  });
});
