import { ProductService } from "../../services/ProductService";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ProductRepository } from "../../repositories/ProductRepository";
import { Product } from "../../entities/Product";

describe("ProductService Unit Tests", () => {
  let mockProductRepository: jest.Mocked<
    Pick<ProductRepository, "findAll" | "findById" | "findByName" | "create" | "update" | "delete">
  >;
  let productService: ProductService;

  const sampleProduct: Product = {
    id: 1,
    name: "Mechanical Keyboard",
    category: "Accessories",
    categoryId: null,
    description: "RGB Mechanical Keyboard",
    price: 1999,
    stock: 0,
    discountPercent: 0,
    deliveryDate: null,
    status: "active",
    imageUrl: "http://example.com/keyboard.jpg",
    ownerUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockProductRepository = {
      findAll: jest.fn<ProductRepository["findAll"]>(),
      findById: jest.fn<ProductRepository["findById"]>(),
      findByName: jest.fn<ProductRepository["findByName"]>(),
      create: jest.fn<ProductRepository["create"]>(),
      update: jest.fn<ProductRepository["update"]>(),
      delete: jest.fn<ProductRepository["delete"]>(),
    };

    productService = new ProductService(mockProductRepository);
  });

  describe("getAll", () => {
    it("should return the product list from the repository", async () => {
      mockProductRepository.findAll.mockResolvedValue([sampleProduct]);

      await expect(productService.getAll()).resolves.toEqual([sampleProduct]);
      expect(mockProductRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("create (Add functionality)", () => {
    it("should validate and create a product", async () => {
      const input = {
        name: "  Wireless Mouse  ",
        category: "  Electronics ",
        description: "  A wireless mouse ",
        imageUrl: " https://example.com/mouse.jpg ",
        price: 799,
        stock: 8,
        discountPercent: 15,
        deliveryDate: "2026-12-24",
      };
      const createdProduct = { ...sampleProduct, ...input, id: 2 };
      mockProductRepository.findByName.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(createdProduct);

      await expect(productService.create(input)).resolves.toEqual(createdProduct);
      expect(mockProductRepository.findByName).toHaveBeenCalledWith("Wireless Mouse");
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        name: "Wireless Mouse",
        category: "Electronics",
        description: "A wireless mouse",
        imageUrl: "https://example.com/mouse.jpg",
        price: 799,
        stock: 8,
        discountPercent: 15,
        deliveryDate: "2026-12-24",
        ownerUserId: null,
      });
    });

    it("should reject a duplicate product name", async () => {
      mockProductRepository.findByName.mockResolvedValue(sampleProduct);

      await expect(productService.create({
        name: sampleProduct.name,
        category: sampleProduct.category,
        description: sampleProduct.description,
        imageUrl: sampleProduct.imageUrl,
        price: sampleProduct.price,
        stock: sampleProduct.stock,
        discountPercent: sampleProduct.discountPercent,
        deliveryDate: sampleProduct.deliveryDate,
      })).rejects.toThrow("A product with this name already exists");
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    it("should default new offer and inventory fields for older API clients", async () => {
      const input = {
        name: "Basic Product",
        category: "General",
        description: "A product created without optional inventory fields",
        imageUrl: "https://example.com/product.png",
        price: 100,
      };
      mockProductRepository.findByName.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(sampleProduct);

      await productService.create(input);

      expect(mockProductRepository.create).toHaveBeenCalledWith({
        ...input,
        stock: 0,
        discountPercent: 0,
        deliveryDate: null,
        ownerUserId: null,
      });
    });
  });

  describe("getById", () => {
    it("should return the product when found by record ID", async () => {
      mockProductRepository.findById.mockResolvedValue(sampleProduct);

      const result = await productService.getById(1);

      expect(result).toEqual(sampleProduct);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should throw an error when product is not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.getById(999)).rejects.toThrow("Product not found");
      expect(mockProductRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe("update (Edit functionality by record ID)", () => {
    it("should edit/update product using the record ID", async () => {
      mockProductRepository.findById.mockResolvedValue(sampleProduct);
      const updatedProduct = { ...sampleProduct, price: 2499 };
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      const result = await productService.update(1, { price: 2499 });

      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductRepository.update).toHaveBeenCalledWith(sampleProduct, {
        name: sampleProduct.name,
        category: sampleProduct.category,
        description: sampleProduct.description,
        price: 2499,
        imageUrl: sampleProduct.imageUrl,
        stock: sampleProduct.stock,
        discountPercent: sampleProduct.discountPercent,
        deliveryDate: sampleProduct.deliveryDate,
      });
      expect(result.price).toBe(2499);
    });

    it("should throw when editing a non-existent record ID", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.update(999, { price: 2499 })).rejects.toThrow("Product not found");
      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });

    it("should throw an error if updating product name to an existing different product's name", async () => {
      mockProductRepository.findById.mockResolvedValue(sampleProduct);
      mockProductRepository.findByName.mockResolvedValue({
        id: 2,
        name: "Wireless Mouse",
      } as Product);

      await expect(
        productService.update(1, { name: "Wireless Mouse" })
      ).rejects.toThrow("A product with this name already exists");
      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });

    it("should allow an unchanged name without checking another record", async () => {
      mockProductRepository.findById.mockResolvedValue(sampleProduct);
      mockProductRepository.update.mockResolvedValue(sampleProduct);

      await productService.update(1, { name: sampleProduct.name });

      expect(mockProductRepository.findByName).not.toHaveBeenCalled();
      expect(mockProductRepository.update).toHaveBeenCalledWith(sampleProduct, {
        name: sampleProduct.name,
        category: sampleProduct.category,
        description: sampleProduct.description,
        price: sampleProduct.price,
        imageUrl: sampleProduct.imageUrl,
        stock: sampleProduct.stock,
        discountPercent: sampleProduct.discountPercent,
        deliveryDate: sampleProduct.deliveryDate,
      });
    });

    it("should reject invalid updates before persisting them", async () => {
      mockProductRepository.findById.mockResolvedValue(sampleProduct);

      await expect(productService.update(1, { price: 0 })).rejects.toThrow(
        "Price must be greater than zero"
      );
      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });

    it("should reject invalid stock, discount, and delivery-date values", async () => {
      mockProductRepository.findById.mockResolvedValue(sampleProduct);

      await expect(productService.update(1, { stock: -1 })).rejects.toThrow("Stock must be a non-negative whole number");
      await expect(productService.update(1, { discountPercent: 101 })).rejects.toThrow("Discount must be a whole number between 0 and 100");
      await expect(productService.update(1, { deliveryDate: "2026-02-30" })).rejects.toThrow("Delivery date must be a valid date");
      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("delete (Delete functionality by record ID)", () => {
    it("should delete product using the record ID", async () => {
      mockProductRepository.findById.mockResolvedValue(sampleProduct);
      mockProductRepository.delete.mockResolvedValue(undefined);

      await productService.delete(1);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductRepository.delete).toHaveBeenCalledWith(sampleProduct);
    });

    it("should throw when deleting non-existent record ID", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.delete(999)).rejects.toThrow("Product not found");
      expect(mockProductRepository.delete).not.toHaveBeenCalled();
    });

    it("should only delete the product returned for the requested ID", async () => {
      const anotherProduct = { ...sampleProduct, id: 2 };
      mockProductRepository.findById.mockResolvedValue(anotherProduct);
      mockProductRepository.delete.mockResolvedValue(undefined);

      await productService.delete(2);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(2);
      expect(mockProductRepository.delete).toHaveBeenCalledWith(anotherProduct);
      expect(mockProductRepository.delete).not.toHaveBeenCalledWith(sampleProduct);
    });

  });
});
