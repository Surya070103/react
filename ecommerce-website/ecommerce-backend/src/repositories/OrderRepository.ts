import { DataSource, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Order, OrderItem, PaymentMethod } from "../entities/Order";
import { OrderItemRecord } from "../entities/OrderItemRecord";
import { Payment } from "../entities/Payment";

export class OrderRepository {
  private readonly repository: Repository<Order>;

  constructor(private readonly dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(Order);
  }

  findAll(): Promise<Order[]> {
    return this.repository.find({ order: { createdAt: "DESC" } });
  }

  findByCustomerId(customerId: number): Promise<Order[]> {
    return this.repository.find({ where: { customerId }, order: { createdAt: "DESC" } });
  }

  create(input: {
    customerId: number;
    customerName: string;
    customerEmail: string;
    total: number;
    items: OrderItem[];
    shippingAddress: string;
    paymentMethod: PaymentMethod;
  }): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orders = manager.getRepository(Order);
      const order = await orders.save(orders.create(input));
      await manager.getRepository(OrderItemRecord).save(input.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
      })));
      await manager.getRepository(Payment).save({
        orderId: order.id,
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        amount: input.total,
        transactionId: null,
      });
      return order;
    });
  }
}
