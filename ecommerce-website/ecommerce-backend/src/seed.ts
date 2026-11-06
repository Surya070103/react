import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Product } from "./entities/Product";
import { User } from "./entities/User";
import { Category } from "./entities/Category";

async function seed() {
  await AppDataSource.initialize();
  console.log("Database connected");

  const productRepository = AppDataSource.getRepository(Product);
  const userRepository = AppDataSource.getRepository(User);
  const categoryRepository = AppDataSource.getRepository(Category);

  const users = [
    {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phoneno: 9876543210,
      status: "active",
      orders: 3,
      joined: new Date("2023-01-14"),
      actions: "Added a new shipping address",
    },
    {
      name: "Priya Patel",
      email: "priya@example.com",
      phoneno: 9123456780,
      status: "active",
      orders: 5,
      joined: new Date("2023-01-15"),
      actions: "Updated profile picture",
    },
  ];

  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`Created user: ${user.name}`);
    } else {
      await userRepository.update(existingUser.id, userData);
      console.log(`Updated user: ${userData.name}`);
    }
  }

  const products = [
    {
      name: "T-shirt",
      category: "Apparel",
      description: "A classic, comfortable cotton T-shirt designed for everyday wear.",
      price: 499.00,
      imageUrl: "/images/everyday-shirt.png",
    },
    {
      name: "Keyboard Cover",
      category: "Accessories",
      description: "A slim protective cover that keeps your keyboard clean and comfortable to use.",
      price: 250.00,
      imageUrl: "/images/keyboard-cover.jpg",
    },
    {
      name: "Wireless Mouse",
      category: "Electronics",
      description: "A reliable wireless mouse with smooth tracking for work or everyday browsing.",
      price: 399.00,
      imageUrl: "/images/mouse.jpg",
    },
    {
      name: "Smartphone",
      category: "Electronics",
      description: "A modern smartphone for staying connected, capturing photos, and enjoying apps.",
      price: 96699.00,
      imageUrl: "/images/smartphone.png",
    },
  ];

  for (const productData of products) {
    let category = await categoryRepository.findOneBy({ categoryName: productData.category });
    if (!category) {
      category = await categoryRepository.save(categoryRepository.create({
        categoryName: productData.category,
      }));
    }

    const existingProduct = await productRepository.findOne({
      where: { name: productData.name },
    }) ?? (productData.name === "T-shirt"
      ? await productRepository.findOne({ where: { name: "Everyday Shirt" } })
      : null);

    if (!existingProduct) {
      const product = productRepository.create({ ...productData, categoryId: category.categoryId });
      await productRepository.save(product);
      console.log(`Created product: ${product.name}`);
    } else {
      await productRepository.update(existingProduct.id, {
        ...productData,
        categoryId: category.categoryId,
      });
      console.log(`Updated product: ${productData.name}`);
    }
  }

  console.log("Seeding completed");
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
