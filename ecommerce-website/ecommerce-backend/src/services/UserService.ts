import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";
import { CreateUserInput, UpdateUserInput } from "../types/user";

export class UserService {
  constructor(
    private readonly userRepository: Pick<
      UserRepository,
      "findAll" | "findById" | "findByEmail" | "create" | "update" | "delete"
    > = new UserRepository()
  ) {}

  getAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async create(input: CreateUserInput): Promise<User> {
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();

    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error("Provide a name and a valid email address");
    }
    if (!Number.isFinite(input.phoneno) || input.phoneno <= 0) {
      throw new Error("Provide a valid phone number");
    }
    if (input.status && input.status !== "active" && input.status !== "inactive") {
      throw new Error("Status must be active or inactive");
    }
    if (input.role !== undefined && input.role !== "customer") {
      throw new Error("Role must be customer");
    }
    if (input.orders !== undefined && (!Number.isInteger(input.orders) || input.orders < 0)) {
      throw new Error("Orders must be a non-negative integer");
    }
    if (input.actions !== undefined && input.actions.length > 255) {
      throw new Error("Actions must be 255 characters or fewer");
    }
    if (await this.userRepository.findByEmail(email)) {
      throw new Error("A user with this email already exists");
    }

    const { passwordHash: _passwordHash, ...userInput } = input;
    return this.userRepository.create({
      ...userInput,
      name,
      email,
      role: input.role ?? "customer",
      actions: input.actions?.trim(),
    });
  }

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const user = await this.getById(id);
    const updatedData: UpdateUserInput = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new Error("Provide a valid name");
      }
      updatedData.name = name;
    }

    if (input.email !== undefined) {
      const email = input.email.trim().toLowerCase();
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error("Provide a valid email address");
      }
      if (email !== user.email) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser && existingUser.id !== id) {
          throw new Error("A user with this email already exists");
        }
      }
      updatedData.email = email;
    }

    if (input.phoneno !== undefined) {
      if (!Number.isFinite(input.phoneno) || input.phoneno <= 0) {
        throw new Error("Provide a valid phone number");
      }
      updatedData.phoneno = input.phoneno;
    }

    if (input.status !== undefined) {
      if (input.status !== "active" && input.status !== "inactive") {
        throw new Error("Status must be active or inactive");
      }
      updatedData.status = input.status;
    }

    if (input.orders !== undefined) {
      if (!Number.isInteger(input.orders) || input.orders < 0) {
        throw new Error("Orders must be a non-negative integer");
      }
      updatedData.orders = input.orders;
    }

    if (input.actions !== undefined) {
      if (input.actions.length > 255) {
        throw new Error("Actions must be 255 characters or fewer");
      }
      updatedData.actions = input.actions.trim();
    }

    return this.userRepository.update(user, updatedData);
  }

  async delete(id: number): Promise<void> {
    const user = await this.getById(id);
    await this.userRepository.delete(user);
  }
}
