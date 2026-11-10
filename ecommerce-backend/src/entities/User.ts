import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { UserRole } from "../types/user";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({
    type: "bigint",
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  phoneno!: number;

  @Column({ name: "password_hash", type: "varchar", length: 255, nullable: true, select: false })
  passwordHash!: string | null;

  @Column({ default: "customer" })
  role!: UserRole;

  @Column({ default: "active" })
  status!: string;

  @Column({ default: 0 })
  orders!: number;

  @CreateDateColumn()
  joined!: Date;

  @Column({ nullable: true })
  actions!: string;
}
