"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createProperty } from "@/app/actions/properties"
import { uploadPropertyImage } from "@/app/actions/upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MultiImageUpload } from "@/components/properties/MultiImageUpload"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function PropertyForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setFormData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirm = () => {
    if (!formData) return

    startTransition(async () => {
      // 1. 부동산 먼저 등록
      const result = await createProperty(formData)

      if (result?.error) {
        console.error('등록 실패:', result.error)
        toast.error('등록 실패', {
          description: result.error
        })
        setShowConfirmDialog(false)
        return
      }

      if (!result?.success || !result?.propertyId) {
        toast.error('등록 실패', {
          description: '부동산 ID를 받지 못했습니다.'
        })
        setShowConfirmDialog(false)
        return
      }

      // 2. 이미지가 있으면 업로드
      if (imageFiles.length > 0) {
        toast.loading('이미지 업로드 중...')

        try {
          const uploadedUrls: string[] = []

          for (let i = 0; i < imageFiles.length && i < 2; i++) {
            const uploadFormData = new FormData()
            uploadFormData.append('file', imageFiles[i])
            uploadFormData.append('property_id', result.propertyId)
            uploadFormData.append('photo_number', String(i + 1))

            const uploadResult = await uploadPropertyImage(uploadFormData)

            if (uploadResult?.error) {
              console.error(`이미지 ${i + 1} 업로드 실패:`, uploadResult.error)
              toast.error(`이미지 ${i + 1} 업로드 실패`, {
                description: uploadResult.error
              })
            } else if (uploadResult?.url) {
              uploadedUrls.push(uploadResult.url)
            }
          }

          toast.dismiss()
          if (uploadedUrls.length > 0) {
            toast.success(`부동산과 이미지 ${uploadedUrls.length}개가 등록되었습니다`)
          } else {
            toast.success('부동산이 등록되었습니다 (이미지 업로드 실패)')
          }
        } catch (error) {
          console.error('이미지 업로드 중 오류:', error)
          toast.dismiss()
          toast.success('부동산은 등록되었으나 이미지 업로드 중 오류가 발생했습니다')
        }
      } else {
        toast.success('부동산이 성공적으로 등록되었습니다')
      }

      setShowConfirmDialog(false)
      router.push('/properties')
      router.refresh()
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>부동산의 기본적인 정보를 입력하세요 (필수)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">아파트명 *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="예: 래미안 아파트"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">지역명 *</Label>
                  <Input
                    id="region"
                    name="region"
                    placeholder="예: 서울시 강남구"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="area">면적(㎡) *</Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    step="0.01"
                    placeholder="84.5"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pyeong">평형 *</Label>
                  <Input
                    id="pyeong"
                    name="pyeong"
                    type="number"
                    step="0.1"
                    placeholder="25.5"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">층수</Label>
                  <Input
                    id="floor"
                    name="floor"
                    type="number"
                    placeholder="10"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registered_date">등록일자 *</Label>
                <Input
                  id="registered_date"
                  name="registered_date"
                  type="date"
                  required
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* 가격 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>가격 정보</CardTitle>
              <CardDescription>부동산의 가격 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sale_price">매매가격(천만원 단위) *</Label>
                  <Input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    step="0.1"
                    placeholder="127"
                    required
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">예: 12.7억 = 127, 8억 = 80</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recent_transaction_price">최근 실거래가(천만원 단위)</Label>
                  <Input
                    id="recent_transaction_price"
                    name="recent_transaction_price"
                    type="number"
                    step="0.1"
                    placeholder="120"
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">예: 12억 = 120</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="management_fee">관리비(원)</Label>
                <Input
                  id="management_fee"
                  name="management_fee"
                  type="number"
                  placeholder="150000"
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* 상세 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>상세 정보</CardTitle>
              <CardDescription>부동산의 상세 정보를 입력하세요 (선택)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="total_households">총세대수</Label>
                  <Input
                    id="total_households"
                    name="total_households"
                    type="number"
                    placeholder="500"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rooms">방수</Label>
                  <Input
                    id="rooms"
                    name="rooms"
                    type="number"
                    placeholder="3"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">욕실수</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    placeholder="2"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">방향</Label>
                <Input
                  id="direction"
                  name="direction"
                  placeholder="남향"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">매물 설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="부동산에 대한 상세한 설명을 입력하세요..."
                  rows={4}
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* 중개사 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>중개사 정보</CardTitle>
              <CardDescription>중개사 정보를 입력하세요 (선택)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agent_name">중개사명</Label>
                  <Input
                    id="agent_name"
                    name="agent_name"
                    placeholder="홍길동 공인중개사"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent_contact">중개사 연락처</Label>
                  <Input
                    id="agent_contact"
                    name="agent_contact"
                    type="tel"
                    placeholder="010-1234-5678"
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 사진 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle>사진</CardTitle>
              <CardDescription>부동산 사진을 업로드하세요 (선택사항)</CardDescription>
            </CardHeader>
            <CardContent>
              <MultiImageUpload
                onImagesChange={setImageFiles}
                maxImages={2}
                disabled={isPending}
              />
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild disabled={isPending}>
              <Link href="/properties">취소</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                '등록하기'
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* 확인 다이얼로그 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>부동산을 등록하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              입력하신 정보로 부동산이 등록됩니다. 등록 후에도 수정이 가능합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                '확인'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
