import { getUser } from "@/app/actions/auth"
import { getMeals } from "@/app/actions/meals"
import { redirect } from "next/navigation"
import { MealsList } from "@/components/meals/MealsList"

export default async function MealsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: meals, error } = await getMeals()

  return <MealsList meals={meals || []} error={error || null} />
}
