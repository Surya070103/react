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
import { InitialSchema1730190000000 } from "./migrations/InitialSchema";
import { AddAccountRoles1730200000000 } from "./migrations/AddAccountRoles1730200000000";
import { AddOrderCheckoutDetails1730210000000 } from "./migrations/AddOrderCheckoutDetails1730210000000";
import { AddPortalSchema1730220000000 } from "./migrations/AddPortalSchema1730220000000";
import { AddProductDiscount1730270000000 } from "./migrations/AddProductDiscount1730270000000";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  synchronize: false,
  logging: true,
  entities: [User, Product, Cart, Order, Category, Address, CartItem, Wishlist, WishlistItem, OrderItemRecord, Payment],
  migrations: [
    InitialSchema1730190000000,
    AddAccountRoles1730200000000,
    AddOrderCheckoutDetails1730210000000,
    AddPortalSchema1730220000000,
    AddProductDiscount1730270000000,
  ],
});
