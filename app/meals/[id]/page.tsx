import { getUser } from "@/app/actions/auth"
import { getMeal } from "@/app/actions/meals"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ChevronLeft, Clock, Pencil, Utensils, Flame, Sandwich, Apple, Droplet } from "lucide-react"
import Image from "next/image"
import { DeleteMealButton } from "@/components/meals/DeleteMealButton"

export default async function MealDetailPage({
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

  const getMealTypeEmoji = (type: string | null) => {
    switch (type) {
      case '아침': return '🌅'
      case '점심': return '☀️'
      case '저녁': return '🌙'
      case '간식': return '🍪'
      default: return '🍽️'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/meals">
          <ChevronLeft className="h-4 w-4 mr-2" />
          목록으로
        </Link>
      </Button>

      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {getMealTypeEmoji(meal.meal_type)}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{meal.food_name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{meal.meal_datetime}</span>
                </div>
                {meal.meal_type && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                    {meal.meal_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/meals/${meal.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                수정
              </Link>
            </Button>
            <DeleteMealButton mealId={meal.id} />
          </div>
        </div>

        {/* 영양 정보 카드 */}
        {(meal.total_calories || meal.carbs || meal.protein || meal.fat || meal.water_intake) && (
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                영양 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {meal.total_calories && (
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-950/20 rounded-lg border-2">
                    <Flame className="h-8 w-8 text-orange-500 mb-2" />
                    <span className="text-sm text-muted-foreground mb-1">칼로리</span>
                    <span className="text-2xl font-bold text-orange-600">{meal.total_calories}</span>
                  </div>
                )}
                {meal.carbs && (
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-950/20 rounded-lg border-2">
                    <Sandwich className="h-8 w-8 text-yellow-600 mb-2" />
                    <span className="text-sm text-muted-foreground mb-1">탄수화물</span>
                    <span className="text-2xl font-bold text-yellow-600">{meal.carbs}</span>
                  </div>
                )}
                {meal.protein && (
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20 rounded-lg border-2">
                    <Apple className="h-8 w-8 text-red-500 mb-2" />
                    <span className="text-sm text-muted-foreground mb-1">단백질</span>
                    <span className="text-2xl font-bold text-red-600">{meal.protein}</span>
                  </div>
                )}
                {meal.fat && (
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20 rounded-lg border-2">
                    <div className="text-3xl mb-2">🥑</div>
                    <span className="text-sm text-muted-foreground mb-1">지방</span>
                    <span className="text-2xl font-bold text-green-600">{meal.fat}</span>
                  </div>
                )}
                {meal.water_intake && (
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 rounded-lg border-2">
                    <Droplet className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm text-muted-foreground mb-1">물</span>
                    <span className="text-2xl font-bold text-blue-600">{meal.water_intake}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 섭취량 */}
        {meal.serving_size && (
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle>섭취량</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg">{meal.serving_size}</p>
            </CardContent>
          </Card>
        )}

        {/* 메모 */}
        {meal.notes && (
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle>메모</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                {meal.notes}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 사진 */}
        {(meal.photo_url_1 || meal.photo_url_2) && (
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle>식사 사진</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meal.photo_url_1 && (
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-muted shadow-lg">
                    <Image
                      src={meal.photo_url_1}
                      alt="식사 사진 1"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {meal.photo_url_2 && (
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-muted shadow-lg">
                    <Image
                      src={meal.photo_url_2}
                      alt="식사 사진 2"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 메타 정보 */}
        <Card className="border-2 bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>등록일: {new Date(meal.created_at).toLocaleString('ko-KR')}</p>
              {meal.updated_at !== meal.created_at && (
                <p>수정일: {new Date(meal.updated_at).toLocaleString('ko-KR')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
