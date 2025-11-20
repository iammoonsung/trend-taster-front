'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Share2, Flag, Loader2 } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { ProductEditButton } from '@/components/product-edit-button'
import { useProduct, useProducts, useCurrentUser } from '@/lib/api/hooks'

// Edge Runtime for Cloudflare Pages
export const runtime = 'edge'

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: product, isLoading, error } = useProduct(id)
  const { data: currentUser } = useCurrentUser()
  const { data: productsResponse } = useProducts({ categories: product?.category ? [product.category] : undefined })
  
  // Get similar products (same category, different id)
  const similarProducts = productsResponse?.content
    .filter((p) => p.id !== id)
    .slice(0, 4) || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 md:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">제품을 찾을 수 없습니다</h1>
          <Button asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    )
  }

  const getStoreBadgeClass = (store: string) => {
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.store}의 신제품 "${product.name}"을 확인해보세요!`,
          url: window.location.href,
        })
      } catch (err) {
        console.error('공유 실패:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 md:px-6 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            제품 목록으로
          </Link>
        </Button>

        {/* Product Detail Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {product.images.map((img, index) => (
                  <div key={img.id} className="relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-muted">
                    <Image
                      src={img.imageUrl}
                      alt={`${product.name} - 이미지 ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    {product.isNew && index === 0 && (
                      <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground font-semibold text-sm">
                        NEW
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-muted">
                <Image
                  src="/placeholder.svg"
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge className={`${getStoreBadgeClass(product.store)} text-sm font-medium w-fit`}>
                {product.store}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-balance">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-primary">
                  {product.price.toLocaleString('ko-KR')}원
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>출시일:</span>
                <span className="font-medium text-foreground">
                  {new Date(product.releaseDate).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <Button onClick={handleShare} className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  공유하기
                </Button>
                <Button variant="outline" size="icon">
                  <Flag className="h-4 w-4" />
                  <span className="sr-only">신고하기</span>
                </Button>
              </div>
              {currentUser && product.submittedBy === currentUser.username && (
                <ProductEditButton product={product} isOwner={true} />
              )}
            </div>

            <div className="border-t pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  카테고리
                </h3>
                <p className="text-base">{product.category}</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  제품 설명
                </h3>
                <p className="text-base leading-relaxed">{product.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  원재료/성분
                </h3>
                <p className="text-base leading-relaxed">{product.ingredients}</p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-2 text-sm text-muted-foreground">
              <p>
                등록자: <span className="text-foreground">{product.submittedBy}</span>
              </p>
              <p>
                등록일:{' '}
                <span className="text-foreground">
                  {new Date(product.submissionDate).toLocaleDateString('ko-KR')}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="border-t pt-12">
            <h2 className="text-2xl font-bold mb-6">비슷한 제품</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((product) => (
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
          </div>
        )}
      </main>
    </div>
  )
}
