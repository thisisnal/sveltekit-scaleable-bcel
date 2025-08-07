import { apiService } from "$lib/services"
import type { Product, ProductResponse } from "$lib/types/product"

class ProductService {
  // Fetch all products with optional filters
  async getProducts() {
    const response = await apiService.get<ProductResponse>(
      "/products?page=1&limit=100"
    )
    return response.data
  }
}

export const productService = new ProductService()
