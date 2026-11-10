export interface CreateOrderInput {
  cartKey: string;
  shippingAddress: string;
  paymentMethod: "cash_on_delivery";
}
