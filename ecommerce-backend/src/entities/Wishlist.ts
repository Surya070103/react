import { CreateDateColumn, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("wishlists")
export class Wishlist {
  @PrimaryGeneratedColumn({ name: "wishlist_id", type: "int", unsigned: true })
  wishlistId!: number;

  @Column({ name: "user_id", type: "int" })
  userId!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
