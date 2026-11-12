interface ProductFields {
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface CreateProductInput extends ProductFields {
  stock?: number;
  discountPercent?: number;
}

export interface PersistProductInput extends ProductFields {
  stock: number;
  discountPercent: number;
  ownerUserId: number | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;
