import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn({ name: "cart_item_id" })
  cartItemId!: number;

  @Column({ name: "cart_id", type: "int" })
  cartId!: number;

  @Column({ name: "product_id", type: "int" })
  productId!: number;

  @Column({ type: "int", unsigned: true })
  quantity!: number;
}
