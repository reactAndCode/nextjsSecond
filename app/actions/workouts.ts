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

export async function getSuggestedReps(exerciseName: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { suggestedReps: null }
  }

  // 오늘 날짜 기준 지난주 날짜 계산
  const today = new Date()
  const lastWeek = new Date(today)
  lastWeek.setDate(today.getDate() - 7)
  const lastWeekDate = lastWeek.toISOString().split('T')[0]

  // 1. 먼저 지난주 같은 운동 찾기
  const { data: lastWeekWorkout } = await supabase
    .from('workouts')
    .select('reps')
    .eq('user_id', user.id)
    .eq('exercise_name', exerciseName)
    .lte('workout_date', lastWeekDate)
    .order('workout_date', { ascending: false })
    .limit(1)
    .single()

  if (lastWeekWorkout?.reps) {
    const repsValue = parseInt(lastWeekWorkout.reps.replace(/[^0-9]/g, '')) || 0
    if (repsValue > 0) {
      const suggested = Math.ceil(repsValue * 1.1)
      return { suggestedReps: suggested.toString() }
    }
  }

  // 2. 지난주 기록이 없으면 최근 5개 평균
  const { data: recentWorkouts } = await supabase
    .from('workouts')
    .select('reps')
    .eq('user_id', user.id)
    .eq('exercise_name', exerciseName)
    .order('workout_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)

  if (recentWorkouts && recentWorkouts.length > 0) {
    const validReps = recentWorkouts
      .map(w => parseInt(w.reps?.replace(/[^0-9]/g, '') || '0'))
      .filter(r => r > 0)

    if (validReps.length > 0) {
      const average = validReps.reduce((sum, r) => sum + r, 0) / validReps.length
      const suggested = Math.ceil(average * 1.1)
      return { suggestedReps: suggested.toString() }
    }
  }

  return { suggestedReps: null }
}

export async function getLastWeekWorkouts() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: '로그인이 필요합니다.' }
  }

  // 오늘 기준 지난주 같은 요일 날짜 계산 (정확히 7일 전)
  const today = new Date()
  const lastWeekSameDay = new Date(today)
  lastWeekSameDay.setDate(today.getDate() - 7)
  const lastWeekDate = lastWeekSameDay.toISOString().split('T')[0]

  console.log('오늘:', today.toISOString().split('T')[0])
  console.log('지난주 같은 요일:', lastWeekDate)

  // 지난주 같은 요일의 운동 기록 가져오기 (없으면 최근 5개)
  let { data: lastWeekWorkouts, error } = await supabase
    .from('workouts')
    .select('exercise_name, body_part, weight, reps, sets, workout_date')
    .eq('user_id', user.id)
    .eq('workout_date', lastWeekDate)

  console.log('지난주 같은 요일 운동:', lastWeekWorkouts)

  // 지난주 같은 요일에 운동이 없으면 최근 5개 가져오기
  if (!lastWeekWorkouts || lastWeekWorkouts.length === 0) {
    console.log('지난주 같은 요일 운동 없음, 최근 5개 조회')
    const { data: recentWorkouts, error: recentError } = await supabase
      .from('workouts')
      .select('exercise_name, body_part, weight, reps, sets, workout_date')
      .eq('user_id', user.id)
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) {
      console.error('Error fetching recent workouts:', recentError)
      return { data: null, error: recentError.message }
    }

    lastWeekWorkouts = recentWorkouts
    console.log('최근 5개 운동:', lastWeekWorkouts)
  }

  if (error) {
    console.error('Error fetching last week workouts:', error)
    return { data: null, error: error.message }
  }

  // 횟수를 10% 증가시킴
  const workoutsWithIncreasedReps = lastWeekWorkouts.map(workout => {
    let increasedReps = workout.reps

    if (workout.reps) {
      const repsValue = parseInt(workout.reps.replace(/[^0-9]/g, '')) || 0
      if (repsValue > 0) {
        const newReps = Math.ceil(repsValue * 1.1)
        // 원본 형식 유지 (예: "10회" -> "11회")
        increasedReps = workout.reps.replace(/\d+/, newReps.toString())
      }
    }

    return {
      exercise_name: workout.exercise_name,
      body_part: workout.body_part || '',
      weight: workout.weight || '',
      reps: increasedReps || '',
      sets: workout.sets || '',
    }
  })

  console.log('10% 증가된 운동:', workoutsWithIncreasedReps)
  return { data: workoutsWithIncreasedReps, error: null }
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
