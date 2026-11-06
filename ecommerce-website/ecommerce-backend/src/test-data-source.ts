import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./config/env";
import { Product } from "./entities/Product";
import { User } from "./entities/User";
import { Cart } from "./entities/Cart";
import { Order } from "./entities/Order";
import { Category } from "./entities/Category";
import { Address } from "./entities/Address";
import { CartItem } from "./entities/CartItem";
import { Wishlist } from "./entities/Wishlist";
import { WishlistItem } from "./entities/WishlistItem";
import { OrderItemRecord } from "./entities/OrderItemRecord";
import { Payment } from "./entities/Payment";

export const TestDataSource = new DataSource({
  type: "mysql",
  host: process.env.TEST_DB_HOST || env.database.host,
  port: Number(process.env.TEST_DB_PORT || env.database.port),
  username: process.env.TEST_DB_USERNAME || env.database.username,
  password: process.env.TEST_DB_PASSWORD ?? env.database.password,
  database: "shopeasy_test_db",
  synchronize: true,
  logging: false,
  entities: [User, Product, Cart, Order, Category, Address, CartItem, Wishlist, WishlistItem, OrderItemRecord, Payment],
});
