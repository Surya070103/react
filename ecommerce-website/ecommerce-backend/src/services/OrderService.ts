import { OrderItem } from "../entities/Order";
import { CartRepository } from "../repositories/CartRepository";
import { OrderRepository } from "../repositories/OrderRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { UserRepository } from "../repositories/UserRepository";
import { CreateOrderInput } from "../types/order";
import { AuthSession } from "../types/user";

export class OrderService {
  constructor(
    private readonly orderRepository = new OrderRepository(),
    private readonly cartRepository = new CartRepository(),
    private readonly productRepository = new ProductRepository(),
    private readonly userRepository = new UserRepository()
  ) {}

  async getAll(session: AuthSession) {
    if (session.role === "admin") return this.orderRepository.findAll();
    return this.orderRepository.findByCustomerId(session.id);
  }

  async create(input: CreateOrderInput, customerId: number) {
    if (!input || typeof input.shippingAddress !== "string" || !input.shippingAddress.trim() || input.shippingAddress.trim().length > 1000) {
      throw new Error("Provide a delivery address of 1,000 characters or fewer");
    }
    if (
      input.paymentMethod !== "cash_on_delivery" &&
      input.paymentMethod !== "upi" &&
      input.paymentMethod !== "credit_debit_card" &&
      input.paymentMethod !== "net_banking" &&
      input.paymentMethod !== "digital_wallet" &&
      input.paymentMethod !== "online"
    ) {
      throw new Error("Choose a valid payment option");
    }
    if (!input || typeof input.cartKey !== "string" || !/^[0-9a-f-]{36}$/i.test(input.cartKey)) {
      throw new Error("Provide a valid cart key");
    }
    const customer = await this.userRepository.findById(customerId);
    if (!customer || customer.role !== "customer" || customer.status !== "active") {
      throw new Error("Customer account is unavailable");
    }
    const cart = await this.cartRepository.findByKey(input.cartKey);
    if (!cart?.items.length) {
      throw new Error("Your cart is empty");
    }

    const items: OrderItem[] = [];
    for (const cartItem of cart.items) {
      const product = await this.productRepository.findById(cartItem.productId);
      if (!product) {
        throw new Error(`Product ${cartItem.productId} is no longer available`);
      }
      items.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: cartItem.quantity,
      });
    }

    const total = items.reduce((cents, item) => (
      cents + Math.round(item.price * 100) * item.quantity
    ), 0) / 100;
    const order = await this.orderRepository.create({
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      total,
      items,
      shippingAddress: input.shippingAddress.trim(),
      paymentMethod: input.paymentMethod,
    });
    await this.userRepository.update(customer, { orders: Number(customer.orders || 0) + 1 });
    await this.cartRepository.delete(input.cartKey);
    return order;
  }
}
