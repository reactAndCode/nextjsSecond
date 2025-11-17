"use client"

import { useState, useMemo, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dumbbell, Plus, Calendar, Weight, Hash, Layers, Clock, MapPin, LayoutGrid, List, ChevronLeft, ChevronRight, X, Save } from "lucide-react"
import Image from "next/image"
import { Workout } from "@/types/workout"
import { createWorkoutsBatch, getLastWeekWorkouts } from "@/app/actions/workouts"
import { toast } from "sonner"

type WorkoutsListProps = {
  workouts: Workout[]
  error: string | null
}

export function WorkoutsList({ workouts, error }: WorkoutsListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentDateIndex, setCurrentDateIndex] = useState(0)
  const [showQuickInput, setShowQuickInput] = useState(false)

  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0]

  // 빠른 입력 날짜 상태
  const [quickInputDate, setQuickInputDate] = useState(today)

  // 5개 운동 입력 상태
  const [quickWorkouts, setQuickWorkouts] = useState([
    { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
    { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
    { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
    { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
    { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
  ])

  // 5개입력 버튼 클릭 시 지난주 운동 불러오기
  useEffect(() => {
    if (showQuickInput) {
      loadLastWeekWorkouts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQuickInput])

  const loadLastWeekWorkouts = async () => {
    const result = await getLastWeekWorkouts()

    if (result.error || !result.data || result.data.length === 0) {
      return
    }

    // 지난주 운동으로 채우기 (최대 5개)
    const newQuickWorkouts = [...quickWorkouts]
    result.data.forEach((workout, index) => {
      if (index < 5) {
        newQuickWorkouts[index] = {
          exercise_name: workout.exercise_name,
          weight: workout.weight,
          reps: workout.reps,
          sets: workout.sets,
          body_part: workout.body_part,
        }
      }
    })

    setQuickWorkouts(newQuickWorkouts)
    toast.success(`지난주 운동 ${result.data.length}개를 불러왔습니다 (횟수 +10% 💪)`)
  }

  // 입력값 변경 핸들러
  const handleQuickInputChange = (index: number, field: string, value: string) => {
    const newWorkouts = [...quickWorkouts]
    newWorkouts[index] = { ...newWorkouts[index], [field]: value }
    setQuickWorkouts(newWorkouts)
  }

  // 빠른 입력 저장
  const handleQuickSave = () => {
    startTransition(async () => {
      const workoutsToSave = quickWorkouts.map(w => ({
        ...w,
        workout_date: quickInputDate
      }))

      const result = await createWorkoutsBatch(workoutsToSave)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${result.count}개의 운동이 저장되었습니다!`)
        // 초기화
        setQuickWorkouts([
          { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
          { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
          { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
          { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
          { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
        ])
        setQuickInputDate(today)
        setShowQuickInput(false)
        router.refresh()
      }
    })
  }

  // 빠른 입력 취소
  const handleQuickCancel = () => {
    setQuickWorkouts([
      { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
      { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
      { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
      { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
      { exercise_name: '', weight: '', reps: '', sets: '', body_part: '' },
    ])
    setQuickInputDate(today)
    setShowQuickInput(false)
  }

  // 날짜별로 그룹화 (최신순)
  const groupedWorkouts = useMemo(() => {
    const grouped = workouts.reduce((acc, workout) => {
      const date = workout.workout_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(workout)
      return acc
    }, {} as Record<string, Workout[]>)

    // 날짜를 최신순으로 정렬
    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  }, [workouts])

  // 현재 선택된 날짜의 운동들
  const currentDateWorkouts = groupedWorkouts[currentDateIndex]

  // 날짜 네비게이션
  const goToPreviousDate = () => {
    if (currentDateIndex < groupedWorkouts.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1)
    }
  }

  const goToNextDate = () => {
    if (currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            나의 운동 내역
          </h1>
          <p className="text-muted-foreground mt-2">
            오늘의 운동을 기록하고 관리하세요
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowQuickInput(!showQuickInput)}
            size="lg"
            variant={showQuickInput ? "secondary" : "outline"}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-5 w-5 mr-2" />
            5개입력
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1 sm:flex-none">
            <Link href="/workouts/new-batch">
              <Plus className="h-5 w-5 mr-2" />
              여러개
            </Link>
          </Button>
          <Button asChild size="lg" className="shadow-lg flex-1 sm:flex-none">
            <Link href="/workouts/new">
              <Plus className="h-5 w-5 mr-2" />
              한개
            </Link>
          </Button>
        </div>
      </div>

      {/* 빠른 입력 폼 */}
      {showQuickInput && (
        <Card className="mb-4 border border-primary/50 shadow-lg">
          <CardHeader className="pb-2 pt-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                빠른 입력
              </CardTitle>
              <div className="flex items-center gap-2 flex-1">
                <label className="text-sm font-medium whitespace-nowrap">운동 날짜:</label>
                <Input
                  type="date"
                  value={quickInputDate}
                  onChange={(e) => setQuickInputDate(e.target.value)}
                  disabled={isPending}
                  className="max-w-[200px]"
                />
                <span className="text-sm text-muted-foreground">
                  ({new Date(quickInputDate).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  })})
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">운동명</TableHead>
                    <TableHead className="w-[100px]">중량</TableHead>
                    <TableHead className="w-[80px]">횟수</TableHead>
                    <TableHead className="w-[80px]">세트</TableHead>
                    <TableHead className="w-[120px]">부위</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quickWorkouts.map((workout, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={workout.exercise_name}
                          onChange={(e) => handleQuickInputChange(index, 'exercise_name', e.target.value)}
                          placeholder="예: 벤치프레스"
                          disabled={isPending}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={workout.weight}
                          onChange={(e) => handleQuickInputChange(index, 'weight', e.target.value)}
                          placeholder="예: 80kg"
                          disabled={isPending}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={workout.reps}
                          onChange={(e) => handleQuickInputChange(index, 'reps', e.target.value)}
                          placeholder="예: 10"
                          disabled={isPending}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={workout.sets}
                          onChange={(e) => handleQuickInputChange(index, 'sets', e.target.value)}
                          placeholder="예: 3"
                          disabled={isPending}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={workout.body_part}
                          onChange={(e) => handleQuickInputChange(index, 'body_part', e.target.value)}
                          placeholder="예: 가슴"
                          disabled={isPending}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                variant="outline"
                onClick={handleQuickCancel}
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button
                onClick={handleQuickSave}
                disabled={isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isPending ? '저장 중...' : '저장'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
          오류: {error}
        </div>
      )}

      {!workouts || workouts.length === 0 ? (
        /* 빈 상태 */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-8 mb-6">
            <Dumbbell className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">아직 운동 기록이 없습니다</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            오늘의 운동을 기록하여 꾸준한 운동 습관을 만들어보세요
          </p>
          <div className="flex gap-2">
            <Button asChild size="lg" variant="outline">
              <Link href="/workouts/new-batch">
                <Plus className="h-5 w-5 mr-2" />
                여러개
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/workouts/new">
                <Plus className="h-5 w-5 mr-2" />
                첫 운동 기록하기
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        /* 탭 컨텐츠 */
        <Tabs defaultValue="list" className="space-y-3">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              리스트형 표시
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              카드형 표시
            </TabsTrigger>
          </TabsList>

          {/* 리스트형 표시 */}
          <TabsContent value="list" className="space-y-2">
            {currentDateWorkouts && (
              <>
                {/* 날짜 네비게이션 */}
                <Card className="border">
                  <CardContent className="py-2">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousDate}
                        disabled={currentDateIndex >= groupedWorkouts.length - 1}
                        className="w-full sm:w-auto"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        이전 날짜
                      </Button>

                      <div className="flex items-center gap-2 font-semibold text-base">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-center sm:text-left">
                          {new Date(currentDateWorkouts[0]).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          ({currentDateWorkouts[1].length}개)
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextDate}
                        disabled={currentDateIndex <= 0}
                        className="w-full sm:w-auto"
                      >
                        다음 날짜
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 테이블 */}
                <Card className="border overflow-hidden">
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">운동명</TableHead>
                          <TableHead className="min-w-[100px]">중량</TableHead>
                          <TableHead className="min-w-[80px]">횟수</TableHead>
                          <TableHead className="min-w-[80px]">세트</TableHead>
                          <TableHead className="min-w-[120px]">운동 부위</TableHead>
                          <TableHead className="text-right min-w-[80px]">상세</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentDateWorkouts[1].map((workout) => (
                          <TableRow
                            key={workout.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => router.push(`/workouts/${workout.id}`)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                  {workout.exercise_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="line-clamp-1">{workout.exercise_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{workout.weight || '-'}</TableCell>
                            <TableCell>{workout.reps || '-'}</TableCell>
                            <TableCell>{workout.sets || '-'}</TableCell>
                            <TableCell>
                              {workout.body_part ? (
                                <span className="inline-flex items-center gap-1 text-sm bg-primary/10 px-2 py-1 rounded whitespace-nowrap">
                                  <MapPin className="h-3 w-3" />
                                  {workout.body_part}
                                </span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/workouts/${workout.id}`)
                                }}
                              >
                                보기
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* 카드형 표시 */}
          <TabsContent value="cards" className="space-y-4">
            {groupedWorkouts.map(([date, dayWorkouts]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <Calendar className="h-4 w-4 text-primary" />
                  {new Date(date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    ({dayWorkouts.length}개)
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {dayWorkouts.map((workout) => (
                    <Card
                      key={workout.id}
                      className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border hover:border-primary/50"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm">
                            {workout.exercise_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="line-clamp-1">{workout.exercise_name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* 운동 부위 */}
                        {workout.body_part && (
                          <div className="flex items-center gap-2 text-sm bg-primary/5 p-2 rounded-lg">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-medium">{workout.body_part}</span>
                          </div>
                        )}

                        {/* 운동 정보 */}
                        <div className="grid grid-cols-2 gap-2">
                          {workout.weight && (
                            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                              <Weight className="h-4 w-4 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">중량</span>
                              <span className="font-semibold text-sm">{workout.weight}</span>
                            </div>
                          )}
                          {workout.reps && (
                            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                              <Hash className="h-4 w-4 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">횟수</span>
                              <span className="font-semibold text-sm">{workout.reps}</span>
                            </div>
                          )}
                          {workout.sets && (
                            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                              <Layers className="h-4 w-4 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">세트</span>
                              <span className="font-semibold text-sm">{workout.sets}</span>
                            </div>
                          )}
                        </div>

                        {/* 상세내역 미리보기 */}
                        {workout.notes && (
                          <div className="text-sm text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded">
                            {workout.notes}
                          </div>
                        )}

                        {/* 사진 미리보기 */}
                        {(workout.photo_url_1 || workout.photo_url_2) && (
                          <div className="flex gap-2">
                            {workout.photo_url_1 && (
                              <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-muted">
                                <Image
                                  src={workout.photo_url_1}
                                  alt="운동 사진 1"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            {workout.photo_url_2 && (
                              <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-muted">
                                <Image
                                  src={workout.photo_url_2}
                                  alt="운동 사진 2"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <Button asChild className="w-full" variant="outline">
                          <Link href={`/workouts/${workout.id}`}>
                            상세보기
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
