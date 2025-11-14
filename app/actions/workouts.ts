'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createWorkout(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  const workoutData = {
    user_id: user.id,
    exercise_name: formData.get('exercise_name') as string,
    workout_date: formData.get('workout_date') as string,
    body_part: (formData.get('body_part') as string) || null,
    weight: (formData.get('weight') as string) || null,
    reps: (formData.get('reps') as string) || null,
    sets: (formData.get('sets') as string) || null,
    duration: (formData.get('duration') as string) || null,
    intensity: (formData.get('intensity') as string) || null,
    condition: (formData.get('condition') as string) || null,
    next_goal: (formData.get('next_goal') as string) || null,
    notes: (formData.get('notes') as string) || null,
    photo_url_1: (formData.get('photo_url_1') as string) || null,
    photo_url_2: (formData.get('photo_url_2') as string) || null,
  }

  const { data, error } = await supabase
    .from('workouts')
    .insert([workoutData])
    .select()
    .single()

  if (error) {
    console.error('Workout creation error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath('/workouts')
  return { error: null, success: true, workoutId: data.id }
}

export async function getWorkouts(date?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', data: [] }
  }

  let query = supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)

  if (date) {
    query = query.eq('workout_date', date)
  }

  query = query.order('workout_date', { ascending: false }).order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching workouts:', error)
    return { error: error.message, data: [] }
  }

  return { data, error: null }
}

export async function getWorkout(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching workout:', error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function updateWorkout(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  const workoutData = {
    exercise_name: formData.get('exercise_name') as string,
    workout_date: formData.get('workout_date') as string,
    body_part: (formData.get('body_part') as string) || null,
    weight: (formData.get('weight') as string) || null,
    reps: (formData.get('reps') as string) || null,
    sets: (formData.get('sets') as string) || null,
    duration: (formData.get('duration') as string) || null,
    intensity: (formData.get('intensity') as string) || null,
    condition: (formData.get('condition') as string) || null,
    next_goal: (formData.get('next_goal') as string) || null,
    notes: (formData.get('notes') as string) || null,
    photo_url_1: (formData.get('photo_url_1') as string) || null,
    photo_url_2: (formData.get('photo_url_2') as string) || null,
  }

  const { error } = await supabase
    .from('workouts')
    .update(workoutData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Workout update error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath('/workouts')
  revalidatePath(`/workouts/${id}`)
  return { error: null, success: true }
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Workout delete error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath('/workouts')
  return { error: null, success: true }
}

export async function createWorkoutsBatch(workouts: Array<{
  exercise_name: string
  workout_date: string
  body_part?: string
  weight?: string
  reps?: string
  sets?: string
}>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  // 빈 운동명 필터링
  const validWorkouts = workouts.filter(w => w.exercise_name.trim() !== '')

  if (validWorkouts.length === 0) {
    return { error: '최소 1개 이상의 운동을 입력해주세요.', success: false }
  }

  const workoutsData = validWorkouts.map(workout => ({
    user_id: user.id,
    exercise_name: workout.exercise_name,
    workout_date: workout.workout_date,
    body_part: workout.body_part || null,
    weight: workout.weight || null,
    reps: workout.reps || null,
    sets: workout.sets || null,
    duration: null,
    intensity: null,
    condition: null,
    next_goal: null,
    notes: null,
    photo_url_1: null,
    photo_url_2: null,
  }))

  const { data, error } = await supabase
    .from('workouts')
    .insert(workoutsData)
    .select()

  if (error) {
    console.error('Batch workout creation error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath('/workouts')
  return { error: null, success: true, count: data.length }
}
