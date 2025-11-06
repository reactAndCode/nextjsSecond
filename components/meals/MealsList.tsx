"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Utensils, Plus, Calendar, ChevronLeft, ChevronRight, Flame, Sandwich, Apple, Droplet } from "lucide-react"
import Image from "next/image"
import { Meal } from "@/types/meal"

type MealsListProps = {
  meals: Meal[]
  error: string | null
}

export function MealsList({ meals, error }: MealsListProps) {
  const router = useRouter()
  const [currentDateIndex, setCurrentDateIndex] = useState(0)

  // 날짜별로 그룹화 (최신순)
  const groupedMeals = useMemo(() => {
    const grouped = meals.reduce((acc, meal) => {
      // meal_datetime에서 날짜 부분만 추출 (YYYY-MM-DD 형식 가정)
      const date = meal.meal_datetime.split(' ')[0] || meal.meal_datetime
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(meal)
      return acc
    }, {} as Record<string, Meal[]>)

    // 날짜를 최신순으로 정렬
    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  }, [meals])

  // 현재 선택된 날짜의 식사들
  const currentDateMeals = groupedMeals[currentDateIndex]

  // 식사 구분별로 그룹화
  const mealsByType = useMemo(() => {
    if (!currentDateMeals) return {}

    const [, dayMeals] = currentDateMeals
    return dayMeals.reduce((acc, meal) => {
      const type = meal.meal_type || '기타'
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(meal)
      return acc
    }, {} as Record<string, Meal[]>)
  }, [currentDateMeals])

  // 하루 총 영양소 계산
  const dailyTotals = useMemo(() => {
    if (!currentDateMeals) return { calories: 0, carbs: 0, protein: 0, fat: 0, water: 0 }

    const [, dayMeals] = currentDateMeals
    return dayMeals.reduce((acc, meal) => {
      acc.calories += parseInt(meal.total_calories?.replace(/[^0-9]/g, '') || '0')
      acc.carbs += parseInt(meal.carbs?.replace(/[^0-9]/g, '') || '0')
      acc.protein += parseInt(meal.protein?.replace(/[^0-9]/g, '') || '0')
      acc.fat += parseInt(meal.fat?.replace(/[^0-9]/g, '') || '0')
      acc.water += parseInt(meal.water_intake?.replace(/[^0-9]/g, '') || '0')
      return acc
    }, { calories: 0, carbs: 0, protein: 0, fat: 0, water: 0 })
  }, [currentDateMeals])

  // 날짜 네비게이션
  const goToPreviousDate = () => {
    if (currentDateIndex < groupedMeals.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1)
    }
  }

  const goToNextDate = () => {
    if (currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1)
    }
  }

  // 식사 구분 아이콘
  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case '아침': return '🌅'
      case '점심': return '☀️'
      case '저녁': return '🌙'
      case '간식': return '🍪'
      default: return '🍽️'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 - 달력 이미지와 타이틀 */}
      <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl">
        {/* 배경 이미지 */}
        <div className="absolute inset-0">
          <Image
            src="/식단관리.png"
            alt="식사 관리 배경"
            fill
            className="object-cover"
            priority
          />
          {/* 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
        </div>

        {/* 컨텐츠 */}
        <div className="relative px-8 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Utensils className="h-10 w-10" />
                식사 관리
              </h1>
              <p className="text-white/90 text-lg">
                건강한 식습관으로 더 나은 내일을 만들어가세요
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="shadow-xl w-full sm:w-auto">
              <Link href="/meals/new">
                <Plus className="h-5 w-5 mr-2" />
                식사 기록 추가
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          오류: {error}
        </div>
      )}

      {!meals || meals.length === 0 ? (
        /* 빈 상태 */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/5 p-8 mb-6">
            <Utensils className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">아직 식사 기록이 없습니다</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            오늘의 식사를 기록하고 건강한 식습관을 만들어보세요
          </p>
          <Button asChild size="lg">
            <Link href="/meals/new">
              <Plus className="h-5 w-5 mr-2" />
              첫 식사 기록하기
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 날짜 네비게이션 및 일일 요약 */}
          {currentDateMeals && (
            <>
              {/* 날짜 네비게이션 */}
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousDate}
                      disabled={currentDateIndex >= groupedMeals.length - 1}
                      className="w-full sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      이전 날짜
                    </Button>

                    <div className="flex items-center gap-2 font-semibold text-xl">
                      <Calendar className="h-6 w-6 text-green-600" />
                      <span className="text-center sm:text-left">
                        {new Date(currentDateMeals[0]).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextDate}
                      disabled={currentDateIndex <= 0}
                      className="w-full sm:w-auto"
                    >
                      다음 날짜
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 일일 영양소 요약 */}
              <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    오늘의 영양 섭취
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex flex-col items-center p-4 bg-white dark:bg-background rounded-lg border-2">
                      <Flame className="h-6 w-6 text-orange-500 mb-2" />
                      <span className="text-xs text-muted-foreground mb-1">칼로리</span>
                      <span className="text-2xl font-bold text-orange-600">{dailyTotals.calories}</span>
                      <span className="text-xs text-muted-foreground">kcal</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white dark:bg-background rounded-lg border-2">
                      <Sandwich className="h-6 w-6 text-yellow-600 mb-2" />
                      <span className="text-xs text-muted-foreground mb-1">탄수화물</span>
                      <span className="text-2xl font-bold text-yellow-600">{dailyTotals.carbs}</span>
                      <span className="text-xs text-muted-foreground">g</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white dark:bg-background rounded-lg border-2">
                      <Apple className="h-6 w-6 text-red-500 mb-2" />
                      <span className="text-xs text-muted-foreground mb-1">단백질</span>
                      <span className="text-2xl font-bold text-red-600">{dailyTotals.protein}</span>
                      <span className="text-xs text-muted-foreground">g</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white dark:bg-background rounded-lg border-2">
                      <div className="h-6 w-6 mb-2 text-2xl">🥑</div>
                      <span className="text-xs text-muted-foreground mb-1">지방</span>
                      <span className="text-2xl font-bold text-green-600">{dailyTotals.fat}</span>
                      <span className="text-xs text-muted-foreground">g</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white dark:bg-background rounded-lg border-2">
                      <Droplet className="h-6 w-6 text-blue-500 mb-2" />
                      <span className="text-xs text-muted-foreground mb-1">물</span>
                      <span className="text-2xl font-bold text-blue-600">{dailyTotals.water}</span>
                      <span className="text-xs text-muted-foreground">ml</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 식사 구분별 목록 */}
              {['아침', '점심', '저녁', '간식', '기타'].map((type) => {
                const typeMeals = mealsByType[type]
                if (!typeMeals || typeMeals.length === 0) return null

                return (
                  <Card key={type} className="border-2">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{getMealTypeIcon(type)}</span>
                        {type}
                        <span className="text-sm font-normal text-muted-foreground ml-auto">
                          {typeMeals.length}개 식사
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {typeMeals.map((meal) => (
                          <Card
                            key={meal.id}
                            className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-green-500/50 cursor-pointer"
                            onClick={() => router.push(`/meals/${meal.id}`)}
                          >
                            <CardContent className="pt-6 space-y-3">
                              <h3 className="font-bold text-lg line-clamp-1">{meal.food_name}</h3>

                              {meal.total_calories && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Flame className="h-4 w-4 text-orange-500" />
                                  <span className="font-semibold text-orange-600">{meal.total_calories}</span>
                                </div>
                              )}

                              <div className="grid grid-cols-3 gap-2 text-xs">
                                {meal.carbs && (
                                  <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                                    <p className="text-muted-foreground">탄</p>
                                    <p className="font-semibold">{meal.carbs}</p>
                                  </div>
                                )}
                                {meal.protein && (
                                  <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                                    <p className="text-muted-foreground">단</p>
                                    <p className="font-semibold">{meal.protein}</p>
                                  </div>
                                )}
                                {meal.fat && (
                                  <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                                    <p className="text-muted-foreground">지</p>
                                    <p className="font-semibold">{meal.fat}</p>
                                  </div>
                                )}
                              </div>

                              {(meal.photo_url_1 || meal.photo_url_2) && (
                                <div className="flex gap-2">
                                  {meal.photo_url_1 && (
                                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2">
                                      <Image
                                        src={meal.photo_url_1}
                                        alt="식사 사진 1"
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  {meal.photo_url_2 && (
                                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2">
                                      <Image
                                        src={meal.photo_url_2}
                                        alt="식사 사진 2"
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
