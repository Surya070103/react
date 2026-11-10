import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn({ name: "payment_id", type: "int", unsigned: true })
  paymentId!: number;

  @Column({ name: "order_id", type: "int" })
  orderId!: number;

  @Column({ name: "payment_method", length: 40 })
  paymentMethod!: string;

  @Column({ name: "payment_status", length: 20, default: "pending" })
  paymentStatus!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount!: number;

  @Column({ name: "transaction_id", type: "varchar", length: 120, nullable: true, unique: true })
  transactionId!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
