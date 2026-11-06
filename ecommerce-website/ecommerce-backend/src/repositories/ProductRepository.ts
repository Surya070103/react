import { DataSource, EntityManager, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { Category } from "../entities/Category";
import { PersistProductInput, UpdateProductInput } from "../types/product";

export class ProductRepository {
  private readonly repository: Repository<Product>;

  constructor(private readonly dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(Product);
  }

  findAll(): Promise<Product[]> {
    return this.repository.find({
      order: { createdAt: "DESC" },
    });
  }

  findById(id: number): Promise<Product | null> {
    return this.repository.findOneBy({ id });
  }

  findByName(name: string): Promise<Product | null> {
    return this.repository.findOneBy({ name });
  }

  create(input: PersistProductInput): Promise<Product> {
    return this.dataSource.transaction(async (manager) => {
      const categoryId = await this.getOrCreateCategoryId(manager, input.category);
      const products = manager.getRepository(Product);
      return products.save(products.create({ ...input, categoryId }));
    });
  }

  update(product: Product, input: UpdateProductInput): Promise<Product> {
    return this.dataSource.transaction(async (manager) => {
      const categoryId = await this.getOrCreateCategoryId(manager, input.category ?? product.category);
      Object.assign(product, input, { categoryId });
      return manager.getRepository(Product).save(product);
    });
  }

  async delete(product: Product): Promise<void> {
    await this.repository.remove(product);
  }

  private async getOrCreateCategoryId(
    manager: EntityManager,
    categoryName: string
  ): Promise<number> {
    const categories = manager.getRepository(Category);
    const existing = await categories.findOneBy({ categoryName });
    if (existing) return existing.categoryId;
    const category = await categories.save(categories.create({ categoryName }));
    return category.categoryId;
  }
}
