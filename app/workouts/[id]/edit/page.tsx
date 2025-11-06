import { getUser } from "@/app/actions/auth"
import { getWorkout } from "@/app/actions/workouts"
import { redirect, notFound } from "next/navigation"
import { EditWorkoutForm } from "@/components/workouts/EditWorkoutForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function EditWorkoutPage({
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
        <Link href={`/workouts/${id}`}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          상세보기로
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">운동 기록 수정</h1>
        <p className="text-muted-foreground mt-2">
          운동 정보를 수정하세요
        </p>
      </div>

      <EditWorkoutForm workout={workout} />
    </div>
  )
}
