import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import { MultiWorkoutForm } from "@/components/workouts/MultiWorkoutForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function NewBatchWorkoutPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">여러 운동 한번에 등록</h1>
        <p className="text-muted-foreground mt-2">
          1개에서 5개까지 운동을 한 번에 등록할 수 있습니다
        </p>
      </div>

      <MultiWorkoutForm />
    </div>
  )
}
