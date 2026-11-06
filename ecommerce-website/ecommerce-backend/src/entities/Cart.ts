import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export interface CartItem {
  productId: number;
  quantity: number;
}

@Entity("carts")
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "cart_key", length: 36, unique: true })
  cartKey!: string;

  @Column({ name: "user_id", type: "int", nullable: true })
  userId!: number | null;

  @Column({ type: "json" })
  items!: CartItem[];

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
