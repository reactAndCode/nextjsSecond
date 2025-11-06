import { getUser } from "@/app/actions/auth"
import { getMeal } from "@/app/actions/meals"
import { redirect, notFound } from "next/navigation"
import { EditMealForm } from "@/components/meals/EditMealForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function EditMealPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: meal, error } = await getMeal(id)

  if (error || !meal) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/meals/${id}`}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          상세보기로
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">식사 기록 수정</h1>
        <p className="text-muted-foreground mt-2">
          식사 정보를 수정하세요
        </p>
      </div>

      <EditMealForm meal={meal} />
    </div>
  )
}
