import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export type PaymentMethod =
  | "cash_on_delivery"
  | "upi"
  | "credit_debit_card"
  | "net_banking"
  | "digital_wallet"
  | "online";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "customer_id", type: "int", nullable: true })
  customerId!: number | null;

  @Column({ name: "address_id", type: "int", nullable: true })
  addressId!: number | null;

  @Column({ name: "customer_name", length: 255 })
  customerName!: string;

  @Column({ name: "customer_email", length: 255 })
  customerEmail!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  total!: number;

  @Column({ type: "json" })
  items!: OrderItem[];

  @Column({ name: "shipping_address", type: "varchar", length: 1000, nullable: true })
  shippingAddress!: string | null;

  @Column({ name: "payment_method", length: 30, default: "cash_on_delivery" })
  paymentMethod!: PaymentMethod;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
