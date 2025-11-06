import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import { MealForm } from "@/components/meals/MealForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function NewMealPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/meals">
          <ChevronLeft className="h-4 w-4 mr-2" />
          목록으로
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">식사 기록 추가</h1>
        <p className="text-muted-foreground mt-2">
          오늘의 식사를 기록하고 건강한 식습관을 만들어보세요
        </p>
      </div>

      <MealForm />
    </div>
  )
}
