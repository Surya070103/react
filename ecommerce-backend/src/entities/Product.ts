import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120, unique: true })
  name!: string;

  @Column({ length: 60 })
  category!: string;

  @Column({ name: "category_id", type: "int", unsigned: true, nullable: true })
  categoryId!: number | null;

  @Column({ length: 1000 })
  description!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  price!: number;

  @Column({ type: "int", unsigned: true, default: 0 })
  stock!: number;

  @Column({ name: "discount_percent", type: "int", unsigned: true, default: 0 })
  discountPercent!: number;

  @Column({ name: "delivery_date", type: "date", nullable: true })
  deliveryDate!: string | null;

  @Column({ length: 20, default: "active" })
  status!: string;

  @Column({ name: "image_url", length: 500 })
  imageUrl!: string;

  @Column({ name: "owner_user_id", type: "int", nullable: true })
  ownerUserId!: number | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
