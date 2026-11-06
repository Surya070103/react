import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UserService } from "../../services/UserService";
import { UserRepository } from "../../repositories/UserRepository";
import { User } from "../../entities/User";

describe("UserService Unit Tests", () => {
  let mockUserRepository: jest.Mocked<
    Pick<UserRepository, "findAll" | "findById" | "findByEmail" | "create" | "update" | "delete">
  >;
  let userService: UserService;

  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn<UserRepository["findAll"]>(),
      findById: jest.fn<UserRepository["findById"]>(),
      findByEmail: jest.fn<UserRepository["findByEmail"]>(),
      create: jest.fn<UserRepository["create"]>(),
      update: jest.fn<UserRepository["update"]>(),
      delete: jest.fn<UserRepository["delete"]>(),
    };

    userService = new UserService(mockUserRepository);
  });

  describe("create", () => {
    it("should preserve customer order and recent activity fields", async () => {
      const input = {
        name: "  Jane Doe  ",
        email: "JANE@example.com",
        phoneno: 9876543210,
        status: "active" as const,
        orders: 2,
        actions: "  Added a shipping address  ",
      };
      const createdUser = {
        id: 2,
        ...input,
        name: "Jane Doe",
        email: "jane@example.com",
        role: "customer",
        actions: "Added a shipping address",
      } as User;
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await userService.create(input);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...input,
        name: "Jane Doe",
        email: "jane@example.com",
        role: "customer",
        actions: "Added a shipping address",
      });
      expect(result).toEqual(createdUser);
    });

    it("should reject a negative order count", async () => {
      await expect(userService.create({
        name: "Jane Doe",
        email: "jane@example.com",
        phoneno: 9876543210,
        orders: -1,
      })).rejects.toThrow("Orders must be a non-negative integer");
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return the user when found by record ID", async () => {
      const mockUser = {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        phoneno: 1234567890,
        status: "active",
      } as User;
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should throw an error when user is not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getById(999)).rejects.toThrow("User not found");
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe("update (Edit functionality by record ID)", () => {
    const existingUser = {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      phoneno: 1234567890,
      status: "active",
      orders: 0,
    } as User;

    it("should successfully edit a user by record ID", async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      const updatedUser = { ...existingUser, name: "Alice Cooper", phoneno: 9876543210 };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.update(1, { name: "Alice Cooper", phoneno: 9876543210 });

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(existingUser, {
        name: "Alice Cooper",
        phoneno: 9876543210,
      });
      expect(result).toEqual(updatedUser);
    });

    it("should throw an error when editing a non-existent record ID", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.update(999, { name: "New Name" })).rejects.toThrow("User not found");
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("should allow editing email if the new email is not taken", async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue({
        ...existingUser,
        email: "alice.new@example.com",
      });

      const result = await userService.update(1, { email: "alice.new@example.com" });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("alice.new@example.com");
      expect(result.email).toBe("alice.new@example.com");
    });

    it("should throw an error if updating email to one already owned by another record", async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 2,
        email: "bob@example.com",
      } as User);

      await expect(userService.update(1, { email: "bob@example.com" })).rejects.toThrow(
        "A user with this email already exists"
      );
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it("should allow updating when email is unchanged (same user ID)", async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(existingUser);

      await userService.update(1, { email: "alice@example.com" });

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith(existingUser, {
        email: "alice@example.com",
      });
    });

    it("should throw an error if updating with an invalid email format", async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.update(1, { email: "not-an-email" })).rejects.toThrow(
        "Provide a valid email address"
      );
    });

    it("should throw an error if updating with an empty name", async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.update(1, { name: "   " })).rejects.toThrow(
        "Provide a valid name"
      );
    });

    it("should throw an error if updating with invalid phone number", async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.update(1, { phoneno: -10 })).rejects.toThrow(
        "Provide a valid phone number"
      );
    });

    it("should throw an error if updating with invalid status", async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.update(1, { status: "pending" as any })).rejects.toThrow(
        "Status must be active or inactive"
      );
    });
  });

  describe("delete (Delete functionality by record ID)", () => {
    it("should successfully delete a user by record ID", async () => {
      const existingUser = {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
      } as User;

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await userService.delete(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(existingUser);
    });

    it("should throw an error when attempting to delete a non-existent record ID", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.delete(999)).rejects.toThrow("User not found");
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });
});
