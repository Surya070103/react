export type UserStatus = "active" | "inactive";
export type UserRole = "customer" | "admin";

export interface CreateUserInput {
  name: string;
  email: string;
  phoneno: number;
  status?: UserStatus;
  role?: "customer";
  passwordHash?: string;
  orders?: number;
  actions?: string;
}

export type UpdateUserInput = Partial<CreateUserInput>;

export interface AuthSession {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface RegisterInput {
  name: string;
  email: string;
  phoneno: number;
  password: string;
  role: "customer";
}
