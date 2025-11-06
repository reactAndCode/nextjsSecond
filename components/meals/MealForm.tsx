"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { createMeal } from "@/app/actions/meals"
import { uploadMealImage } from "@/app/actions/upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Loader2, Utensils, Calendar } from "lucide-react"
import { toast } from "sonner"

export function MealForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [mealType, setMealType] = useState<string>('')
  const dateInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    data.set('meal_type', mealType)
    setFormData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirm = () => {
    if (!formData) return

    startTransition(async () => {
      const result = await createMeal(formData)

      if (result?.error) {
        console.error('등록 실패:', result.error)
        toast.error('등록 실패', {
          description: result.error
        })
        setShowConfirmDialog(false)
        return
      }

      // 이미지가 있으면 업로드
      if (imageFiles.length > 0 && result.mealId) {
        toast.loading('이미지 업로드 중...')

        try {
          const uploadedUrls: string[] = []

          for (let i = 0; i < imageFiles.length && i < 2; i++) {
            const uploadFormData = new FormData()
            uploadFormData.append('file', imageFiles[i])
            uploadFormData.append('property_id', result.mealId)
            uploadFormData.append('photo_number', String(i + 1))

            const uploadResult = await uploadMealImage(uploadFormData)

            if (uploadResult?.error) {
              console.error(`이미지 ${i + 1} 업로드 실패:`, uploadResult.error)
            } else if (uploadResult?.url) {
              uploadedUrls.push(uploadResult.url)
            }
          }

          toast.dismiss()
          if (uploadedUrls.length > 0) {
            toast.success(`식사와 이미지 ${uploadedUrls.length}개가 등록되었습니다`)
          } else {
            toast.success('식사가 등록되었습니다')
          }
        } catch (error) {
          console.error('이미지 업로드 중 오류:', error)
          toast.dismiss()
          toast.success('식사는 등록되었으나 이미지 업로드 중 오류가 발생했습니다')
        }
      } else {
        toast.success('식사가 성공적으로 등록되었습니다')
      }

      setShowConfirmDialog(false)
      router.push('/meals')
      router.refresh()
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                식사 기본 정보
              </CardTitle>
              <CardDescription>식사 시간과 음식명을 입력하세요 (필수)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meal_datetime" className="text-base font-semibold">
                    식사 일시 *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      ref={dateInputRef}
                      id="meal_datetime"
                      name="meal_datetime"
                      placeholder="예: 2024-01-15 12:30, 오늘 점심"
                      defaultValue={`${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().split(' ')[0].substring(0, 5)}`}
                      required
                      disabled={isPending}
                      className="h-11 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 shrink-0"
                      onClick={() => {
                        if (dateInputRef.current) {
                          dateInputRef.current.type = 'datetime-local'
                          dateInputRef.current.showPicker?.()
                          setTimeout(() => {
                            if (dateInputRef.current) {
                              dateInputRef.current.type = 'text'
                            }
                          }, 100)
                        }
                      }}
                      disabled={isPending}
                      title="달력에서 선택"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    자유롭게 입력하거나 달력 버튼 클릭
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food_name" className="text-base font-semibold">
                    음식명 *
                  </Label>
                  <Input
                    id="food_name"
                    name="food_name"
                    placeholder="예: 닭가슴살 샐러드, 김치찌개"
                    required
                    disabled={isPending}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meal_type" className="text-base font-semibold">
                  식사 구분
                </Label>
                <Select value={mealType} onValueChange={setMealType} disabled={isPending}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="식사 시간대를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="아침">🌅 아침</SelectItem>
                    <SelectItem value="점심">☀️ 점심</SelectItem>
                    <SelectItem value="저녁">🌙 저녁</SelectItem>
                    <SelectItem value="간식">🍪 간식</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 영양 정보 */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle>영양 정보</CardTitle>
              <CardDescription>칼로리와 영양소를 입력하세요 (선택)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="total_calories">총 칼로리</Label>
                  <Input
                    id="total_calories"
                    name="total_calories"
                    placeholder="예: 500kcal, 500"
                    disabled={isPending}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    단위 포함 입력 가능
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serving_size">섭취량</Label>
                  <Input
                    id="serving_size"
                    name="serving_size"
                    placeholder="예: 1인분, 200g, 300ml"
                    disabled={isPending}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="carbs">탄수화물</Label>
                  <Input
                    id="carbs"
                    name="carbs"
                    placeholder="예: 50g, 50"
                    disabled={isPending}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">단백질</Label>
                  <Input
                    id="protein"
                    name="protein"
                    placeholder="예: 30g, 30"
                    disabled={isPending}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">지방</Label>
                  <Input
                    id="fat"
                    name="fat"
                    placeholder="예: 20g, 20"
                    disabled={isPending}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="water_intake">물 섭취량</Label>
                <Input
                  id="water_intake"
                  name="water_intake"
                  placeholder="예: 500ml, 2잔"
                  disabled={isPending}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  이 식사와 함께 마신 물의 양
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 메모 */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle>메모</CardTitle>
              <CardDescription>
                식사에 대한 추가 정보를 자유롭게 입력하세요 (선택)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="예: 맛있었음&#10;다음엔 소스 적게&#10;건강한 식사"
                  rows={6}
                  disabled={isPending}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  엔터로 줄바꿈 가능
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 사진 업로드 */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle>사진</CardTitle>
              <CardDescription>음식 사진을 업로드하세요 (선택, 최대 2장)</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <MultiImageUpload
                onImagesChange={setImageFiles}
                maxImages={2}
                disabled={isPending}
              />
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border-2 shadow-lg">
            <Button type="button" variant="outline" asChild disabled={isPending} size="lg">
              <Link href="/meals">취소</Link>
            </Button>
            <Button type="submit" disabled={isPending} size="lg" className="min-w-32">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  등록 중...
                </>
              ) : (
                '식사 기록 등록'
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* 확인 다이얼로그 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>식사 기록을 등록하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              입력한 정보가 저장됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  등록 중...
                </>
              ) : (
                '등록'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
