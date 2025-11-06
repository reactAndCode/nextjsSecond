import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PropertyDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Skeleton className="h-10 w-32 mb-4" />
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-9 w-96 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 이미지 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="aspect-video w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>

        {/* 가격 정보 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-9 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 가격 추이 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
