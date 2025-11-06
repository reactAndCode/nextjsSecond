import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import { WorkoutForm } from "@/components/workouts/WorkoutForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function NewWorkoutPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/workouts">
          <ChevronLeft className="h-4 w-4 mr-2" />
          목록으로
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">운동 기록 추가</h1>
        <p className="text-muted-foreground mt-2">
          오늘의 운동을 기록하세요
        </p>
      </div>

      <WorkoutForm />
    </div>
  )
}
