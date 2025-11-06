import { redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { PropertyForm } from "@/components/properties/PropertyForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewPropertyPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/properties">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로 돌아가기
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">부동산 등록</h1>
        <p className="text-muted-foreground mt-2">
          관심 있는 부동산 정보를 등록하세요
        </p>
      </div>

      <PropertyForm />
    </div>
  )
}
