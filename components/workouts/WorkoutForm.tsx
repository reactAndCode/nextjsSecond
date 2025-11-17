"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createWorkout, getSuggestedReps } from "@/app/actions/workouts"
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
import { Loader2, Dumbbell, Calendar } from "lucide-react"
import { toast } from "sonner"

export function WorkoutForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [exerciseName, setExerciseName] = useState("")
  const [suggestedReps, setSuggestedReps] = useState("")
  const dateInputRef = useRef<HTMLInputElement>(null)
  const repsInputRef = useRef<HTMLInputElement>(null)

  // 운동명 입력 시 추천 횟수 가져오기
  useEffect(() => {
    if (!exerciseName || exerciseName.trim().length < 2) {
      setSuggestedReps("")
      return
    }

    const timer = setTimeout(async () => {
      const result = await getSuggestedReps(exerciseName.trim())
      if (result.suggestedReps) {
        setSuggestedReps(result.suggestedReps)
        if (repsInputRef.current && !repsInputRef.current.value) {
          repsInputRef.current.value = result.suggestedReps
        }
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [exerciseName])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setFormData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirm = () => {
    if (!formData) return

    startTransition(async () => {
      // 1. 운동 먼저 등록
      const result = await createWorkout(formData)

      if (result?.error) {
        console.error('등록 실패:', result.error)
        toast.error('등록 실패', {
          description: result.error
        })
        setShowConfirmDialog(false)
        return
      }

      if (!result?.success || !result?.workoutId) {
        toast.error('등록 실패', {
          description: '운동 ID를 받지 못했습니다.'
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
            uploadFormData.append('property_id', result.workoutId)
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
            toast.success(`운동과 이미지 ${uploadedUrls.length}개가 등록되었습니다`)
          } else {
            toast.success('운동이 등록되었습니다 (이미지 업로드 실패)')
          }
        } catch (error) {
          console.error('이미지 업로드 중 오류:', error)
          toast.dismiss()
          toast.success('운동은 등록되었으나 이미지 업로드 중 오류가 발생했습니다')
        }
      } else {
        toast.success('운동이 성공적으로 등록되었습니다')
      }

      setShowConfirmDialog(false)
      router.push('/workouts')
      router.refresh()
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                운동 기본 정보
              </CardTitle>
              <CardDescription>운동 이름과 날짜를 입력하세요 (필수)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="exercise_name" className="text-base font-semibold">
                    운동명 *
                  </Label>
                  <Input
                    id="exercise_name"
                    name="exercise_name"
                    placeholder="예: 벤치프레스, 스쿼트, 데드리프트"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    required
                    disabled={isPending}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workout_date" className="text-base font-semibold">
                    운동 날짜 *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      ref={dateInputRef}
                      id="workout_date"
                      name="workout_date"
                      placeholder="예: 2024-01-15, 오늘, 1월 15일"
                      defaultValue={new Date().toISOString().split('T')[0]}
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
                          dateInputRef.current.type = 'date'
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="body_part" className="text-base font-semibold">
                  운동 부위
                </Label>
                <Input
                  id="body_part"
                  name="body_part"
                  placeholder="예: 가슴, 등, 어깨, 하체, 팔, 복근"
                  disabled={isPending}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  오늘 운동한 신체 부위
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 운동 상세 정보 */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle>운동 상세 정보</CardTitle>
              <CardDescription>중량, 횟수, 세트수, 시간 등을 입력하세요 (선택)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="weight">중량</Label>
                  <Input
                    id="weight"
                    name="weight"
                    placeholder="예: 80kg, 100lbs"
                    disabled={isPending}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    단위 포함 입력 가능
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reps">횟수</Label>
                  <Input
                    ref={repsInputRef}
                    id="reps"
                    name="reps"
                    placeholder={suggestedReps ? `추천: ${suggestedReps}회 (지난주 대비 +10%)` : "예: 10회, 8-12회"}
                    disabled={isPending}
                    className="h-11"
                  />
                  {suggestedReps && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      💪 지난주보다 10% 증가된 횟수입니다
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sets">세트수</Label>
                  <Input
                    id="sets"
                    name="sets"
                    placeholder="예: 3세트, 4세트"
                    disabled={isPending}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">운동 시간</Label>
                  <Input
                    id="duration"
                    name="duration"
                    placeholder="예: 45분, 1시간 30분"
                    disabled={isPending}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    총 운동한 시간
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intensity">운동 강도</Label>
                  <Input
                    id="intensity"
                    name="intensity"
                    placeholder="예: 낮음, 보통, 높음, 매우높음"
                    disabled={isPending}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    오늘 운동의 강도
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 컨디션 및 목표 */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle>컨디션 & 목표</CardTitle>
              <CardDescription>오늘 상태와 다음 목표를 기록하세요 (선택)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="condition">오늘 컨디션</Label>
                  <Input
                    id="condition"
                    name="condition"
                    placeholder="예: 좋음, 보통, 피곤함, 최상"
                    disabled={isPending}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    오늘 몸 상태
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_goal">다음 목표</Label>
                  <Input
                    id="next_goal"
                    name="next_goal"
                    placeholder="예: 중량 5kg 늘리기, 횟수 12회로 증가"
                    disabled={isPending}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    다음에 도전할 목표
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상세 내역 */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle>상세 내역</CardTitle>
              <CardDescription>
                운동에 대한 추가 정보를 자유롭게 입력하세요 (선택)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="예: 오늘 컨디션이 좋았음&#10;자세에 집중&#10;다음번엔 중량 늘려볼 것"
                  rows={8}
                  disabled={isPending}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  엔터로 줄바꿈 가능
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 사진 업로드 */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle>사진 첨부</CardTitle>
              <CardDescription>운동 사진을 업로드하세요 (선택사항)</CardDescription>
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
              <Link href="/workouts">취소</Link>
            </Button>
            <Button type="submit" disabled={isPending} size="lg" className="min-w-32">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  등록 중...
                </>
              ) : (
                '운동 기록 등록'
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* 확인 다이얼로그 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>운동 기록을 등록하시겠습니까?</AlertDialogTitle>
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
