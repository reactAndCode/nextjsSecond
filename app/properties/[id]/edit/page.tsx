import { notFound, redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"
import { getProperty } from "@/app/actions/properties"
import { Button } from "@/components/ui/button"
import { PropertyEditForm } from "@/components/properties/PropertyEditForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: property, error } = await getProperty(id)

  if (error || !property) {
    notFound()
  }

  // 본인 것만 수정 가능
  if (property.user_id !== user.id) {
    redirect(`/properties/${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/properties/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            상세보기로 돌아가기
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">부동산 수정</h1>
        <p className="text-muted-foreground mt-2">
          {property.name}의 정보를 수정합니다
        </p>
      </div>

      <PropertyEditForm property={property} />
    </div>
  )
}
