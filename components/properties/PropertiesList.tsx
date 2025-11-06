"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PropertiesPagination } from "@/components/properties/PropertiesPagination"
import Link from "next/link"
import { MapPin, Ruler, TrendingUp } from "lucide-react"
import type { Property } from "@/types/property"

type PropertiesListProps = {
  properties: Property[]
}

const ITEMS_PER_PAGE = 9

export function PropertiesList({ properties }: PropertiesListProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProperties = properties.slice(startIndex, endIndex)

  return (
    <>
      {/* 검색 결과 개수 */}
      <div className="mb-4 text-sm text-muted-foreground">
        총 {properties.length}개의 부동산이 검색되었습니다.
        {totalPages > 1 && ` (${currentPage} / ${totalPages} 페이지)`}
      </div>

      {/* 부동산 목록 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="line-clamp-1">{property.name}</CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {property.region}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <Ruler className="h-4 w-4 mr-1" />
                  면적
                </span>
                <span className="font-medium">{property.area}㎡ ({property.pyeong}평)</span>
              </div>
              {property.floor && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">층수</span>
                  <span className="font-medium">{property.floor}층</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  매매가격
                </span>
                <span className="font-bold text-lg">
                  {(property.sale_price / 100000000).toFixed(1)}억
                </span>
              </div>
              {property.recent_transaction_price && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">최근 실거래가</span>
                  <span className="font-medium">
                    {(property.recent_transaction_price / 100000000).toFixed(1)}억
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/properties/${property.id}`}>
                  상세보기
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 페이지네이션 */}
      <PropertiesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  )
}
