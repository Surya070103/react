import http from "node:http";
import { afterEach, describe, expect, it } from "@jest/globals";
import { User } from "../../entities/User";
import { AuthService } from "../../services/AuthService";
import { UserRepository } from "../../repositories/UserRepository";

const originalAdminEmail = process.env.ADMIN_EMAIL;
const originalAdminPassword = process.env.ADMIN_PASSWORD;
process.env.AUTH_SECRET = "unit-test-auth-secret-that-is-long-enough";

afterEach(() => {
  if (originalAdminEmail === undefined) delete process.env.ADMIN_EMAIL;
  else process.env.ADMIN_EMAIL = originalAdminEmail;
  if (originalAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = originalAdminPassword;
});

describe("AuthService", () => {
  it("registers customers with salted password hashes and issues a signed session", async () => {
    const stored = { user: null as User | null };
    const repository = {
      findByEmail: async () => stored.user,
      findByEmailForAuth: async () => stored.user,
      findById: async () => stored.user,
      update: async (user: User, input: Partial<User>) => Object.assign(user, input),
      create: async (input: Partial<User>) => {
        stored.user = {
          ...input,
          id: 12,
          status: "active",
        } as User;
        return stored.user;
      },
    } as Pick<UserRepository, "findByEmailForAuth" | "findById" | "update" | "create">;
    const service = new AuthService(repository);

    const result = await service.register({
      name: "Sam Lee",
      email: "sam@example.com",
      phoneno: 1234567890,
      password: "sam123456",
      role: "customer",
    });

    expect(stored.user?.email).toBe("sam@example.com");
    const passwordHash = (stored.user as (User & { passwordHash: string }) | null)?.passwordHash;
    expect(passwordHash).toMatch(/^[a-f0-9]+:[a-f0-9]+$/);
    expect(passwordHash).not.toContain("sam123456");
    expect(result.user).toEqual({ id: 12, name: "Sam Lee", email: "sam@example.com", role: "customer" });
    const request = {
      headers: { cookie: service.sessionCookie(result.token) },
    } as http.IncomingMessage;
    expect(service.getSessionUser(request)).toEqual(result.user);

    const login = await service.login("sam@example.com", "sam123456");
    expect(login.user).toEqual(result.user);
    await expect(service.login("sam@example.com", "incorrect-password")).rejects.toThrow("Invalid email or password");
    await service.resetCustomerPassword(12, "new-customer-password");
    expect((stored.user as (User & { passwordHash: string }) | null)?.passwordHash).not.toContain("new-customer-password");
    expect((await service.login("sam@example.com", "new-customer-password")).user).toEqual(result.user);
    await expect(service.login("sam@example.com", "sam123456")).rejects.toThrow("Invalid email or password");
    await expect(service.resetCustomerPassword(12, "short")).rejects.toThrow("Password must contain 8 to 256 characters");
    await expect(service.register({
      name: "Sam Lee",
      email: "short@example.com",
      phoneno: 1234567890,
      password: "1234567",
      role: "customer",
    })).rejects.toThrow("Password must contain 8 to 256 characters");
  });

  it("does not allow non-customer registration and uses configured admin credentials", async () => {
    process.env.ADMIN_EMAIL = "owner@example.com";
    process.env.ADMIN_PASSWORD = "another-strong-password";
    const repository = {
      findByEmail: async () => null,
      findByEmailForAuth: async () => null,
      findById: async () => null,
      update: async (user: User) => user,
      create: async () => {
        throw new Error("Admin must not be registered through public endpoint");
      },
    } as Pick<UserRepository, "findByEmailForAuth" | "findById" | "update" | "create">;
    const service = new AuthService(repository);

    await expect(service.register({
      name: "Admin",
      email: "owner@example.com",
      phoneno: 1234567890,
      password: "another-strong-password",
      role: "admin",
    } as never)).rejects.toThrow("Role must be customer");
    await expect(service.register({
      name: "Seller",
      email: "seller@example.com",
      phoneno: 1234567890,
      password: "another-strong-password",
      role: "seller",
    } as never)).rejects.toThrow("Role must be customer");

    const result = await service.login("owner@example.com", "another-strong-password");
    expect(result.user.role).toBe("admin");
    await expect(service.login("owner@example.com", "wrong-password")).rejects.toThrow("Invalid email or password");
  });
});
