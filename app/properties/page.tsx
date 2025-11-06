import { getUser } from "@/app/actions/auth"
import { getProperties } from "@/app/actions/properties"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PropertiesFilter } from "@/components/properties/PropertiesFilter"
import { PropertiesList } from "@/components/properties/PropertiesList"
import Link from "next/link"
import { Building2, Plus } from "lucide-react"

type Props = {
  searchParams: Promise<{
    search?: string
    region?: string
    minPrice?: string
    maxPrice?: string
    minArea?: string
    maxArea?: string
    sortBy?: 'newest' | 'price-high' | 'price-low' | 'area-large' | 'area-small'
  }>
}

export default async function PropertiesPage({ searchParams }: Props) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const params = await searchParams

  const filters = {
    search: params.search,
    region: params.region,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    minArea: params.minArea ? parseFloat(params.minArea) : undefined,
    maxArea: params.maxArea ? parseFloat(params.maxArea) : undefined,
    sortBy: params.sortBy,
  }

  const { data: properties, error } = await getProperties(filters)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">부동산 목록</h1>
          <p className="text-muted-foreground mt-2">
            등록한 부동산을 관리하고 가격 추이를 확인하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="h-4 w-4 mr-2" />
            부동산 등록
          </Link>
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <PropertiesFilter />

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          오류: {error}
        </div>
      )}

      {!properties || properties.length === 0 ? (
        /* 빈 상태 */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">등록된 부동산이 없습니다</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            관심 있는 부동산을 등록하여 가격 추이를 추적하고 관리해보세요
          </p>
          <Button asChild size="lg">
            <Link href="/properties/new">
              <Plus className="h-4 w-4 mr-2" />
              첫 부동산 등록하기
            </Link>
          </Button>
        </div>
      ) : (
        /* 부동산 목록 with 페이지네이션 */
        <PropertiesList properties={properties} />
      )}
    </div>
  )
}
