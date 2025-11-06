"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

type MultiImageUploadProps = {
  onImagesChange: (images: File[]) => void
  maxImages?: number
  disabled?: boolean
}

export function MultiImageUpload({
  onImagesChange,
  maxImages = 2,
  disabled = false,
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (selectedFiles.length === 0) return

    // 최대 개수 체크
    const totalFiles = files.length + selectedFiles.length
    if (totalFiles > maxImages) {
      toast.error('이미지 개수 초과', {
        description: `최대 ${maxImages}개까지만 업로드 가능합니다.`
      })
      return
    }

    // 파일 형식 및 크기 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        toast.error('파일 형식 오류', {
          description: `${file.name}: jpg, png, webp 형식만 업로드 가능합니다.`
        })
        return
      }

      if (file.size > maxSize) {
        toast.error('파일 크기 초과', {
          description: `${file.name}: 파일 크기는 5MB 이하여야 합니다.`
        })
        return
      }
    }

    // 미리보기 생성
    const newPreviews: string[] = []
    for (const file of selectedFiles) {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)

        if (newPreviews.length === selectedFiles.length) {
          setPreviews([...previews, ...newPreviews])
          const newFiles = [...files, ...selectedFiles]
          setFiles(newFiles)
          onImagesChange(newFiles)

          toast.success(`${selectedFiles.length}개의 이미지가 선택되었습니다`)
        }
      }
      reader.readAsDataURL(file)
    }

    // input 초기화
    e.target.value = ''
  }

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    const newFiles = files.filter((_, i) => i !== index)

    setPreviews(newPreviews)
    setFiles(newFiles)
    onImagesChange(newFiles)

    toast.success('이미지가 제거되었습니다')
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>사진 ({files.length}/{maxImages})</Label>
        <p className="text-sm text-muted-foreground mb-2">
          최대 {maxImages}개, 각 5MB 이하 (jpg, png, webp)
        </p>
      </div>

      {/* 파일 선택 버튼 */}
      {files.length < maxImages && (
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            disabled={disabled || uploading}
          />
          <label
            htmlFor="image-upload"
            className={`cursor-pointer flex flex-col items-center ${
              disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-3" />
            ) : (
              <Upload className="h-12 w-12 text-muted-foreground mb-3" />
            )}
            <Button
              type="button"
              variant="outline"
              disabled={disabled || uploading}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('image-upload')?.click()
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              {files.length === 0 ? '사진 선택' : '사진 추가'}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              또는 파일을 여기로 드래그하세요
            </p>
          </label>
        </div>
      )}

      {/* 미리보기 - 가로로 2개 */}
      {previews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-lg border overflow-hidden group bg-muted"
            >
              <Image
                src={preview}
                alt={`미리보기 ${index + 1}`}
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
                disabled={disabled || uploading}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                사진 {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 선택된 파일 정보 */}
      {files.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <span className="truncate flex-1">
                {index + 1}. {file.name}
              </span>
              <span className="ml-2 text-xs">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
