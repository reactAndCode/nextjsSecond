import { getUser } from "@/app/actions/auth"
import { getWorkouts } from "@/app/actions/workouts"
import { redirect } from "next/navigation"
import { WorkoutsList } from "@/components/workouts/WorkoutsList"

export default async function WorkoutsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: workouts, error } = await getWorkouts()

  return <WorkoutsList workouts={workouts || []} error={error || null} />
}
