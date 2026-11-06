import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";

async function printUsers() {
  await AppDataSource.initialize();
  const userRepository = AppDataSource.getRepository(User);
  const users = await userRepository.find({ order: { joined: "DESC" } });

  console.log("\n=================== USERS IN DATABASE ===================");
  console.table(
    users.map((u) => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Phone: u.phoneno,
      Status: u.status,
      Orders: u.orders,
    }))
  );
  console.log(`Total users found: ${users.length}\n`);

  await AppDataSource.destroy();
}

printUsers().catch((error) => {
  console.error("Error reading users:", error);
  process.exit(1);
});

