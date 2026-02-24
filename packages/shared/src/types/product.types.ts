export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  commission_rate?: number;
  product_url: string;
  status: ProductStatus;
  created_at: Date;
  updated_at: Date;
}
