import { DataSource, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Order, OrderItem, PaymentMethod } from "../entities/Order";
import { OrderItemRecord } from "../entities/OrderItemRecord";
import { Payment } from "../entities/Payment";
import { Product } from "../entities/Product";

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

  findById(id: number): Promise<Order | null> {
    return this.repository.findOneBy({ id });
  }

  cancel(order: Order): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orders = manager.getRepository(Order);
      const currentOrder = await orders.findOne({
        where: { id: order.id },
        lock: { mode: "pessimistic_write" },
      });
      if (!currentOrder || currentOrder.status !== "placed") {
        throw new Error("Order has already been cancelled");
      }
      currentOrder.status = "cancelled";
      const savedOrder = await orders.save(currentOrder);
      const products = manager.getRepository(Product);
      for (const item of currentOrder.items) {
        await products.createQueryBuilder()
          .update(Product)
          .set({ stock: () => "`stock` + :quantity" })
          .where("id = :productId")
          .setParameters({ productId: item.productId, quantity: item.quantity })
          .execute();
      }
      return savedOrder;
    });
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
      const products = manager.getRepository(Product);
      for (const item of input.items) {
        const result = await products.createQueryBuilder()
          .update(Product)
          .set({ stock: () => "`stock` - :quantity" })
          .where("id = :productId AND `stock` >= :quantity")
          .setParameters({ productId: item.productId, quantity: item.quantity })
          .execute();
        if (result.affected !== 1) {
          throw new Error(`${item.name} does not have enough stock to complete this order`);
        }
      }
      const orders = manager.getRepository(Order);
      const order = await orders.save(orders.create(input));
      await manager.getRepository(OrderItemRecord).save(input.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        deliveryDate: item.deliveryDate,
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
