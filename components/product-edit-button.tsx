'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Loader2, Check } from 'lucide-react'
import { useUpdateProduct } from '@/lib/api/hooks'
import type { Product } from '@/lib/types/api'

interface ProductEditButtonProps {
  product: Product
  isOwner: boolean
}

export function ProductEditButton({ product, isOwner }: ProductEditButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const updateProductMutation = useUpdateProduct()

  const [formData, setFormData] = useState({
    name: product.name,
    store: product.store,
    price: product.price,
    category: product.category,
    releaseDate: product.releaseDate || '',
    description: product.description || '',
    ingredients: product.ingredients || '',
    barcode: product.barcode || '',
    location: product.location || '',
  })

  if (!isOwner) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateProductMutation.mutateAsync({ id: product.id, data: formData })
      setSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        setSubmitted(false)
      }, 2000)
    } catch (error: any) {
      console.error('Failed to submit update:', error)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSubmitted(false)
      // Reset form data when closing
      setFormData({
        name: product.name,
        store: product.store,
        price: product.price,
        category: product.category,
        releaseDate: product.releaseDate || '',
        description: product.description || '',
        ingredients: product.ingredients || '',
        barcode: product.barcode || '',
        location: product.location || '',
      })
    }
  }

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-primary/30">
            <Pencil className="mr-2 h-4 w-4" />
            제품 수정
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">수정 요청이 제출되었습니다!</h3>
              <p className="text-muted-foreground">
                관리자 승인 후 변경사항이 반영됩니다.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/30">
          <Pencil className="mr-2 h-4 w-4" />
          제품 수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>제품 정보 수정</DialogTitle>
            <DialogDescription>
              수정 요청은 관리자 승인 후 반영됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                제품명 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="store">
                매장/브랜드 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="store"
                value={formData.store}
                onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">
                  가격 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">
                  카테고리 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="releaseDate">출시일</Label>
              <Input
                id="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">제품 설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ingredients">원재료/성분</Label>
              <Textarea
                id="ingredients"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="barcode">바코드</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">판매 위치</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            {updateProductMutation.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">
                  {(updateProductMutation.error as any)?.message || '수정 요청 제출에 실패했습니다'}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateProductMutation.isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="gradient-bg"
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  제출 중...
                </>
              ) : (
                '수정 요청'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
