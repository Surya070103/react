import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn({ name: "category_id", type: "int", unsigned: true })
  categoryId!: number;

  @Column({ name: "category_name", length: 120, unique: true })
  categoryName!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ length: 20, default: "active" })
  status!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
