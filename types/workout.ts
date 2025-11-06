export type Workout = {
  id: string
  user_id: string
  exercise_name: string
  workout_date: string
  body_part: string | null
  weight: string | null
  reps: string | null
  sets: string | null
  duration: string | null
  intensity: string | null
  condition: string | null
  next_goal: string | null
  notes: string | null
  photo_url_1: string | null
  photo_url_2: string | null
  created_at: string
  updated_at: string
}
