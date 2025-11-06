import { notFound, redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"
import { getProperty } from "@/app/actions/properties"
import { getPriceHistory } from "@/app/actions/price-history"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeletePropertyButton } from "@/components/properties/DeletePropertyButton"
import { PriceChart } from "@/components/properties/PriceChart"
import { PriceHistoryManager } from "@/components/properties/PriceHistoryManager"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, MapPin, Ruler, TrendingUp, Home, User, Phone, Calendar } from "lucide-react"

type Props = {
  params: Promise<{ id: string }>
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: property, error } = await getProperty(id)

  if (error || !property) {
    notFound()
  }

  const isOwner = property.user_id === user.id

  // 가격 히스토리 가져오기
  const { data: priceHistory } = await getPriceHistory(id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/properties">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로 돌아가기
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
            <p className="text-muted-foreground mt-2 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {property.region}
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/properties/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  수정
                </Link>
              </Button>
              <DeletePropertyButton propertyId={id} propertyName={property.name} />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* 이미지 */}
        {(property.photo_url_1 || property.photo_url_2) && (
          <Card>
            <CardHeader>
              <CardTitle>사진</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {property.photo_url_1 && (
                  <div className="relative aspect-video overflow-hidden rounded-lg border">
                    <Image
                      src={property.photo_url_1}
                      alt={`${property.name} 사진 1`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {property.photo_url_2 && (
                  <div className="relative aspect-video overflow-hidden rounded-lg border">
                    <Image
                      src={property.photo_url_2}
                      alt={`${property.name} 사진 2`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 가격 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              가격 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">매매가격</p>
                <p className="text-3xl font-bold">{(property.sale_price / 100000000).toFixed(1)}억원</p>
              </div>
              {property.recent_transaction_price && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">최근 실거래가</p>
                  <p className="text-2xl font-semibold">{(property.recent_transaction_price / 100000000).toFixed(1)}억원</p>
                </div>
              )}
            </div>
            {property.management_fee && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">관리비</p>
                <p className="text-lg font-medium">{property.management_fee.toLocaleString()}원</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="h-5 w-5 mr-2" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Ruler className="h-4 w-4 mr-2" />
                    면적
                  </span>
                  <span className="font-medium">{property.area}㎡ ({property.pyeong}평)</span>
                </div>
                {property.floor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">층수</span>
                    <span className="font-medium">{property.floor}층</span>
                  </div>
                )}
                {property.total_households && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">총 세대수</span>
                    <span className="font-medium">{property.total_households}세대</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {property.rooms && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">방 수</span>
                    <span className="font-medium">{property.rooms}개</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">욕실 수</span>
                    <span className="font-medium">{property.bathrooms}개</span>
                  </div>
                )}
                {property.direction && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">방향</span>
                    <span className="font-medium">{property.direction}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  등록일자
                </span>
                <span className="font-medium">{new Date(property.registered_date).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 설명 */}
        {property.description && (
          <Card>
            <CardHeader>
              <CardTitle>매물 설명</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{property.description}</p>
            </CardContent>
          </Card>
        )}

        {/* 중개사 정보 */}
        {(property.agent_name || property.agent_contact) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                중개사 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {property.agent_name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">중개사명</span>
                  <span className="font-medium">{property.agent_name}</span>
                </div>
              )}
              {property.agent_contact && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    연락처
                  </span>
                  <span className="font-medium">{property.agent_contact}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 가격 추이 그래프 */}
        <Card>
          <CardHeader>
            <CardTitle>가격 추이</CardTitle>
            <CardDescription>일자별 가격 변동 추이</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceChart priceHistory={priceHistory || []} />
          </CardContent>
        </Card>

        {/* 가격 히스토리 관리 */}
        <PriceHistoryManager
          propertyId={id}
          priceHistory={priceHistory || []}
          isOwner={isOwner}
        />
      </div>
    </div>
  )
}
