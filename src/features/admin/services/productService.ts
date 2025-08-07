import { apiService } from "$lib/services"
import type { Product, ProductResponse } from "$lib/types/product"

class ProductService {
  // Fetch all products with optional filters
  async getProducts(page = 1, search = "", limit = 10) {
    try {
      let endpoint = `/products?page=${page}&limit=${limit}`

      if (search.trim()) {
        endpoint += `&search=${encodeURIComponent(search.trim())}`
      }

      const response = await apiService.get<ProductResponse>(endpoint)
      return response.data
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    }
  }

  // Get single product by ID
  async getProduct(id: number) {
    try {
      const response = await apiService.get<{
        status: boolean
        product: Product
      }>(`/products/${id}`)
      return response.data
    } catch (error) {
      console.error("Error fetching product:", error)
      throw error
    }
  }

  // Create new product
  async createProduct(productData: Partial<Product>) {
    try {
      const response = await apiService.post<{
        status: boolean
        product: Product
      }>("/products", productData)
      return response.data
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  // Update product
  async updateProduct(id: number, productData: Partial<Product>) {
    try {
      const response = await apiService.put<{
        status: boolean
        product: Product
      }>(`/products/${id}`, productData)
      return response.data
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  // Delete product
  async deleteProduct(id: number) {
    try {
      const response = await apiService.delete<{
        status: boolean
        message: string
      }>(`/products/${id}`)
      return response.data
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }
}

export const productService = new ProductService()
