// API Response Types for SpringBoot Backend

export interface User {
  id: string
  username: string
  email: string
  role: 'user' | 'admin' | 'super_admin'
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  store: string
  price: number
  category: string
  releaseDate: string | null
  description: string | null
  ingredients: string | null
  barcode: string | null
  location: string | null
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string | null
  reviewedBy: string | null
  rejectionReason: string | null
  viewsCount: number
  createdAt: string
  updatedAt: string
  images?: ProductImage[]
  isNew?: boolean
}

export interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  storagePath: string
  displayOrder: number
  createdAt: string
}

export interface AdminActivityLog {
  id: string
  adminId: string | null
  action: string
  targetType: string | null
  targetId: string | null
  details: Record<string, any> | null
  createdAt: string
}

// Request DTOs
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface ProductSubmitRequest {
  name: string
  store: string
  price: number
  category: string
  releaseDate?: string
  description?: string
  ingredients?: string
  barcode?: string
  location?: string
}

export interface ProductUpdateRequest {
  name?: string
  store?: string
  price?: number
  category?: string
  releaseDate?: string
  description?: string
  ingredients?: string
  barcode?: string
  location?: string
  status?: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
}

export interface FilterOptions {
  stores: string[]
  categories: string[]
}

// Response DTOs
export interface AuthResponse {
  token: string
  user: User
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface ApiError {
  status: number
  message: string
  timestamp: string
  path?: string
}

// Query Parameters
export interface ProductFilters {
  stores?: string[]
  priceMin?: number
  priceMax?: number
  categories?: string[]
  dateFilter?: '7days' | '30days' | '3months' | 'all'
  status?: 'pending' | 'approved' | 'rejected'
  sortBy?: 'newest' | 'price-low' | 'price-high'
  page?: number
  size?: number
}

export interface AdminStats {
  pendingSubmissions: number
  approvedProducts: number
  pendingStores: number
  approvedStores: number
  totalUsers: number
  adminUsers: number
}

// Store/Brand related types
export interface Store {
  id: string
  name: string
  description: string | null
  website: string | null
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string | null
  reviewedBy: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export interface StoreSubmitRequest {
  name: string
  description?: string
  website?: string
}

export interface StoreUpdateRequest {
  description?: string
  website?: string
}
