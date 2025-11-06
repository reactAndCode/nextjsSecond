'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadPropertyImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const file = formData.get('file') as File
  const propertyId = formData.get('property_id') as string
  const photoNumber = parseInt(formData.get('photo_number') as string) as 1 | 2

  if (!file || !propertyId || !photoNumber) {
    return { error: '필수 정보가 누락되었습니다.' }
  }

  return await uploadPropertyImageInternal(file, user.id, propertyId, photoNumber)
}

async function uploadPropertyImageInternal(
  file: File,
  userId: string,
  propertyId: string,
  photoNumber: 1 | 2
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { error: '지원하지 않는 파일 형식입니다. (jpg, png, webp만 가능)' }
    }

    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { error: '파일 크기는 5MB 이하여야 합니다.' }
    }

    // 파일 경로 생성
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const filePath = `myUp01/${propertyId}_photo${photoNumber}_${timestamp}.${fileExt}`

    // 파일 업로드
    const { data, error } = await supabase.storage
      .from('my-real-estate')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { error: error.message }
    }

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('my-real-estate')
      .getPublicUrl(data.path)

    // Property 테이블 업데이트
    const photoField = photoNumber === 1 ? 'photo_url_1' : 'photo_url_2'
    const { error: updateError } = await supabase
      .from('properties')
      .update({ [photoField]: publicUrl })
      .eq('id', propertyId)

    if (updateError) {
      console.error('Property update error:', updateError)
      return { error: '부동산 정보 업데이트 중 오류가 발생했습니다.' }
    }

    revalidatePath(`/properties/${propertyId}`)
    return { url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { error: '이미지 업로드 중 오류가 발생했습니다.' }
  }
}

export async function uploadMealImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const file = formData.get('file') as File
  const mealId = formData.get('property_id') as string // property_id로 받지만 meal_id로 사용
  const photoNumber = parseInt(formData.get('photo_number') as string) as 1 | 2

  if (!file || !mealId || !photoNumber) {
    return { error: '필수 정보가 누락되었습니다.' }
  }

  try {
    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { error: '지원하지 않는 파일 형식입니다. (jpg, png, webp만 가능)' }
    }

    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { error: '파일 크기는 5MB 이하여야 합니다.' }
    }

    // 타임스탬프 생성 (YYYYMMDDHHMMSS)
    const now = new Date()
    const timestamp = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0')

    // 원본 파일명에서 확장자 분리
    const fileExt = file.name.split('.').pop()
    const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'))

    // 파일명을 안전하게 변환 (영문, 숫자, 하이픈, 언더스코어만 허용)
    const sanitizedName = originalNameWithoutExt
      .replace(/[^a-zA-Z0-9.\-]/g, '_')  // 영문, 숫자, 점, 하이픈 외에는 _로 변경
      .replace(/_+/g, '_')  // 연속된 _를 하나로
      .replace(/^_|_$/g, '')  // 시작과 끝의 _제거
      .replace(/^$/, 'image')  // 빈 문자열이면 'image'로 대체

    // 파일명을 30자로 제한
    const truncatedName = sanitizedName.length > 30
      ? sanitizedName.substring(0, 30).replace(/_$/, '')  // 끝의 _도 제거
      : sanitizedName

    // 파일 경로 생성: myUpMeals/YYYYMMDDHHMMSS_filename.ext
    const filePath = `myUpMeals/${timestamp}_${truncatedName}.${fileExt}`

    // 파일 업로드
    const { data, error } = await supabase.storage
      .from('my-real-estate')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { error: error.message }
    }

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('my-real-estate')
      .getPublicUrl(data.path)

    // Meals 테이블 업데이트
    const photoField = photoNumber === 1 ? 'photo_url_1' : 'photo_url_2'
    const { error: updateError } = await supabase
      .from('meals')
      .update({ [photoField]: publicUrl })
      .eq('id', mealId)

    if (updateError) {
      console.error('Meal update error:', updateError)
      return { error: '식사 정보 업데이트 중 오류가 발생했습니다.' }
    }

    revalidatePath(`/meals/${mealId}`)
    return { url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { error: '이미지 업로드 중 오류가 발생했습니다.' }
  }
}

export async function deletePropertyImage(filePath: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.storage
      .from('my-real-estate')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { error: '이미지 삭제 중 오류가 발생했습니다.' }
  }
}
