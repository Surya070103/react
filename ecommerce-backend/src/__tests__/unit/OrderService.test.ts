import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Order } from "../../entities/Order";
import { OrderRepository } from "../../repositories/OrderRepository";
import { OrderService } from "../../services/OrderService";

describe("OrderService checkout details", () => {
  const cartKey = "a73c0f55-7d14-4b19-8f72-9d5090e60856";
  const mockOrderRepository: jest.Mocked<Pick<
    OrderRepository,
    "findAll" | "findByCustomerId" | "findById" | "create" | "cancel"
  >> = {
    findAll: jest.fn<OrderRepository["findAll"]>(),
    findByCustomerId: jest.fn<OrderRepository["findByCustomerId"]>(),
    findById: jest.fn<OrderRepository["findById"]>(),
    create: jest.fn<OrderRepository["create"]>(),
    cancel: jest.fn<OrderRepository["cancel"]>(),
  };
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrderService(mockOrderRepository);
  });

  it("requires a non-empty delivery address", async () => {
    await expect(service.create({
      cartKey,
      shippingAddress: "   ",
      paymentMethod: "cash_on_delivery",
    }, 1)).rejects.toThrow("Provide a delivery address");
  });

  describe("cancel", () => {
    const placedOrder = {
      id: 21,
      customerId: 7,
      status: "placed",
    } as Order;

    it("cancels the signed-in customer's order", async () => {
      const cancelledOrder = { ...placedOrder, status: "cancelled" } as Order;
      mockOrderRepository.findById.mockResolvedValue(placedOrder);
      mockOrderRepository.cancel.mockResolvedValue(cancelledOrder);

      await expect(service.cancel(21, 7)).resolves.toEqual(cancelledOrder);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(21);
      expect(mockOrderRepository.cancel).toHaveBeenCalledWith(placedOrder);
    });

    it("does not cancel an order belonging to another customer", async () => {
      mockOrderRepository.findById.mockResolvedValue(placedOrder);

      await expect(service.cancel(21, 8)).rejects.toThrow("Order not found");
      expect(mockOrderRepository.cancel).not.toHaveBeenCalled();
    });

    it("does not cancel an order more than once", async () => {
      mockOrderRepository.findById.mockResolvedValue({ ...placedOrder, status: "cancelled" });

      await expect(service.cancel(21, 7)).rejects.toThrow("Order has already been cancelled");
      expect(mockOrderRepository.cancel).not.toHaveBeenCalled();
    });

    it("rejects an invalid order ID", async () => {
      await expect(service.cancel(0, 7)).rejects.toThrow("Order not found");
      expect(mockOrderRepository.findById).not.toHaveBeenCalled();
    });
  });
});
