"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateProperty } from "@/app/actions/properties"
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
import Image from "next/image"
import type { Property } from "@/types/property"
import { toast } from "sonner"

type PropertyEditFormProps = {
  property: Property
}

export function PropertyEditForm({ property }: PropertyEditFormProps) {
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
      // 1. 부동산 정보 먼저 수정
      const result = await updateProperty(property.id, formData)

      if (result?.error) {
        toast.error('수정 실패', {
          description: result.error
        })
        setShowConfirmDialog(false)
        return
      }

      // 2. 새 이미지가 있으면 업로드
      if (imageFiles.length > 0) {
        toast.loading('이미지 업로드 중...')

        try {
          const uploadedUrls: string[] = []
          const currentImageCount = [property.photo_url_1, property.photo_url_2].filter(Boolean).length

          for (let i = 0; i < imageFiles.length && i < 2; i++) {
            const photoNumber = (i + 1) as 1 | 2
            const uploadFormData = new FormData()
            uploadFormData.append('file', imageFiles[i])
            uploadFormData.append('property_id', property.id)
            uploadFormData.append('photo_number', String(photoNumber))

            const uploadResult = await uploadPropertyImage(uploadFormData)

            if (uploadResult?.error) {
              console.error(`이미지 ${photoNumber} 업로드 실패:`, uploadResult.error)
              toast.error(`이미지 ${photoNumber} 업로드 실패`, {
                description: uploadResult.error
              })
            } else if (uploadResult?.url) {
              uploadedUrls.push(uploadResult.url)
            }
          }

          toast.dismiss()
          if (uploadedUrls.length > 0) {
            toast.success(`부동산 정보와 이미지 ${uploadedUrls.length}개가 수정되었습니다`)
          } else {
            toast.success('부동산 정보가 수정되었습니다 (이미지 업로드 실패)')
          }
        } catch (error) {
          console.error('이미지 업로드 중 오류:', error)
          toast.dismiss()
          toast.success('부동산 정보는 수정되었으나 이미지 업로드 중 오류가 발생했습니다')
        }
      } else {
        toast.success('부동산 정보가 성공적으로 수정되었습니다')
      }

      setShowConfirmDialog(false)
      router.push(`/properties/${property.id}`)
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
                    defaultValue={property.name}
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">지역명 *</Label>
                  <Input
                    id="region"
                    name="region"
                    defaultValue={property.region}
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
                    defaultValue={property.area}
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
                    defaultValue={property.pyeong}
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
                    defaultValue={property.floor || ''}
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
                  defaultValue={property.registered_date}
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
                    defaultValue={property.sale_price / 10000000}
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
                    defaultValue={property.recent_transaction_price ? property.recent_transaction_price / 10000000 : ''}
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
                  defaultValue={property.management_fee || ''}
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
                    defaultValue={property.total_households || ''}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rooms">방수</Label>
                  <Input
                    id="rooms"
                    name="rooms"
                    type="number"
                    defaultValue={property.rooms || ''}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">욕실수</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    defaultValue={property.bathrooms || ''}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">방향</Label>
                <Input
                  id="direction"
                  name="direction"
                  defaultValue={property.direction || ''}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">매물 설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={property.description || ''}
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
                    defaultValue={property.agent_name || ''}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent_contact">중개사 연락처</Label>
                  <Input
                    id="agent_contact"
                    name="agent_contact"
                    type="tel"
                    defaultValue={property.agent_contact || ''}
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 사진 */}
          <Card>
            <CardHeader>
              <CardTitle>사진</CardTitle>
              <CardDescription>부동산 사진을 업로드하세요 (선택사항)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 현재 이미지 */}
              {(property.photo_url_1 || property.photo_url_2) && (
                <div>
                  <Label>현재 사진</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {property.photo_url_1 && (
                      <div className="relative aspect-video rounded-lg border overflow-hidden">
                        <Image
                          src={property.photo_url_1}
                          alt="사진 1"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          사진 1
                        </div>
                      </div>
                    )}
                    {property.photo_url_2 && (
                      <div className="relative aspect-video rounded-lg border overflow-hidden">
                        <Image
                          src={property.photo_url_2}
                          alt="사진 2"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          사진 2
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 새 이미지 업로드 */}
              <div>
                <Label>새 사진 업로드 (기존 사진 교체)</Label>
                <div className="mt-2">
                  <MultiImageUpload
                    onImagesChange={setImageFiles}
                    maxImages={2}
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild disabled={isPending}>
              <Link href={`/properties/${property.id}`}>취소</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  수정 중...
                </>
              ) : (
                '수정하기'
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* 확인 다이얼로그 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>부동산 정보를 수정하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              입력하신 정보로 부동산 정보가 수정됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  수정 중...
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
