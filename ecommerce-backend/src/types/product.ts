export interface CreateProductInput {
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface PersistProductInput extends CreateProductInput {
  ownerUserId: number | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;
