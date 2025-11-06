export type Meal = {
  id: string
  user_id: string
  meal_datetime: string
  meal_type: string | null
  food_name: string
  total_calories: string | null
  carbs: string | null
  protein: string | null
  fat: string | null
  serving_size: string | null
  water_intake: string | null
  notes: string | null
  photo_url_1: string | null
  photo_url_2: string | null
  created_at: string
  updated_at: string
}
