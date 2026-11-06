import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn({ name: "address_id" })
  addressId!: number;

  @Column({ name: "user_id", type: "int" })
  userId!: number;

  @Column({ length: 500 })
  address!: string;

  @Column({ length: 120 })
  city!: string;

  @Column({ length: 120 })
  state!: string;

  @Column({ length: 20 })
  pincode!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
