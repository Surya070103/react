import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("wishlist_items")
export class WishlistItem {
  @PrimaryGeneratedColumn({ name: "wishlist_item_id", type: "int", unsigned: true })
  wishlistItemId!: number;

  @Column({ name: "wishlist_id", type: "int", unsigned: true })
  wishlistId!: number;

  @Column({ name: "product_id", type: "int" })
  productId!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
