'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Loader2, Store } from 'lucide-react'
import Link from 'next/link'
import { useSubmitStore, useCurrentUser } from '@/lib/api/hooks'

export default function SubmitStorePage() {
  const router = useRouter()
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()
  const submitStoreMutation = useSubmitStore()

  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
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
    description: '',
    website: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validate required fields
    if (!formData.name.trim()) {
      alert('매장/브랜드명을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      await submitStoreMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        website: formData.website.trim() || undefined,
      })

      setIsSuccess(true)
    } catch (error: any) {
      console.error('Submit failed:', error)
      const errorMsg = error.message || '제출에 실패했습니다. 다시 시도해주세요.'
      setErrorMessage(errorMsg)
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
                <h2 className="text-3xl font-semibold tracking-tight">매장/브랜드 등록이 완료되었습니다</h2>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
                  제출하신 매장/브랜드가 검토 중입니다. 승인되면 제품 등록 시 사용할 수 있습니다.
                </p>
                <p className="text-muted-foreground text-sm">
                  보통 24-48시간 이내에 검토가 완료됩니다.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                <Button asChild className="font-medium">
                  <Link href="/">홈으로</Link>
                </Button>
                <Button
                  variant="outline"
                  className="font-medium"
                  onClick={() => {
                    setIsSuccess(false)
                    setFormData({
                      name: '',
                      description: '',
                      website: '',
                    })
                  }}
                >
                  다른 매장/브랜드 등록하기
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-semibold tracking-tight">매장/브랜드 등록</h1>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed">
              새로운 매장이나 브랜드를 등록해주세요. 관리자 승인 후 제품 등록 시 사용할 수 있습니다.
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border/60">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold tracking-tight">기본 정보</CardTitle>
                <CardDescription className="text-base">매장/브랜드의 기본 정보를 입력해주세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    매장/브랜드명 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="예: CU, GS25, 버거킹, 맘스터치 등"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    편의점, 프랜차이즈 등 제품을 판매하는 매장/브랜드명을 입력해주세요
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명 (선택)</Label>
                  <Textarea
                    id="description"
                    placeholder="매장/브랜드에 대한 간단한 설명을 입력해주세요"
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
                  <Label htmlFor="website">웹사이트 (선택)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    공식 웹사이트나 소셜 미디어 주소를 입력해주세요
                  </p>
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
