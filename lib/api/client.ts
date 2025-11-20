// API Client for SpringBoot Backend

import type {
  User,
  Product,
  ProductImage,
  LoginRequest,
  RegisterRequest,
  ProductSubmitRequest,
  ProductUpdateRequest,
  AuthResponse,
  PaginatedResponse,
  ProductFilters,
  AdminStats,
  ApiError,
} from '@/lib/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        // Try to parse JSON error response, fallback to empty response
        let error: ApiError
        const contentLength = response.headers.get('content-length')
        const contentType = response.headers.get('content-type')
        
        // Check if response has body and is JSON
        if (contentLength !== '0' && contentType?.includes('application/json')) {
          try {
            error = await response.json()
          } catch {
            error = {
              status: response.status,
              message: response.statusText || '알 수 없는 오류가 발생했습니다',
              timestamp: new Date().toISOString(),
            }
          }
        } else {
          error = {
            status: response.status,
            message: response.statusText || '알 수 없는 오류가 발생했습니다',
            timestamp: new Date().toISOString(),
          }
        }
        throw error
      }

      // Handle 204 No Content or empty response
      if (response.status === 204) {
        return {} as T
      }

      // Check if response has content
      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')
      
      // If no content or not JSON, return empty object
      if (contentLength === '0' || !contentType?.includes('application/json')) {
        return {} as T
      }

      // Try to parse JSON, fallback to empty object
      try {
        return await response.json()
      } catch (error) {
        console.warn('Failed to parse response as JSON, returning empty object')
        return {} as T
      }
    } catch (error) {
      // Don't log expected errors (401 unauthorized)
      if (error && typeof error === 'object' && 'status' in error && error.status !== 401) {
        console.error('API Request Error:', error)
      }
      throw error
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    this.setToken(response.token)
    return response
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    this.setToken(response.token)
    return response
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' })
    this.setToken(null)
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me')
  }

  async updateProfile(data: import('@/lib/types/api').UpdateProfileRequest): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Product endpoints
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.stores?.length) {
        filters.stores.forEach(store => params.append('stores', store))
      }
      if (filters.priceMin !== undefined) params.append('priceMin', String(filters.priceMin))
      if (filters.priceMax !== undefined) params.append('priceMax', String(filters.priceMax))
      if (filters.categories?.length) {
        filters.categories.forEach(cat => params.append('categories', cat))
      }
      if (filters.dateFilter && filters.dateFilter !== 'all') {
        params.append('dateFilter', filters.dateFilter)
      }
      if (filters.status) params.append('status', filters.status)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.page !== undefined) params.append('page', String(filters.page))
      if (filters.size !== undefined) params.append('size', String(filters.size))
    }

    const queryString = params.toString()
    return this.request<PaginatedResponse<Product>>(
      `/products${queryString ? `?${queryString}` : ''}`
    )
  }

  async getFilterOptions(): Promise<import('@/lib/types/api').FilterOptions> {
    return this.request<import('@/lib/types/api').FilterOptions>('/products/filters')
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`)
  }

  async submitProduct(data: ProductSubmitRequest): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string, data: ProductUpdateRequest): Promise<import('@/lib/types/api').ProductUpdateSubmission> {
    return this.request<import('@/lib/types/api').ProductUpdateSubmission>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  // Admin endpoints
  async getPendingSubmissions(page: number = 0, size: number = 20): Promise<PaginatedResponse<Product>> {
    return this.request<PaginatedResponse<Product>>(`/admin/submissions?page=${page}&size=${size}`)
  }

  async approveSubmission(id: string): Promise<Product> {
    return this.request<Product>(`/admin/submissions/${id}/approve`, {
      method: 'POST',
    })
  }

  async rejectSubmission(id: string, reason: string): Promise<Product> {
    return this.request<Product>(`/admin/submissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async promoteToAdmin(userId: string): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/promote`, {
      method: 'POST',
    })
  }

  async demoteFromAdmin(userId: string): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/demote`, {
      method: 'POST',
    })
  }

  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/admin/stats')
  }

  async searchUsers(query: string, page: number = 0, size: number = 20): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>(`/admin/users/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`)
  }

  // Upload Token Methods (Level 2 Security)
  async getUploadToken(): Promise<{ token: string; filePath: string }> {
    return this.request<{ token: string; filePath: string }>('/upload/token', {
      method: 'POST',
    })
  }

  async confirmUpload(token: string, publicUrl: string): Promise<void> {
    return this.request<void>('/upload/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, publicUrl }),
    })
  }

  // Legacy upload method (kept for compatibility)
  async uploadImage(file: File): Promise<string> {
    throw new Error('Please use the new upload flow with Supabase Storage')
  }

  async uploadProductImages(productId: string, files: File[]): Promise<ProductImage[]> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append('files', file)
      formData.append('displayOrder', String(index))
    })

    const headers: HeadersInit = {}
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}/products/${productId}/images`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Product images upload failed')
    }

    return response.json()
  }

  // Store endpoints
  async getStores(): Promise<import('@/lib/types/api').Store[]> {
    return this.request<import('@/lib/types/api').Store[]>('/stores')
  }

  async getStore(id: string): Promise<import('@/lib/types/api').Store> {
    return this.request<import('@/lib/types/api').Store>(`/stores/${id}`)
  }

  async submitStore(data: import('@/lib/types/api').StoreSubmitRequest): Promise<import('@/lib/types/api').Store> {
    return this.request<import('@/lib/types/api').Store>('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateStore(id: string, data: import('@/lib/types/api').StoreUpdateRequest): Promise<import('@/lib/types/api').Store> {
    return this.request<import('@/lib/types/api').Store>(`/stores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteStore(id: string): Promise<void> {
    return this.request<void>(`/stores/${id}`, {
      method: 'DELETE',
    })
  }

  // Admin Store endpoints
  async getPendingStores(page: number = 0, size: number = 20): Promise<PaginatedResponse<import('@/lib/types/api').Store>> {
    return this.request<PaginatedResponse<import('@/lib/types/api').Store>>(`/admin/stores/submissions?page=${page}&size=${size}`)
  }

  async approveStore(id: string): Promise<import('@/lib/types/api').Store> {
    return this.request<import('@/lib/types/api').Store>(`/admin/stores/submissions/${id}/approve`, {
      method: 'POST',
    })
  }

  async rejectStore(id: string, reason: string): Promise<import('@/lib/types/api').Store> {
    return this.request<import('@/lib/types/api').Store>(`/admin/stores/submissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Product Update Submissions
  async getPendingProductUpdates(): Promise<import('@/lib/types/api').ProductUpdateSubmission[]> {
    return this.request<import('@/lib/types/api').ProductUpdateSubmission[]>('/admin/product-updates')
  }

  async approveProductUpdate(id: string): Promise<Product> {
    return this.request<Product>(`/admin/product-updates/${id}/approve`, {
      method: 'POST',
    })
  }

  async rejectProductUpdate(id: string, reason: string): Promise<void> {
    return this.request<void>(`/admin/product-updates/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

// Export class for testing or multiple instances
export default ApiClient
