"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, SlidersHorizontal, X } from "lucide-react"

export function PropertiesFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    region: searchParams.get('region') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  })

  const handleSearch = () => {
    startTransition(() => {
      const params = new URLSearchParams()

      if (filters.search) params.set('search', filters.search)
      if (filters.region !== 'all') params.set('region', filters.region)
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      if (filters.minArea) params.set('minArea', filters.minArea)
      if (filters.maxArea) params.set('maxArea', filters.maxArea)
      if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy)

      router.push(`/properties?${params.toString()}`)
    })
  }

  const handleReset = () => {
    setFilters({
      search: '',
      region: 'all',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      sortBy: 'newest',
    })
    startTransition(() => {
      router.push('/properties')
    })
  }

  return (
    <div className="space-y-4 mb-6">
      {/* 검색바 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="아파트명 또는 지역 검색..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isPending}>
          검색
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          필터
        </Button>
      </div>

      {/* 필터 옵션 */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>상세 필터</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* 지역 */}
              <div className="space-y-2">
                <Label htmlFor="region">지역</Label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => setFilters({ ...filters, region: value })}
                >
                  <SelectTrigger id="region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="강남구">강남구</SelectItem>
                    <SelectItem value="서초구">서초구</SelectItem>
                    <SelectItem value="송파구">송파구</SelectItem>
                    <SelectItem value="강동구">강동구</SelectItem>
                    <SelectItem value="마포구">마포구</SelectItem>
                    <SelectItem value="용산구">용산구</SelectItem>
                    <SelectItem value="성동구">성동구</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 정렬 */}
              <div className="space-y-2">
                <Label htmlFor="sortBy">정렬</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">최신순</SelectItem>
                    <SelectItem value="price-high">가격 높은순</SelectItem>
                    <SelectItem value="price-low">가격 낮은순</SelectItem>
                    <SelectItem value="area-large">면적 큰순</SelectItem>
                    <SelectItem value="area-small">면적 작은순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 가격 범위 */}
            <div className="space-y-2">
              <Label>가격 범위 (천만원 단위)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="최소"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
                <span className="text-muted-foreground">~</span>
                <Input
                  type="number"
                  placeholder="최대"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
            </div>

            {/* 면적 범위 */}
            <div className="space-y-2">
              <Label>면적 범위 (㎡)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="최소"
                  value={filters.minArea}
                  onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
                />
                <span className="text-muted-foreground">~</span>
                <Input
                  type="number"
                  placeholder="최대"
                  value={filters.maxArea}
                  onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={isPending} className="flex-1">
                필터 적용
              </Button>
              <Button onClick={handleReset} disabled={isPending} variant="outline">
                <X className="h-4 w-4 mr-2" />
                초기화
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
