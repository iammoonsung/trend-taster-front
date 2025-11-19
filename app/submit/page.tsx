'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSubmitProduct, useCurrentUser, useStores } from '@/lib/api/hooks'
import { apiClient } from '@/lib/api/client'
import { uploadImageToSupabase } from '@/lib/supabase'
import {
  compressImage,
  validateImageFile,
  generateUniqueFileName,
} from '@/lib/utils/image-compression'

export default function SubmitPage() {
  const router = useRouter()
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()
  const { data: storesData, isLoading: isLoadingStores } = useStores()
  const submitProductMutation = useSubmitProduct()

  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isLoadingUser && !currentUser) {
      alert('로그인이 필요합니다.')
      router.push('/login')
    }
  }, [mounted, currentUser, isLoadingUser, router])

  const [formData, setFormData] = useState({
    name: '',
    store: '',
    price: '',
    category: '',
    releaseDate: '',
    description: '',
    ingredients: '',
    barcode: '',
    location: '',
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Get approved stores from API
  const stores = storesData?.map(store => store.name) || []
  const categories = ['스낵/과자', '음료', '도시락/식사', '디저트/아이스크림', '라면', '기타']

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })

    // Check for duplicates when name or store changes
    if ((field === 'name' || field === 'store') && formData.name && formData.store) {
      // Simulate duplicate check
      if (formData.name.includes('딸기') && formData.store === 'CU') {
        setDuplicateWarning('CU에 비슷한 이름의 제품이 이미 존재합니다. 제출 전에 확인해주세요.')
      } else {
        setDuplicateWarning(null)
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 3) {
      alert('최대 3개의 이미지만 업로드할 수 있습니다.')
      return
    }

    // Check file sizes
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert('각 이미지는 5MB 이하여야 합니다.')
      return
    }

    setImages([...images, ...files])

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validate required fields
    if (!formData.name || !formData.store || !formData.price || !formData.category) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    if (images.length === 0) {
      alert('최소 1개의 제품 이미지를 업로드해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload images with Level 2 security (compression + token validation)
      const imageUrls: string[] = []
      for (const image of images) {
        try {
          // 1. Validate image file
          const validation = validateImageFile(image, 10)
          if (!validation.valid) {
            throw new Error(validation.error)
          }

          // 2. Compress image (max 2MB, max 1920px)
          console.log(`Compressing image: ${image.name}`)
          const compressedImage = await compressImage(image)

          // 3. Get upload token from backend
          const { token, filePath } = await apiClient.getUploadToken()

          // 4. Upload directly to Supabase Storage
          const publicUrl = await uploadImageToSupabase(compressedImage, filePath)
          console.log(`Image uploaded to: ${publicUrl}`)

          // 5. Confirm upload with backend (validates token + URL)
          await apiClient.confirmUpload(token, publicUrl)

          imageUrls.push(publicUrl)
        } catch (error) {
          console.error('Image upload failed:', error)
          const errorMessage =
            error instanceof Error ? error.message : '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
          setErrorMessage(errorMessage)
          setIsSubmitting(false)
          return
        }
      }

      // Submit product with image URLs
      await submitProductMutation.mutateAsync({
        name: formData.name,
        store: formData.store,
        price: parseInt(formData.price),
        category: formData.category,
        releaseDate: formData.releaseDate || null,
        description: formData.description || null,
        ingredients: formData.ingredients || null,
        barcode: formData.barcode || null,
        location: formData.location || null,
        imageUrls,
      })

      setIsSuccess(true)
    } catch (error: any) {
      console.error('Submit failed:', error)
      setErrorMessage(error.message || '제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-6 md:px-8 py-20">
          <Card className="max-w-2xl mx-auto text-center border-border/60">
            <CardContent className="pt-16 pb-12 space-y-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-foreground/5 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-foreground" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight">제출이 완료되었습니다</h2>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
                  제출하신 제품이 검토 중입니다. 승인되면 곧 목록에 표시됩니다.
                </p>
                <p className="text-muted-foreground text-sm">
                  보통 24-48시간 이내에 검토가 완료됩니다.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                <Button asChild className="font-medium">
                  <Link href="/">제품 목록 보기</Link>
                </Button>
                <Button
                  variant="outline"
                  className="font-medium"
                  onClick={() => {
                    setIsSuccess(false)
                    setFormData({
                      name: '',
                      store: '',
                      price: '',
                      category: '',
                      releaseDate: '',
                      description: '',
                      ingredients: '',
                      barcode: '',
                      location: '',
                    })
                    setImages([])
                    setImagePreviews([])
                  }}
                >
                  다른 제품 등록하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show loading state while checking authentication
  if (!mounted || isLoadingUser) {
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

  // Don't render form if not authenticated (will redirect)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-6 md:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-semibold mb-3 tracking-tight">신제품 등록</h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              새로운 제품 정보를 공유해주세요. 관리자 승인 후 목록에 표시됩니다.
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Information */}
            <Card className="border-border/60">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold tracking-tight">기본 정보</CardTitle>
                <CardDescription className="text-base">제품의 기본 정보를 입력해주세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    제품명 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="예: 딸기 크림 샌드위치"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store">
                      매장/브랜드 <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.store}
                      onValueChange={(value) => handleInputChange('store', value)}
                      required
                      disabled={isLoadingStores || stores.length === 0}
                    >
                      <SelectTrigger id="store">
                        <SelectValue placeholder={isLoadingStores ? "로딩 중..." : stores.length === 0 ? "등록된 매장/브랜드 없음" : "선택하세요"} />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store} value={store}>
                            {store}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isLoadingStores && stores.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        등록된 매장/브랜드가 없습니다.{' '}
                        <Link href="/submit-store" className="text-primary underline hover:no-underline">
                          먼저 매장/브랜드를 등록해주세요
                        </Link>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      카테고리 <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                      required
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      가격 <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="price"
                        type="number"
                        placeholder="2800"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        required
                        min="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        원
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="releaseDate">출시일 (선택)</Label>
                    <Input
                      id="releaseDate"
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                    />
                  </div>
                </div>

                {duplicateWarning && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {duplicateWarning}{' '}
                      <Link href="/" className="underline font-medium">
                        확인하기
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card className="border-border/60">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold tracking-tight">
                  제품 이미지 <span className="text-destructive">*</span>
                </CardTitle>
                <CardDescription className="text-base">
                  최소 1개, 최대 3개의 이미지를 업로드해주세요 (각 5MB 이하)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {images.length < 3 && (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WEBP (최대 5MB)
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageChange}
                    />
                  </label>
                )}

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`미리보기 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="border-border/60">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold tracking-tight">추가 정보 (선택)</CardTitle>
                <CardDescription className="text-base">더 자세한 정보를 입력해주세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">제품 설명</Label>
                  <Textarea
                    id="description"
                    placeholder="제품에 대한 설명을 입력해주세요"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.description.length}/500
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredients">원재료/성분</Label>
                  <Textarea
                    id="ingredients"
                    placeholder="예: 밀가루, 딸기, 생크림, 설탕"
                    value={formData.ingredients}
                    onChange={(e) => handleInputChange('ingredients', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode">바코드 번호</Label>
                    <Input
                      id="barcode"
                      placeholder="8801234567890"
                      value={formData.barcode}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">구매 장소</Label>
                    <Input
                      id="location"
                      placeholder="예: 강남역 CU 본점"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 font-medium h-12"
                onClick={() => router.push('/')}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1 font-medium h-12" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  '검토 요청'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
