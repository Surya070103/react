import { OrderItem } from "../entities/Order";
import { CartRepository } from "../repositories/CartRepository";
import { OrderRepository } from "../repositories/OrderRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { UserRepository } from "../repositories/UserRepository";
import { CreateOrderInput } from "../types/order";
import { AuthSession } from "../types/user";

export class OrderService {
  constructor(
    private readonly orderRepository: Pick<
      OrderRepository,
      "findAll" | "findByCustomerId" | "findById" | "create" | "cancel"
    > = new OrderRepository(),
    private readonly cartRepository: Pick<CartRepository, "findByKey" | "delete"> = new CartRepository(),
    private readonly productRepository: Pick<ProductRepository, "findById"> = new ProductRepository(),
    private readonly userRepository: Pick<UserRepository, "findById" | "update"> = new UserRepository()
  ) {}

  async getAll(session: AuthSession) {
    if (session.role === "admin") return this.orderRepository.findAll();
    return this.orderRepository.findByCustomerId(session.id);
  }

  async cancel(id: number, customerId: number) {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error("Order not found");
    }
    const order = await this.orderRepository.findById(id);
    if (!order || order.customerId !== customerId) {
      throw new Error("Order not found");
    }
    if (order.status === "cancelled") {
      throw new Error("Order has already been cancelled");
    }
    return this.orderRepository.cancel(order);
  }

  async create(input: CreateOrderInput, customerId: number) {
    if (!input || typeof input.shippingAddress !== "string" || !input.shippingAddress.trim() || input.shippingAddress.trim().length > 1000) {
      throw new Error("Provide a delivery address of 1,000 characters or fewer");
    }
    if (input.paymentMethod !== "cash_on_delivery") {
      throw new Error("Cash on delivery is the only supported payment option");
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
      if (cartItem.quantity > product.stock) {
        throw new Error(`${product.name} has only ${product.stock} unit(s) in stock`);
      }
      const discountPercent = Number(product.discountPercent || 0);
      const price = Math.round(Number(product.price) * (100 - discountPercent)) / 100;
      items.push({
        productId: product.id,
        name: product.name,
        price,
        quantity: cartItem.quantity,
        deliveryDate: product.deliveryDate,
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
