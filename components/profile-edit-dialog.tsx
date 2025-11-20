'use client'

import { useState } from 'react'
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
import { User, Pencil, Loader2 } from 'lucide-react'
import { useUpdateProfile } from '@/lib/api/hooks'
import type { User as UserType } from '@/lib/types/api'

interface ProfileEditDialogProps {
  user: UserType
  trigger?: React.ReactNode
}

export function ProfileEditDialog({ user, trigger }: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState(user.username)
  const updateProfileMutation = useUpdateProfile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Don't submit if username hasn't changed
    if (username === user.username) {
      setOpen(false)
      return
    }

    try {
      await updateProfileMutation.mutateAsync({ username })
      setOpen(false)
    } catch (error: any) {
      // Error will be displayed by the mutation's error state
      console.error('Failed to update profile:', error)
    }
  }

  // Reset username when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setUsername(user.username)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Pencil className="h-3.5 w-3.5" />
            프로필 수정
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              프로필 수정
            </DialogTitle>
            <DialogDescription>
              사용자명을 변경할 수 있습니다. 변경사항은 즉시 반영됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-muted-foreground">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">
                사용자명 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용자명을 입력하세요"
                minLength={3}
                maxLength={50}
                required
                className="focus-visible:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                3-50자 사이로 입력해주세요
              </p>
            </div>
            {updateProfileMutation.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">
                  {(updateProfileMutation.error as any)?.message || '프로필 수정에 실패했습니다'}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateProfileMutation.isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="gradient-bg"
              disabled={
                updateProfileMutation.isPending ||
                username === user.username ||
                username.length < 3 ||
                username.length > 50
              }
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
