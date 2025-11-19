'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { X, Filter, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useFilterOptions } from '@/lib/api/hooks'

interface FilterState {
  stores: string[]
  priceRange: [number, number]
  categories: string[]
  dateFilter: string
}

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const { data: filterOptions, isLoading } = useFilterOptions()

  const stores = filterOptions?.stores || []
  const categories = filterOptions?.categories || []
  const dateFilters = [
    { value: '7days', label: '최근 7일' },
    { value: '30days', label: '최근 30일' },
    { value: '3months', label: '최근 3개월' },
    { value: 'all', label: '전체' },
  ]

  const handleStoreToggle = (store: string) => {
    const newStores = filters.stores.includes(store)
      ? filters.stores.filter((s) => s !== store)
      : [...filters.stores, store]
    onFilterChange({ ...filters, stores: newStores })
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    onFilterChange({ ...filters, categories: newCategories })
  }

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: [value[0], value[1]] })
  }

  const handleDateFilterChange = (value: string) => {
    onFilterChange({ ...filters, dateFilter: value })
  }

  const clearAllFilters = () => {
    onFilterChange({
      stores: [],
      priceRange: [0, 50000],
      categories: [],
      dateFilter: 'all',
    })
  }

  const activeFilterCount =
    filters.stores.length +
    filters.categories.length +
    (filters.dateFilter !== 'all' ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50000 ? 1 : 0)

  if (isLoading) {
    return (
      <div className="w-full space-y-8 p-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-lg shadow-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">필터</h2>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-10 h-10 rounded-full gradient-bg animate-pulse-soft" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground mt-3">필터 옵션 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 p-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-lg shadow-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">필터</h2>
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            초기화
            <Badge className="ml-1.5 px-1.5 py-0 text-[10px] gradient-bg text-white">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Store Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground/80">매장/브랜드</h3>
        <div className="space-y-2.5">
          {stores.length === 0 ? (
            <p className="text-sm text-muted-foreground">등록된 매장이 없습니다</p>
          ) : (
            stores.map((store) => (
              <div key={store} className="flex items-center space-x-3 group">
                <Checkbox
                  id={`store-${store}`}
                  checked={filters.stores.includes(store)}
                  onCheckedChange={() => handleStoreToggle(store)}
                  className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={`store-${store}`}
                  className="text-sm font-normal cursor-pointer leading-none group-hover:text-primary transition-colors"
                >
                  {store}
                </Label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground/80">가격대</h3>
        <div className="space-y-4">
          <Slider
            min={0}
            max={50000}
            step={1000}
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-primary">{filters.priceRange[0].toLocaleString()}원</span>
            <span className="text-muted-foreground">~</span>
            <span className="font-semibold text-primary">{filters.priceRange[1].toLocaleString()}원</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePriceChange([0, 1000])}
              className={`text-xs font-medium border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all ${
                filters.priceRange[0] === 0 && filters.priceRange[1] === 1000 ? 'bg-primary/10 text-primary border-primary/40' : ''
              }`}
            >
              ~1,000원
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePriceChange([1000, 3000])}
              className={`text-xs font-medium border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all ${
                filters.priceRange[0] === 1000 && filters.priceRange[1] === 3000 ? 'bg-primary/10 text-primary border-primary/40' : ''
              }`}
            >
              1,000~3,000원
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePriceChange([3000, 5000])}
              className={`text-xs font-medium border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all ${
                filters.priceRange[0] === 3000 && filters.priceRange[1] === 5000 ? 'bg-primary/10 text-primary border-primary/40' : ''
              }`}
            >
              3,000~5,000원
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePriceChange([5000, 50000])}
              className={`text-xs font-medium border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all ${
                filters.priceRange[0] === 5000 && filters.priceRange[1] === 50000 ? 'bg-primary/10 text-primary border-primary/40' : ''
              }`}
            >
              5,000원 이상
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground/80">카테고리</h3>
        <div className="space-y-2.5">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-3 group">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
                className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal cursor-pointer leading-none group-hover:text-primary transition-colors"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Date Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground/80">출시일</h3>
        <div className="space-y-2.5">
          {dateFilters.map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-3 group">
              <Checkbox
                id={`date-${value}`}
                checked={filters.dateFilter === value}
                onCheckedChange={() => handleDateFilterChange(value)}
                className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor={`date-${value}`}
                className="text-sm font-normal cursor-pointer leading-none group-hover:text-primary transition-colors"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
