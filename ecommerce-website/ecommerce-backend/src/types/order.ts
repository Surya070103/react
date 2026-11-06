import { PaymentMethod } from "../entities/Order";

export interface CreateOrderInput {
  cartKey: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
}
