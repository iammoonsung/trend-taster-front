'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { FilterSidebar } from '@/components/filter-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, SlidersHorizontal, Loader2, Sparkles } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useProducts } from '@/lib/api/hooks'

interface FilterState {
  stores: string[]
  priceRange: [number, number]
  categories: string[]
  dateFilter: string
}

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    stores: [],
    priceRange: [0, 50000],
    categories: [],
    dateFilter: 'all',
  })
  const [sortBy, setSortBy] = useState('newest')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 12

  // Fetch products from API
  const { data: productsResponse, isLoading, error } = useProducts({
    stores: filters.stores.length > 0 ? filters.stores : undefined,
    categories: filters.categories.length > 0 ? filters.categories : undefined,
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 50000 ? filters.priceRange[1] : undefined,
    page: currentPage,
    size: pageSize,
  })

  const products = productsResponse?.content || []

  // Additional client-side filtering for date (API handles stores, categories, price)
  const filteredProducts = products.filter((product) => {
    if (filters.dateFilter !== 'all' && product.releaseDate) {
      const daysDiff = Math.floor(
        (new Date().getTime() - new Date(product.releaseDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (filters.dateFilter === '7days' && daysDiff > 7) return false
      if (filters.dateFilter === '30days' && daysDiff > 30) return false
      if (filters.dateFilter === '3months' && daysDiff > 90) return false
    }
    return true
  })

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    }
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    return 0
  })

  const activeFilterCount =
    filters.stores.length +
    filters.categories.length +
    (filters.dateFilter !== 'all' ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50000 ? 1 : 0)

  const removeStoreFilter = (store: string) => {
    setFilters({
      ...filters,
      stores: filters.stores.filter((s) => s !== store),
    })
  }

  const removeCategoryFilter = (category: string) => {
    setFilters({
      ...filters,
      categories: filters.categories.filter((c) => c !== category),
    })
  }

  const clearAllFilters = () => {
    setFilters({
      stores: [],
      priceRange: [0, 50000],
      categories: [],
      dateFilter: 'all',
    })
    setCurrentPage(0)
  }

  // Reset page when filters change
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(0)
  }

  const totalPages = productsResponse?.totalPages || 0
  const totalElements = productsResponse?.totalElements || 0

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/5 to-transparent" />
        <div className="container px-6 md:px-8 py-12 md:py-16 relative">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-bg shadow-md shadow-primary/30">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">NEW</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">지금 뜨는</span>
              <br />
              신상 제품을 만나보세요
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              편의점과 패스트푸드의 최신 신제품을 한눈에 확인하고, 직접 등록해보세요.
            </p>
          </div>
        </div>
      </section>

      <main className="container px-6 md:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-32">
              <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full gradient-bg animate-pulse-soft" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-semibold mt-6 gradient-text">제품을 불러오는 중...</p>
                <p className="text-sm text-muted-foreground mt-1">잠시만 기다려주세요</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="w-20 h-20 mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="w-9 h-9 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-3">제품을 불러올 수 없습니다</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  서버 연결에 문제가 있습니다. 나중에 다시 시도해주세요.
                </p>
                <p className="text-sm text-muted-foreground/70 font-mono">
                  {error.message}
                </p>
              </div>
            )}

            {/* Content */}
            {!isLoading && !error && (
              <>
            {/* Mobile Filter Button & Sort */}
            <div className="flex items-center justify-between mb-8">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" className="font-medium">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    필터
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2 px-2 py-0.5 text-xs" variant="default">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>필터</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 font-medium">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="price-low">낮은 가격순</SelectItem>
                  <SelectItem value="price-high">높은 가격순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {filters.stores.map((store) => (
                  <Badge
                    key={store}
                    className="px-3 py-1.5 text-sm font-medium cursor-pointer bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-200"
                    onClick={() => removeStoreFilter(store)}
                  >
                    {store}
                    <X className="ml-1.5 h-3.5 w-3.5" />
                  </Badge>
                ))}
                {filters.categories.map((category) => (
                  <Badge
                    key={category}
                    className="px-3 py-1.5 text-sm font-medium cursor-pointer bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-200"
                    onClick={() => removeCategoryFilter(category)}
                  >
                    {category}
                    <X className="ml-1.5 h-3.5 w-3.5" />
                  </Badge>
                ))}
                {filters.dateFilter !== 'all' && (
                  <Badge
                    className="px-3 py-1.5 text-sm font-medium cursor-pointer bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-200"
                    onClick={() => setFilters({ ...filters, dateFilter: 'all' })}
                  >
                    {filters.dateFilter === '7days' && '최근 7일'}
                    {filters.dateFilter === '30days' && '최근 30일'}
                    {filters.dateFilter === '3months' && '최근 3개월'}
                    <X className="ml-1.5 h-3.5 w-3.5" />
                  </Badge>
                )}
                {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50000) && (
                  <Badge
                    className="px-3 py-1.5 text-sm font-medium cursor-pointer bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-200"
                    onClick={() => setFilters({ ...filters, priceRange: [0, 50000] })}
                  >
                    {filters.priceRange[0].toLocaleString()}원 ~ {filters.priceRange[1].toLocaleString()}원
                    <X className="ml-1.5 h-3.5 w-3.5" />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  전체 해제
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <>
                <p className="text-sm font-medium text-muted-foreground mb-6">
                  총 {totalElements}개 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}개 표시
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      store={product.store}
                      price={product.price}
                      image={product.images?.[0]?.imageUrl || '/placeholder.svg'}
                      category={product.category}
                      releaseDate={product.releaseDate || ''}
                      isNew={product.isNew}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                            className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i
                          } else if (currentPage < 3) {
                            pageNum = i
                          } else if (currentPage > totalPages - 4) {
                            pageNum = totalPages - 5 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum + 1}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                            className={currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/20" />
                  <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                    <SlidersHorizontal className="w-10 h-10 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">필터 조건에 맞는 제품이 없습니다</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  필터를 조정하거나 나중에 다시 확인해주세요
                </p>
                <Button onClick={clearAllFilters} className="font-semibold gradient-bg hover:opacity-90 shadow-lg shadow-primary/25">
                  전체 필터 해제
                </Button>
              </div>
            )}
            </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
