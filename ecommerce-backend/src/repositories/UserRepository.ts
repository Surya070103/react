import { DataSource, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { CreateUserInput, UpdateUserInput } from "../types/user";

export class UserRepository {
  private readonly repository: Repository<User>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(User);
  }

  findAll(): Promise<User[]> {
    return this.repository.find({ order: { joined: "DESC" } });
  }

  findById(id: number): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  findByEmailForAuth(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.email = :email", { email })
      .getOne();
  }

  create(input: CreateUserInput): Promise<User> {
    const user = this.repository.create({
      ...input,
      status: input.status ?? "active",
    });
    return this.repository.save(user);
  }

  update(user: User, input: UpdateUserInput): Promise<User> {
    Object.assign(user, input);
    return this.repository.save(user);
  }

  async delete(user: User): Promise<void> {
    await this.repository.remove(user);
  }
}
