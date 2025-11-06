import { getUser } from "@/app/actions/auth"
import { getWorkout, deleteWorkout } from "@/app/actions/workouts"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ChevronLeft, Calendar, Weight, Hash, Layers, Pencil, Trash2, Dumbbell, Clock, Zap, Heart, Target, MapPin } from "lucide-react"
import Image from "next/image"
import { DeleteWorkoutButton } from "@/components/workouts/DeleteWorkoutButton"

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: workout, error } = await getWorkout(id)

  if (error || !workout) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/workouts">
          <ChevronLeft className="h-4 w-4 mr-2" />
          목록으로
        </Link>
      </Button>

      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {workout.exercise_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{workout.exercise_name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(workout.workout_date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/workouts/${workout.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                수정
              </Link>
            </Button>
            <DeleteWorkoutButton workoutId={workout.id} />
          </div>
        </div>

        {/* 운동 부위 */}
        {workout.body_part && (
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">운동 부위</p>
                  <p className="text-lg font-semibold">{workout.body_part}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 운동 정보 카드 */}
        {(workout.weight || workout.reps || workout.sets || workout.duration) && (
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                운동 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {workout.weight && (
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border-2">
                    <Weight className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground mb-1">중량</span>
                    <span className="text-2xl font-bold">{workout.weight}</span>
                  </div>
                )}
                {workout.reps && (
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border-2">
                    <Hash className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground mb-1">횟수</span>
                    <span className="text-2xl font-bold">{workout.reps}</span>
                  </div>
                )}
                {workout.sets && (
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border-2">
                    <Layers className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground mb-1">세트수</span>
                    <span className="text-2xl font-bold">{workout.sets}</span>
                  </div>
                )}
                {workout.duration && (
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border-2">
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground mb-1">시간</span>
                    <span className="text-2xl font-bold">{workout.duration}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 강도 및 컨디션 */}
        {(workout.intensity || workout.condition) && (
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle>운동 상태</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workout.intensity && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">운동 강도</p>
                      <p className="text-lg font-semibold">{workout.intensity}</p>
                    </div>
                  </div>
                )}
                {workout.condition && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Heart className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">오늘 컨디션</p>
                      <p className="text-lg font-semibold">{workout.condition}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 다음 목표 */}
        {workout.next_goal && (
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                다음 목표
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg">{workout.next_goal}</p>
            </CardContent>
          </Card>
        )}

        {/* 상세 내역 */}
        {workout.notes && (
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle>상세 내역</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-4 rounded-lg">
                {workout.notes}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 사진 */}
        {(workout.photo_url_1 || workout.photo_url_2) && (
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle>운동 사진</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workout.photo_url_1 && (
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-muted shadow-lg">
                    <Image
                      src={workout.photo_url_1}
                      alt="운동 사진 1"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {workout.photo_url_2 && (
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-muted shadow-lg">
                    <Image
                      src={workout.photo_url_2}
                      alt="운동 사진 2"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 메타 정보 */}
        <Card className="border-2 bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>등록일: {new Date(workout.created_at).toLocaleString('ko-KR')}</p>
              {workout.updated_at !== workout.created_at && (
                <p>수정일: {new Date(workout.updated_at).toLocaleString('ko-KR')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
