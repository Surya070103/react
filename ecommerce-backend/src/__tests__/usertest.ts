import { TestDataSource } from "../test-data-source";
import { User } from "../entities/User";

describe("Sample Tests", () => {
  beforeAll(async () => {
    await TestDataSource.initialize();
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    await TestDataSource.synchronize(true);
  });

  it("should create a user", async () => {
    const userRepository = TestDataSource.getRepository(User);
    const user = userRepository.create({
      name: "Test User",
      email: "test@example.com",
      phoneno: 1234567890,
    });
    await userRepository.save(user);

    const savedUser = await userRepository.findOne({ where: { id: user.id } });
    expect(savedUser).toBeDefined();
    expect(savedUser?.name).toBe("Test User");
  });

  it("should find user by email", async () => {
    const userRepository = TestDataSource.getRepository(User);
    const user = userRepository.create({
      name: "Test User 2",
      email: "test2@example.com",
      phoneno: 9876543210,
    });
    await userRepository.save(user);

    const foundUser = await userRepository.findOne({ where: { email: "test2@example.com" } });
    expect(foundUser).toBeDefined();
    expect(foundUser?.name).toBe("Test User 2");
  });

  it("should edit/update a user using the record ID", async () => {
    const userRepository = TestDataSource.getRepository(User);
    const user = userRepository.create({
      name: "Original Name",
      email: "update@example.com",
      phoneno: 1234567890,
    });
    const saved = await userRepository.save(user);

    await userRepository.update(saved.id, { name: "Updated Name", phoneno: 9999999999 });

    const updatedUser = await userRepository.findOne({ where: { id: saved.id } });
    expect(updatedUser?.name).toBe("Updated Name");
    expect(updatedUser?.phoneno).toBe(9999999999);
  });

  it("should delete a user using the record ID", async () => {
    const userRepository = TestDataSource.getRepository(User);
    const user = userRepository.create({
      name: "To Delete",
      email: "delete@example.com",
      phoneno: 1234567890,
    });
    const saved = await userRepository.save(user);

    await userRepository.delete(saved.id);

    const deletedUser = await userRepository.findOne({ where: { id: saved.id } });
    expect(deletedUser).toBeNull();
  });
});
