import { browser } from "$app/environment"
import type { ApiResponse } from "$lib/types"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // เพิ่ม Authorization header ถ้ามี token
    if (browser) {
      const token = localStorage.getItem("token")
      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      // ถ้า token หมดอายุ ให้ล้าง localStorage
      if (response.status === 401) {
        if (browser) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          // อาจจะต้อง redirect ไปยังหน้า login ด้วย
          window.location.href = "/login"
        }
        throw new Error("Unauthorized access. Please log in again.")
      }

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "เกิดข้อผิดพลาด",
          errors: data.errors,
        }
      }

      return {
        success: true,
        data: data as T,
        message: data.message,
      }
    } catch (error) {
      console.error("API request error:", error)
      return {
        success: false,
        error: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      }
    }
  }

  // สร้างฟังก์ชันสำหรับเรียก API ต่างๆ
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiService = new ApiService()
