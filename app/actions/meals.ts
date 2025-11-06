'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createMeal(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  const mealData = {
    user_id: user.id,
    meal_datetime: formData.get('meal_datetime') as string,
    meal_type: (formData.get('meal_type') as string) || null,
    food_name: formData.get('food_name') as string,
    total_calories: (formData.get('total_calories') as string) || null,
    carbs: (formData.get('carbs') as string) || null,
    protein: (formData.get('protein') as string) || null,
    fat: (formData.get('fat') as string) || null,
    serving_size: (formData.get('serving_size') as string) || null,
    water_intake: (formData.get('water_intake') as string) || null,
    notes: (formData.get('notes') as string) || null,
    photo_url_1: (formData.get('photo_url_1') as string) || null,
    photo_url_2: (formData.get('photo_url_2') as string) || null,
  }

  const { data, error } = await supabase
    .from('meals')
    .insert([mealData])
    .select()
    .single()

  if (error) {
    console.error('Meal creation error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath('/meals')
  return { error: null, success: true, mealId: data.id }
}

export async function getMeals(date?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', data: [] }
  }

  let query = supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)

  if (date) {
    query = query.eq('meal_datetime', date)
  }

  query = query.order('meal_datetime', { ascending: false }).order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching meals:', error)
    return { error: error.message, data: [] }
  }

  return { data, error: null }
}

export async function getMeal(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching meal:', error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function updateMeal(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  const mealData = {
    meal_datetime: formData.get('meal_datetime') as string,
    meal_type: (formData.get('meal_type') as string) || null,
    food_name: formData.get('food_name') as string,
    total_calories: (formData.get('total_calories') as string) || null,
    carbs: (formData.get('carbs') as string) || null,
    protein: (formData.get('protein') as string) || null,
    fat: (formData.get('fat') as string) || null,
    serving_size: (formData.get('serving_size') as string) || null,
    water_intake: (formData.get('water_intake') as string) || null,
    notes: (formData.get('notes') as string) || null,
    photo_url_1: (formData.get('photo_url_1') as string) || null,
    photo_url_2: (formData.get('photo_url_2') as string) || null,
  }

  const { error } = await supabase
    .from('meals')
    .update(mealData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Meal update error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath('/meals')
  revalidatePath(`/meals/${id}`)
  return { error: null, success: true }
}

export async function deleteMeal(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Meal delete error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath('/meals')
  return { error: null, success: true }
}
