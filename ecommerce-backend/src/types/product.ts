export interface CreateProductInput {
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  stock?: number;
  discountPercent?: number;
  deliveryDate?: string | null;
}

export interface PersistProductInput extends CreateProductInput {
  stock: number;
  discountPercent: number;
  deliveryDate: string | null;
  ownerUserId: number | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;
