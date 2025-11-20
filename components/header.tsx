'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Menu, LogOut, User, Store, Sparkles, Pencil } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState, useEffect } from 'react'
import { useCurrentUser, useLogout } from '@/lib/api/hooks'
import { ProfileEditDialog } from '@/components/profile-edit-dialog'

export function Header() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { data: currentUser } = useCurrentUser()
  const logoutMutation = useLogout()

  const adminAccess = currentUser?.role === 'admin' || currentUser?.role === 'super_admin'

  // Prevent hydration mismatch by only showing user info after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-6 md:px-8">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl gradient-bg group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/40 group-hover:shadow-xl group-hover:shadow-primary/50 glow-primary">
            <Sparkles className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight leading-tight text-foreground">
              Trend Taster
            </span>
            <span className="text-xs text-primary leading-tight font-semibold">
              지금 뜨는 신상 제품
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <Button asChild variant="ghost" className="font-medium hover:bg-primary/10 hover:text-primary transition-colors">
            <Link href="/submit">
              <Plus className="mr-2 h-4 w-4" />
              신제품 등록
            </Link>
          </Button>
          <Button asChild variant="ghost" className="font-medium hover:bg-primary/10 hover:text-primary transition-colors">
            <Link href="/submit-store">
              <Store className="mr-2 h-4 w-4" />
              브랜드 등록
            </Link>
          </Button>
          {mounted && adminAccess && (
            <Button variant="outline" asChild className="font-medium border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/50">
              <Link href="/admin">관리자</Link>
            </Button>
          )}
          {mounted && (
            currentUser ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-accent/50 border border-primary/20">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">{currentUser.username}</span>
                </div>
                <ProfileEditDialog
                  user={currentUser}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">프로필 수정</span>
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  className="font-medium hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </Button>
              </>
            ) : (
              <Button asChild className="font-semibold gradient-bg hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
                <Link href="/login">로그인</Link>
              </Button>
            )
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="border-l border-primary/20">
            <div className="flex flex-col space-y-4 mt-8">
              {mounted && currentUser && (
                <div className="space-y-2 mb-2">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/30 border border-primary/20">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{currentUser.username}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </div>
                  <ProfileEditDialog
                    user={currentUser}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-primary/20 hover:bg-primary/5"
                        onClick={() => setIsOpen(false)}
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        프로필 수정
                      </Button>
                    }
                  />
                </div>
              )}

              <Button asChild onClick={() => setIsOpen(false)} className="justify-start gradient-bg hover:opacity-90">
                <Link href="/submit">
                  <Plus className="mr-2 h-4 w-4" />
                  신제품 등록
                </Link>
              </Button>

              <Button asChild onClick={() => setIsOpen(false)} className="justify-start" variant="ghost">
                <Link href="/submit-store">
                  <Store className="mr-2 h-4 w-4" />
                  브랜드 등록
                </Link>
              </Button>

              {mounted && adminAccess && (
                <Button variant="outline" asChild onClick={() => setIsOpen(false)} className="justify-start border-primary/30">
                  <Link href="/admin">관리자</Link>
                </Button>
              )}

              {mounted && (
                currentUser ? (
                  <Button
                    variant="ghost"
                    className="justify-start hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </Button>
                ) : (
                  <Button asChild onClick={() => setIsOpen(false)} className="justify-start gradient-bg">
                    <Link href="/login">로그인</Link>
                  </Button>
                )
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
