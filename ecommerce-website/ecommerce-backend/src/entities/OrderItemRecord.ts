import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("order_items")
export class OrderItemRecord {
  @PrimaryGeneratedColumn({ name: "order_item_id" })
  orderItemId!: number;

  @Column({ name: "order_id", type: "int" })
  orderId!: number;

  @Column({ name: "product_id", type: "int", nullable: true })
  productId!: number | null;

  @Column({ name: "product_name", length: 255 })
  productName!: string;

  @Column({ type: "int", unsigned: true })
  quantity!: number;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  price!: number;
}
