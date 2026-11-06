import { describe, expect, it } from "@jest/globals";
import { OrderService } from "../../services/OrderService";

describe("OrderService checkout details", () => {
  const service = new OrderService();
  const cartKey = "a73c0f55-7d14-4b19-8f72-9d5090e60856";

  it("requires a non-empty delivery address", async () => {
    await expect(service.create({
      cartKey,
      shippingAddress: "   ",
      paymentMethod: "cash_on_delivery",
    }, 1)).rejects.toThrow("Provide a delivery address");
  });
});
