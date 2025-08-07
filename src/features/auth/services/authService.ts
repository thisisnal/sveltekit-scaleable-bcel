import { apiService } from "$lib/services"
import type { LoginCredentials, RegisterData, AuthResponse } from "$lib/types"

class AuthService {
  // Login method to authenticate user
  async login(credentials: LoginCredentials) {
    const response = await apiService.post<AuthResponse>("/login", credentials)

    if (response.success && response.data) {
      // Keep token and user data in localStorage
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      }
    }
    return {
      success: false,
      error: response.error || "Login failed",
      errors: response.errors,
    }
  }

  // Register method to create a new user
  async register(data: RegisterData) {
    return await apiService.post<AuthResponse>("/register", data)
  }
}

export const authService = new AuthService()
