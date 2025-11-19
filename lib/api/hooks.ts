// React Query Hooks for API

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type {
  Product,
  ProductFilters,
  ProductSubmitRequest,
  ProductUpdateRequest,
  LoginRequest,
  RegisterRequest,
  User,
  PaginatedResponse,
  Store,
} from '@/lib/types/api'

// Query Keys
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters?: ProductFilters) => [...queryKeys.products.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
  },
  admin: {
    submissions: ['admin', 'submissions'] as const,
    stats: ['admin', 'stats'] as const,
    users: (query: string) => ['admin', 'users', query] as const,
  },
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
  },
}

// Auth Hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: () => apiClient.getCurrentUser(),
    enabled: !!apiClient.getToken(),
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => apiClient.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.currentUser, data.user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterRequest) => apiClient.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.currentUser, data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

// Product Hooks
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => apiClient.getProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filterOptions'] as const,
    queryFn: () => apiClient.getFilterOptions(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
  })
}

export function useSubmitProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProductSubmitRequest) => apiClient.submitProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateRequest }) =>
      apiClient.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useUploadProductImages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: File[] }) =>
      apiClient.uploadProductImages(productId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.productId) })
    },
  })
}

// Admin Hooks
export function usePendingSubmissions(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: [...queryKeys.admin.submissions, page, size],
    queryFn: () => apiClient.getPendingSubmissions(page, size),
    // Only fetch if user is authenticated
    enabled: !!apiClient.getToken(),
  })
}

export function useApproveSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.approveSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.submissions })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats })
    },
  })
}

export function useRejectSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.rejectSubmission(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.submissions })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats })
    },
  })
}

export function usePromoteToAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => apiClient.promoteToAdmin(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats })
    },
  })
}

export function useDemoteFromAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => apiClient.demoteFromAdmin(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats })
    },
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => apiClient.getAdminStats(),
    enabled: !!apiClient.getToken(),
  })
}

export function useSearchUsers(query: string, page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: [...queryKeys.admin.users(query), page, size],
    queryFn: () => apiClient.searchUsers(query, page, size),
    enabled: query.length > 0 && !!apiClient.getToken(),
  })
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => apiClient.uploadImage(file),
  })
}

// Store Hooks
export function useStores() {
  return useQuery({
    queryKey: ['stores'] as const,
    queryFn: () => apiClient.getStores(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ['stores', id] as const,
    queryFn: () => apiClient.getStore(id),
    enabled: !!id,
  })
}

export function useSubmitStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: import('@/lib/types/api').StoreSubmitRequest) => apiClient.submitStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: import('@/lib/types/api').StoreUpdateRequest }) =>
      apiClient.updateStore(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stores', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}

export function useDeleteStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}

// Admin Store Hooks
export function usePendingStores(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['admin', 'stores', 'submissions', page, size] as const,
    queryFn: () => apiClient.getPendingStores(page, size),
    enabled: !!apiClient.getToken(),
  })
}

export function useApproveStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.approveStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores', 'submissions'] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats })
    },
  })
}

export function useRejectStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.rejectStore(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores', 'submissions'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats })
    },
  })
}
