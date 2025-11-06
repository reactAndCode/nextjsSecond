"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

type ImageUploadProps = {
  userId: string
  propertyId: string
  photoNumber: 1 | 2
  currentUrl?: string
  onUploadSuccess: (url: string) => void
  disabled?: boolean
}

export function ImageUpload({
  userId,
  propertyId,
  photoNumber,
  currentUrl,
  onUploadSuccess,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('파일 형식 오류', {
        description: 'jpg, png, webp 형식만 업로드 가능합니다.'
      })
      return
    }

    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('파일 크기 초과', {
        description: '파일 크기는 5MB 이하여야 합니다.'
      })
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()

      // 파일 경로 생성
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${propertyId}/photo${photoNumber}_${timestamp}.${fileExt}`

      // 기존 파일 삭제 (있는 경우)
      if (currentUrl) {
        const oldPath = currentUrl.split('/my-real-estate/')[1]
        if (oldPath) {
          await supabase.storage.from('my-real-estate').remove([oldPath])
        }
      }

      // 파일 업로드
      const { data, error } = await supabase.storage
        .from('my-real-estate')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        throw error
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('my-real-estate')
        .getPublicUrl(data.path)

      setPreviewUrl(publicUrl)
      onUploadSuccess(publicUrl)
      toast.success('이미지가 업로드되었습니다')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('업로드 실패', {
        description: '이미지 업로드 중 오류가 발생했습니다.'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!previewUrl) return

    const confirmed = confirm('이미지를 삭제하시겠습니까?')
    if (!confirmed) return

    setUploading(true)

    try {
      const supabase = createClient()
      const path = previewUrl?.split('/my-real-estate/')[1]

      if (path) {
        await supabase.storage.from('my-real-estate').remove([path])
      }

      setPreviewUrl(null)
      onUploadSuccess('')
    } catch (error) {
      console.error('Delete error:', error)
      alert('이미지 삭제 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`photo${photoNumber}`}>
        사진 {photoNumber}
      </Label>

      {previewUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={previewUrl}
            alt={`사진 ${photoNumber}`}
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={uploading || disabled}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            id={`photo${photoNumber}`}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading || disabled}
            className="cursor-pointer"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        JPG, PNG, WEBP (최대 5MB)
      </p>
    </div>
  )
}
