import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Flame } from 'lucide-react'

interface ProductCardProps {
  id: string
  name: string
  store: string
  price: number
  image: string
  category: string
  releaseDate: string
  isNew?: boolean
}

export function ProductCard({
  id,
  name,
  store,
  price,
  image,
  category,
  releaseDate,
  isNew = false,
}: ProductCardProps) {
  // Vibrant brand colors - 청량하고 생동감 있는 색상
  const getStoreBadgeClass = (store: string) => {
    const storeMap: Record<string, string> = {
      'CU': 'bg-gradient-to-r from-[oklch(0.58_0.22_285)] to-[oklch(0.52_0.20_300)] text-white shadow-md shadow-[oklch(0.58_0.22_285)]/40',
      'GS25': 'bg-gradient-to-r from-[oklch(0.55_0.20_220)] to-[oklch(0.50_0.18_240)] text-white shadow-md shadow-[oklch(0.55_0.20_220)]/40',
      '7-Eleven': 'bg-gradient-to-r from-[oklch(0.62_0.20_145)] to-[oklch(0.55_0.18_160)] text-white shadow-md shadow-[oklch(0.62_0.20_145)]/40',
      'Emart24': 'bg-gradient-to-r from-[oklch(0.72_0.20_85)] to-[oklch(0.65_0.18_70)] text-white shadow-md shadow-[oklch(0.72_0.20_85)]/40',
      '버거킹': 'bg-gradient-to-r from-[oklch(0.55_0.20_25)] to-[oklch(0.48_0.18_15)] text-white shadow-md shadow-[oklch(0.55_0.20_25)]/40',
      '맘스터치': 'bg-gradient-to-r from-[oklch(0.65_0.20_50)] to-[oklch(0.58_0.18_40)] text-white shadow-md shadow-[oklch(0.65_0.20_50)]/40',
      '롯데리아': 'bg-gradient-to-r from-[oklch(0.52_0.20_25)] to-[oklch(0.45_0.18_15)] text-white shadow-md shadow-[oklch(0.52_0.20_25)]/40',
      '엽떡': 'bg-gradient-to-r from-[oklch(0.62_0.20_40)] to-[oklch(0.55_0.18_30)] text-white shadow-md shadow-[oklch(0.62_0.20_40)]/40',
    }
    return storeMap[store] || 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/40'
  }

  return (
    <Link href={`/product/${id}`}>
      <Card className="group overflow-hidden border border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer h-full bg-card/80 backdrop-blur-sm hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {isNew && (
            <Badge className="absolute top-3 right-3 gradient-bg text-white font-semibold text-xs px-2.5 py-1 shadow-lg shadow-primary/30 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              NEW
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge className={`${getStoreBadgeClass(store)} text-xs font-semibold px-2.5 py-1`}>
              {store}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">{category}</span>
          </div>
          <h3 className="font-semibold text-base line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
            {name}
          </h3>
          <p className="text-lg font-bold text-foreground">
            <span className="gradient-text">{price.toLocaleString('ko-KR')}</span>
            <span className="text-sm font-medium text-muted-foreground ml-0.5">원</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
