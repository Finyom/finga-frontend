export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  shopId: number;
  photoPath: string;
  photoPaths?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
}