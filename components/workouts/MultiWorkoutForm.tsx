"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createWorkout, getLastWeekWorkouts } from "@/app/actions/workouts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import Link from "next/link"
import { Loader2, Dumbbell, Plus, X, Calendar, RefreshCw } from "lucide-react"
import { toast } from "sonner"

type WorkoutInput = {
  id: string
  exercise_name: string
  workout_date: string
  body_part: string
  weight: string
  reps: string
  sets: string
  duration: string
}

export function MultiWorkoutForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isLoadingLastWeek, setIsLoadingLastWeek] = useState(true)
  const [workouts, setWorkouts] = useState<WorkoutInput[]>([
    {
      id: '1',
      exercise_name: '',
      workout_date: new Date().toISOString().split('T')[0],
      body_part: '',
      weight: '',
      reps: '',
      sets: '',
      duration: '',
    }
  ])
  const dateInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // 페이지 로드 시 자동으로 지난주 운동 불러오기
  useEffect(() => {
    loadLastWeekWorkouts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadLastWeekWorkouts = async () => {
    console.log('=== loadLastWeekWorkouts 시작 ===')
    setIsLoadingLastWeek(true)
    try {
      const result = await getLastWeekWorkouts()
      console.log('getLastWeekWorkouts 결과:', result)

      if (result.error) {
        console.error('Error loading workouts:', result.error)
        setIsLoadingLastWeek(false)
        return
      }

      if (!result.data || result.data.length === 0) {
        console.log('지난주 운동 없음')
        setIsLoadingLastWeek(false)
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const newWorkouts = result.data.map((workout, index) => ({
        id: String(index + 1),
        exercise_name: workout.exercise_name,
        workout_date: today,
        body_part: workout.body_part,
        weight: workout.weight,
        reps: workout.reps,
        sets: workout.sets,
        duration: '',
      }))

      console.log('newWorkouts:', newWorkouts)
      setWorkouts(newWorkouts)
      console.log('setWorkouts 완료')
    } catch (error) {
      console.error('Error loading last week workouts:', error)
    } finally {
      setIsLoadingLastWeek(false)
      console.log('=== loadLastWeekWorkouts 완료 ===')
    }
  }

  const addWorkout = () => {
    if (workouts.length >= 5) {
      toast.error('최대 5개까지만 추가할 수 있습니다')
      return
    }
    setWorkouts([...workouts, {
      id: String(workouts.length + 1),
      exercise_name: '',
      workout_date: new Date().toISOString().split('T')[0],
      body_part: '',
      weight: '',
      reps: '',
      sets: '',
      duration: '',
    }])
  }

  const removeWorkout = (id: string) => {
    if (workouts.length <= 1) {
      toast.error('최소 1개의 운동은 있어야 합니다')
      return
    }
    setWorkouts(workouts.filter(w => w.id !== id))
  }

  const updateWorkout = (id: string, field: keyof WorkoutInput, value: string) => {
    setWorkouts(workouts.map(w =>
      w.id === id ? { ...w, [field]: value } : w
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 빈 운동명이 있는지 체크
    const hasEmptyName = workouts.some(w => !w.exercise_name.trim())
    if (hasEmptyName) {
      toast.error('모든 운동명을 입력해주세요')
      return
    }

    const hasEmptyDate = workouts.some(w => !w.workout_date.trim())
    if (hasEmptyDate) {
      toast.error('모든 운동 날짜를 입력해주세요')
      return
    }

    setShowConfirmDialog(true)
  }

  const handleConfirm = () => {
    startTransition(async () => {
      let successCount = 0
      let failCount = 0

      for (const workout of workouts) {
        const formData = new FormData()
        formData.append('exercise_name', workout.exercise_name)
        formData.append('workout_date', workout.workout_date)
        formData.append('body_part', workout.body_part)
        formData.append('weight', workout.weight)
        formData.append('reps', workout.reps)
        formData.append('sets', workout.sets)
        formData.append('duration', workout.duration)

        const result = await createWorkout(formData)

        if (result?.error) {
          console.error('운동 등록 실패:', result.error)
          failCount++
        } else {
          successCount++
        }
      }

      setShowConfirmDialog(false)

      if (successCount > 0) {
        toast.success(`${successCount}개 운동이 등록되었습니다${failCount > 0 ? ` (${failCount}개 실패)` : ''}`)
        router.push('/workouts')
        router.refresh()
      } else {
        toast.error('운동 등록에 실패했습니다')
      }
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 안내 카드 */}
          <Card className="border-2 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Dumbbell className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold mb-1">한 번에 여러 운동 등록</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    지난주 운동이 자동으로 불러와집니다 (횟수 +10% 💪)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadLastWeekWorkouts}
                    disabled={isPending || isLoadingLastWeek}
                    className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900"
                  >
                    {isLoadingLastWeek ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        불러오는 중...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        다시 불러오기
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 로딩 중 표시 */}
          {isLoadingLastWeek && workouts.length === 1 && !workouts[0].exercise_name && (
            <Card className="border-2">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p>지난주 운동을 불러오는 중...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 운동 입력 카드들 */}
          {!isLoadingLastWeek && workouts.map((workout, index) => (
            <Card key={workout.id} className="border-2 relative">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    운동 {index + 1}
                  </CardTitle>
                  {workouts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkout(workout.id)}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`exercise_name_${workout.id}`}>
                      운동명 *
                    </Label>
                    <Input
                      id={`exercise_name_${workout.id}`}
                      placeholder="예: 벤치프레스, 스쿼트"
                      value={workout.exercise_name}
                      onChange={(e) => updateWorkout(workout.id, 'exercise_name', e.target.value)}
                      required
                      disabled={isPending}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`workout_date_${workout.id}`}>
                      운동 날짜 *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        ref={(el) => { dateInputRefs.current[workout.id] = el }}
                        id={`workout_date_${workout.id}`}
                        placeholder="예: 2024-01-15"
                        value={workout.workout_date}
                        onChange={(e) => updateWorkout(workout.id, 'workout_date', e.target.value)}
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
                          const input = dateInputRefs.current[workout.id]
                          if (input) {
                            input.type = 'date'
                            input.showPicker?.()
                            setTimeout(() => {
                              if (input) {
                                input.type = 'text'
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
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`body_part_${workout.id}`}>운동 부위</Label>
                    <Input
                      id={`body_part_${workout.id}`}
                      placeholder="예: 가슴, 등, 하체"
                      value={workout.body_part}
                      onChange={(e) => updateWorkout(workout.id, 'body_part', e.target.value)}
                      disabled={isPending}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`weight_${workout.id}`}>중량</Label>
                    <Input
                      id={`weight_${workout.id}`}
                      placeholder="예: 80kg"
                      value={workout.weight}
                      onChange={(e) => updateWorkout(workout.id, 'weight', e.target.value)}
                      disabled={isPending}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`reps_${workout.id}`}>횟수</Label>
                    <Input
                      id={`reps_${workout.id}`}
                      placeholder="예: 10회"
                      value={workout.reps}
                      onChange={(e) => updateWorkout(workout.id, 'reps', e.target.value)}
                      disabled={isPending}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`sets_${workout.id}`}>세트수</Label>
                    <Input
                      id={`sets_${workout.id}`}
                      placeholder="예: 3세트"
                      value={workout.sets}
                      onChange={(e) => updateWorkout(workout.id, 'sets', e.target.value)}
                      disabled={isPending}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`duration_${workout.id}`}>시간</Label>
                    <Input
                      id={`duration_${workout.id}`}
                      placeholder="예: 45분"
                      value={workout.duration}
                      onChange={(e) => updateWorkout(workout.id, 'duration', e.target.value)}
                      disabled={isPending}
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 운동 추가 버튼 */}
          {!isLoadingLastWeek && workouts.length < 5 && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-2 border-dashed"
              onClick={addWorkout}
              disabled={isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              운동 추가 ({workouts.length}/5)
            </Button>
          )}

          {/* 제출 버튼 */}
          {!isLoadingLastWeek && (
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
                  `${workouts.length}개 운동 등록`
                )}
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* 확인 다이얼로그 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{workouts.length}개 운동을 등록하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              입력한 {workouts.length}개의 운동이 등록됩니다.
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
