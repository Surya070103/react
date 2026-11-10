import { Product } from "../entities/Product";
import { ProductRepository } from "../repositories/ProductRepository";
import { CreateProductInput, UpdateProductInput } from "../types/product";

export class ProductService {
  constructor(
    private readonly productRepository: Pick<
      ProductRepository,
      "findAll" | "findById" | "findByName" | "create" | "update" | "delete"
    > = new ProductRepository()
  ) {}

  getAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getById(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new Error("Product not found");
    return product;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const productInput = this.validate(input);
    if (await this.productRepository.findByName(productInput.name)) {
      throw new Error("A product with this name already exists");
    }
    return this.productRepository.create({ ...productInput, ownerUserId: null });
  }

  async update(id: number, input: UpdateProductInput): Promise<Product> {
    const product = await this.getById(id);
    const productInput = this.validate({ ...product, ...input });
    if (productInput.name !== product.name) {
      const matchingProduct = await this.productRepository.findByName(productInput.name);
      if (matchingProduct && matchingProduct.id !== id) {
        throw new Error("A product with this name already exists");
      }
    }
    return this.productRepository.update(product, productInput);
  }

  async delete(id: number): Promise<void> {
    const product = await this.getById(id);
    await this.productRepository.delete(product);
  }

  private validate(input: CreateProductInput): CreateProductInput {
    const name = input.name?.trim();
    const category = input.category?.trim();
    const description = input.description?.trim();
    const imageUrl = input.imageUrl?.trim();

    if (!name || !category || !description || !imageUrl) {
      throw new Error("Name, category, description, and imageUrl are required");
    }
    if (!Number.isFinite(input.price) || input.price <= 0) {
      throw new Error("Price must be greater than zero");
    }
    return { name, category, description, imageUrl, price: input.price };
  }
}
