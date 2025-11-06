'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getPriceHistory(propertyId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('property_id', propertyId)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching price history:', error)
    return { error: error.message, data: [] }
  }

  return { data, error: null }
}

export async function addPriceHistory(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  const propertyId = formData.get('property_id') as string

  // 부동산 소유자 확인
  const { data: property } = await supabase
    .from('properties')
    .select('user_id')
    .eq('id', propertyId)
    .single()

  if (!property || property.user_id !== user.id) {
    return { error: '권한이 없습니다.', success: false }
  }

  const priceHistoryData = {
    property_id: propertyId,
    date: formData.get('date') as string,
    price: parseFloat(formData.get('price') as string) * 10000000, // 천만원 단위를 원 단위로 변환
    transaction_type: formData.get('transaction_type') as string,
  }

  const { error } = await supabase
    .from('price_history')
    .insert([priceHistoryData])

  if (error) {
    console.error('Price history creation error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath(`/properties/${propertyId}`)
  return { error: null, success: true }
}

export async function deletePriceHistory(id: string, propertyId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', success: false }
  }

  // 부동산 소유자 확인
  const { data: property } = await supabase
    .from('properties')
    .select('user_id')
    .eq('id', propertyId)
    .single()

  if (!property || property.user_id !== user.id) {
    return { error: '권한이 없습니다.', success: false }
  }

  const { error } = await supabase
    .from('price_history')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Price history deletion error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath(`/properties/${propertyId}`)
  return { error: null, success: true }
}
