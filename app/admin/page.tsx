'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle, Eye, Clock, TrendingUp, Package, UserPlus, Shield, Trash2, Store as StoreIcon, Users } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import Image from 'next/image'
import {
  useCurrentUser,
  usePendingStores,
  useApproveStore,
  useRejectStore,
  usePendingSubmissions,
  useApproveSubmission,
  useRejectSubmission,
  useSearchUsers,
  usePromoteToAdmin,
  useDemoteFromAdmin,
  useAdminStats
} from '@/lib/api/hooks'
import type { Store, Product } from '@/lib/types/api'
import { useRouter } from 'next/navigation'


export default function AdminPage() {
  const router = useRouter()
  const { data: currentUser, isLoading } = useCurrentUser()

  // Pagination states
  const [productPage, setProductPage] = useState(0)
  const [storePage, setStorePage] = useState(0)
  const [userPage, setUserPage] = useState(0)
  const pageSize = 10

  // Store hooks
  const { data: pendingStoresData, isLoading: isLoadingStores } = usePendingStores(storePage, pageSize)
  const approveStoreMutation = useApproveStore()
  const rejectStoreMutation = useRejectStore()

  // Product hooks
  const { data: pendingProductsData, isLoading: isLoadingProducts } = usePendingSubmissions(productPage, pageSize)
  const approveProductMutation = useApproveSubmission()
  const rejectProductMutation = useRejectSubmission()

  // Admin/User hooks
  const { data: adminStats } = useAdminStats()
  const promoteToAdminMutation = usePromoteToAdmin()
  const demoteFromAdminMutation = useDemoteFromAdmin()

  // User search
  const [searchQuery, setSearchQuery] = useState('')
  const { data: searchedUsersData } = useSearchUsers(searchQuery, userPage, pageSize)

  // Extract data from paginated responses
  const pendingProducts = pendingProductsData?.content || []
  const pendingStores = pendingStoresData?.content || []
  const searchedUsers = searchedUsersData?.content || []

  const productTotalPages = pendingProductsData?.totalPages || 0
  const storeTotalPages = pendingStoresData?.totalPages || 0
  const userTotalPages = searchedUsersData?.totalPages || 0

  useEffect(() => {
    if (!isLoading && (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin'))) {
      alert('관리자 권한이 필요합니다.')
      router.push('/')
    }
  }, [currentUser, isLoading, router])

  // Product states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Store states
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [isStoreRejectDialogOpen, setIsStoreRejectDialogOpen] = useState(false)
  const [storeRejectReason, setStoreRejectReason] = useState('')

  // User management states
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  // Product handlers
  const handleApprove = async (productId: string) => {
    if (!confirm('이 제품을 승인하시겠습니까?')) return

    try {
      await approveProductMutation.mutateAsync(productId)
      setIsDetailOpen(false)
      alert('제품이 승인되었습니다.')
    } catch (error: any) {
      alert(error.message || '승인에 실패했습니다.')
    }
  }

  const handleReject = async () => {
    if (!selectedProduct) return

    if (!rejectReason.trim()) {
      alert('거부 사유를 입력해주세요.')
      return
    }

    try {
      await rejectProductMutation.mutateAsync({ id: selectedProduct.id, reason: rejectReason })
      setIsRejectDialogOpen(false)
      setRejectReason('')
      setSelectedProduct(null)
      alert('제품이 거부되었습니다.')
    } catch (error: any) {
      alert(error.message || '거부에 실패했습니다.')
    }
  }

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  const openRejectDialog = () => {
    setIsRejectDialogOpen(true)
    setIsDetailOpen(false)
  }

  // User management handlers
  const handlePromoteToAdmin = (user: any) => {
    setSelectedUser(user)
    setIsPromoteDialogOpen(true)
  }

  const confirmPromoteToAdmin = async () => {
    if (!selectedUser) return

    try {
      await promoteToAdminMutation.mutateAsync(selectedUser.id)
      alert(`${selectedUser.username}님을 관리자로 등업했습니다.`)
      setIsPromoteDialogOpen(false)
      setSelectedUser(null)
    } catch (error: any) {
      alert(error.message || '관리자 등업에 실패했습니다.')
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    if (currentUser && userId === currentUser.id) {
      alert('본인의 관리자 권한은 제거할 수 없습니다.')
      return
    }

    if (!confirm(`관리자 권한을 제거하시겠습니까?`)) return

    try {
      await demoteFromAdminMutation.mutateAsync(userId)
      alert('관리자 권한이 제거되었습니다.')
    } catch (error: any) {
      alert(error.message || '권한 제거에 실패했습니다.')
    }
  }

  // Store approval handlers
  const handleApproveStore = async (storeId: string) => {
    if (!confirm('이 매장/브랜드를 승인하시겠습니까?')) return

    try {
      await approveStoreMutation.mutateAsync(storeId)
      alert('매장/브랜드가 승인되었습니다.')
    } catch (error: any) {
      alert(error.message || '승인에 실패했습니다.')
    }
  }

  const handleRejectStore = async () => {
    if (!selectedStore) return

    if (!storeRejectReason.trim()) {
      alert('거부 사유를 입력해주세요.')
      return
    }

    try {
      await rejectStoreMutation.mutateAsync({ id: selectedStore.id, reason: storeRejectReason })
      setIsStoreRejectDialogOpen(false)
      setStoreRejectReason('')
      setSelectedStore(null)
      alert('매장/브랜드가 거부되었습니다.')
    } catch (error: any) {
      alert(error.message || '거부에 실패했습니다.')
    }
  }

  const adminUsers = searchedUsers.filter(u => u.role === 'admin' || u.role === 'super_admin')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 md:px-6 py-8">
          <div className="text-center">권한 확인 중...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
          <p className="text-muted-foreground">제품 승인 및 사용자 권한을 관리하세요</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">대기 중 제품</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.pendingSubmissions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">승인된 제품</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.approvedProducts || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">대기 중 브랜드</CardTitle>
              <StoreIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.pendingStores || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">승인된 브랜드</CardTitle>
              <StoreIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.approvedStores || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">관리자</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.adminUsers || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className={`grid w-full max-w-2xl ${currentUser?.role === 'super_admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="products">제품 승인</TabsTrigger>
            <TabsTrigger value="stores">매장/브랜드 승인</TabsTrigger>
            {currentUser?.role === 'super_admin' && (
              <TabsTrigger value="users">관리자 관리</TabsTrigger>
            )}
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>대기 중인 제출 ({pendingProductsData?.totalElements || 0})</CardTitle>
                <CardDescription>사용자가 제출한 제품을 검토하고 승인 또는 거부하세요</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">로딩 중...</p>
                  </div>
                ) : !pendingProducts || pendingProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">모든 제출물을 확인했습니다!</h3>
                    <p className="text-muted-foreground">현재 대기 중인 제출물이 없습니다.</p>
                    <p className="text-muted-foreground">플랫폼을 최신 상태로 유지해주셔서 감사합니다!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="relative w-full sm:w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={product.images?.[0]?.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-base leading-tight">
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${getStoreBadgeClass(product.store)} text-xs`}>
                                  {product.store}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {product.price.toLocaleString('ko-KR')}원
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>제출자: {product.submittedBy}</span>
                            <span>{getTimeAgo(product.createdAt)}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(product.id)}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedProduct(product)
                                openRejectDialog()
                              }}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              거부
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(product)}
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" />
                              상세보기
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Products Pagination */}
                    {productTotalPages > 1 && (
                      <div className="mt-6 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setProductPage(Math.max(0, productPage - 1))}
                                className={productPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            {Array.from({ length: Math.min(5, productTotalPages) }, (_, i) => {
                              let pageNum: number
                              if (productTotalPages <= 5) {
                                pageNum = i
                              } else if (productPage < 3) {
                                pageNum = i
                              } else if (productPage > productTotalPages - 4) {
                                pageNum = productTotalPages - 5 + i
                              } else {
                                pageNum = productPage - 2 + i
                              }
                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    onClick={() => setProductPage(pageNum)}
                                    isActive={productPage === pageNum}
                                    className="cursor-pointer"
                                  >
                                    {pageNum + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            })}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setProductPage(Math.min(productTotalPages - 1, productPage + 1))}
                                className={productPage === productTotalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stores Tab */}
          <TabsContent value="stores" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>대기 중인 매장/브랜드 ({pendingStoresData?.totalElements || 0})</CardTitle>
                <CardDescription>사용자가 제출한 매장/브랜드를 검토하고 승인 또는 거부하세요</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStores ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">로딩 중...</p>
                  </div>
                ) : !pendingStores || pendingStores.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">모든 제출물을 확인했습니다!</h3>
                    <p className="text-muted-foreground">현재 대기 중인 매장/브랜드가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingStores.map((store) => (
                      <div
                        key={store.id}
                        className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <StoreIcon className="w-6 h-6 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-lg">{store.name}</h3>
                                {store.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {store.description}
                                  </p>
                                )}
                                {store.website && (
                                  <a
                                    href={store.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline inline-block"
                                  >
                                    {store.website}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground pl-15">
                            <span>제출자: {store.submittedBy || '알 수 없음'}</span>
                            {store.createdAt && (
                              <span>{getTimeAgo(store.createdAt)}</span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2 pl-15">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveStore(store.id)}
                              disabled={approveStoreMutation.isPending}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedStore(store)
                                setIsStoreRejectDialogOpen(true)
                              }}
                              disabled={rejectStoreMutation.isPending}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              거부
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Stores Pagination */}
                    {storeTotalPages > 1 && (
                      <div className="mt-6 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setStorePage(Math.max(0, storePage - 1))}
                                className={storePage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            {Array.from({ length: Math.min(5, storeTotalPages) }, (_, i) => {
                              let pageNum: number
                              if (storeTotalPages <= 5) {
                                pageNum = i
                              } else if (storePage < 3) {
                                pageNum = i
                              } else if (storePage > storeTotalPages - 4) {
                                pageNum = storeTotalPages - 5 + i
                              } else {
                                pageNum = storePage - 2 + i
                              }
                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    onClick={() => setStorePage(pageNum)}
                                    isActive={storePage === pageNum}
                                    className="cursor-pointer"
                                  >
                                    {pageNum + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            })}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setStorePage(Math.min(storeTotalPages - 1, storePage + 1))}
                                className={storePage === storeTotalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>사용자 관리</CardTitle>
                <CardDescription>사용자를 관리자로 등업하거나 관리자 권한을 제거하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Admins */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      현재 관리자 ({adminUsers.length})
                    </h3>
                    <div className="space-y-2">
                      {adminUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          관리자가 없습니다
                        </p>
                      ) : (
                        adminUsers.map((admin) => (
                          <div
                            key={admin.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-accent/20"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{admin.username}</p>
                                <p className="text-xs text-muted-foreground">{admin.email}</p>
                              </div>
                            </div>
                            {currentUser && admin.id !== currentUser.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveAdmin(admin.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                권한 제거
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Search Users */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">사용자 검색</h3>
                    <Input
                      placeholder="사용자명 또는 이메일로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-4"
                    />
                    <div className="space-y-2">
                      {searchedUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {searchQuery ? '검색 결과가 없습니다' : '사용자를 검색하려면 검색어를 입력하세요'}
                        </p>
                      ) : (
                        <>
                          {searchedUsers.map((user) => {
                            const isUserAdmin = user.role === 'admin' || user.role === 'super_admin'
                            return (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  <span className="font-semibold text-sm">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{user.username}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    <span>가입: {new Date(user.createdAt).toLocaleDateString('ko-KR')}</span>
                                  </div>
                                </div>
                              </div>
                              {isUserAdmin ? (
                                <Badge variant="secondary" className="gap-1">
                                  <Shield className="h-3 w-3" />
                                  관리자
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePromoteToAdmin(user)}
                                >
                                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                                  관리자 등업
                                </Button>
                              )}
                            </div>
                            )
                          })}

                          {/* Users Pagination */}
                          {userTotalPages > 1 && (
                            <div className="mt-6 flex justify-center">
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      onClick={() => setUserPage(Math.max(0, userPage - 1))}
                                      className={userPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                  </PaginationItem>
                                  {Array.from({ length: Math.min(5, userTotalPages) }, (_, i) => {
                                    let pageNum: number
                                    if (userTotalPages <= 5) {
                                      pageNum = i
                                    } else if (userPage < 3) {
                                      pageNum = i
                                    } else if (userPage > userTotalPages - 4) {
                                      pageNum = userTotalPages - 5 + i
                                    } else {
                                      pageNum = userPage - 2 + i
                                    }
                                    return (
                                      <PaginationItem key={pageNum}>
                                        <PaginationLink
                                          onClick={() => setUserPage(pageNum)}
                                          isActive={userPage === pageNum}
                                          className="cursor-pointer"
                                        >
                                          {pageNum + 1}
                                        </PaginationLink>
                                      </PaginationItem>
                                    )
                                  })}
                                  <PaginationItem>
                                    <PaginationNext
                                      onClick={() => setUserPage(Math.min(userTotalPages - 1, userPage + 1))}
                                      className={userPage === userTotalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>제품 상세 정보</DialogTitle>
                <DialogDescription>제출된 제품의 모든 정보를 확인하세요</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedProduct.images.map((img, index) => (
                      <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={img.imageUrl}
                          alt={`${selectedProduct.name} - 이미지 ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src="/placeholder.svg"
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Badge className={`${getStoreBadgeClass(selectedProduct.store)} mb-2`}>
                      {selectedProduct.store}
                    </Badge>
                    <h3 className="text-2xl font-bold">{selectedProduct.name}</h3>
                    <p className="text-xl font-semibold text-primary mt-2">
                      {selectedProduct.price.toLocaleString('ko-KR')}원
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">카테고리:</span>
                      <p className="font-medium">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">출시일:</span>
                      <p className="font-medium">
                        {new Date(selectedProduct.releaseDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">제출자:</span>
                      <p className="font-medium">{selectedProduct.submittedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">제출 시간:</span>
                      <p className="font-medium">{getTimeAgo(selectedProduct.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">제품 설명</h4>
                    <p className="text-sm leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">원재료/성분</h4>
                    <p className="text-sm leading-relaxed">{selectedProduct.ingredients}</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  닫기
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDetailOpen(false)
                    setIsRejectDialogOpen(true)
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  거부
                </Button>
                <Button onClick={() => handleApprove(selectedProduct.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  승인
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>제출 거부</DialogTitle>
            <DialogDescription>
              제출을 거부하는 이유를 입력해주세요. 이 내용은 제출자에게 전달됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">거부 사유</Label>
              <Textarea
                id="reject-reason"
                placeholder="예: 이미지 품질이 낮습니다. 더 선명한 사진으로 다시 제출해주세요."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              거부 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 권한 부여</DialogTitle>
            <DialogDescription>
              해당 사용자에게 관리자 권한을 부여하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-accent/20">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-semibold">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{selectedUser.username}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                관리자는 제품 승인/거부 및 다른 사용자의 권한을 관리할 수 있습니다.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={confirmPromoteToAdmin}>
              <Shield className="mr-2 h-4 w-4" />
              관리자로 등업
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Store Reject Dialog */}
      <Dialog open={isStoreRejectDialogOpen} onOpenChange={setIsStoreRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>매장/브랜드 제출 거부</DialogTitle>
            <DialogDescription>
              매장/브랜드 제출을 거부하는 이유를 입력해주세요. 이 내용은 제출자에게 전달됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="store-reject-reason">거부 사유</Label>
              <Textarea
                id="store-reject-reason"
                placeholder="예: 이미 존재하는 매장/브랜드입니다. 또는 공식 웹사이트 확인이 필요합니다."
                value={storeRejectReason}
                onChange={(e) => setStoreRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStoreRejectDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectStore}
              disabled={rejectStoreMutation.isPending}
            >
              거부 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getStoreBadgeClass(store: string) {
  const storeMap: Record<string, string> = {
    'CU': 'bg-[oklch(0.50_0.18_285)] text-white',
    'GS25': 'bg-[oklch(0.45_0.15_240)] text-white',
    '7-Eleven': 'bg-[oklch(0.55_0.15_140)] text-white',
    'Emart24': 'bg-[oklch(0.70_0.18_85)] text-foreground',
    '버거킹': 'bg-red-600 text-white',
    '맘스터치': 'bg-orange-600 text-white',
    '롯데리아': 'bg-red-700 text-white',
    '엽떡': 'bg-orange-500 text-white',
  }
  return storeMap[store] || 'bg-secondary text-secondary-foreground'
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return '방금 전'
  if (diffInHours < 24) return `${diffInHours}시간 전`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}일 전`
}
