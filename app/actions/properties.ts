'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createProperty(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const propertyData = {
    user_id: user.id,
    name: formData.get('name') as string,
    region: formData.get('region') as string,
    total_households: formData.get('total_households') ? parseInt(formData.get('total_households') as string) : null,
    area: parseFloat(formData.get('area') as string),
    pyeong: parseFloat(formData.get('pyeong') as string),
    floor: formData.get('floor') ? parseInt(formData.get('floor') as string) : null,
    registered_date: formData.get('registered_date') as string,
    sale_price: parseFloat(formData.get('sale_price') as string) * 10000000, // 천만원 단위를 원 단위로 변환
    recent_transaction_price: formData.get('recent_transaction_price')
      ? parseFloat(formData.get('recent_transaction_price') as string) * 10000000 // 천만원 단위를 원 단위로 변환
      : null,
    management_fee: formData.get('management_fee')
      ? parseFloat(formData.get('management_fee') as string)
      : null,
    rooms: formData.get('rooms') ? parseInt(formData.get('rooms') as string) : null,
    bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms') as string) : null,
    direction: (formData.get('direction') as string) || null,
    agent_name: (formData.get('agent_name') as string) || null,
    agent_contact: (formData.get('agent_contact') as string) || null,
    description: (formData.get('description') as string) || null,
    photo_url_1: (formData.get('photo_url_1') as string) || null,
    photo_url_2: (formData.get('photo_url_2') as string) || null,
  }

  const { data, error } = await supabase
    .from('properties')
    .insert([propertyData])
    .select()
    .single()

  if (error) {
    console.error('Property creation error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath('/properties')
  return { error: null, success: true, propertyId: data.id }
}

type PropertiesFilter = {
  search?: string
  region?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  sortBy?: 'newest' | 'price-high' | 'price-low' | 'area-large' | 'area-small'
}

export async function getProperties(filters?: PropertiesFilter) {
  const supabase = await createClient()

  let query = supabase.from('properties').select('*')

  // 검색어 필터 (이름 또는 지역)
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,region.ilike.%${filters.search}%`)
  }

  // 지역 필터
  if (filters?.region && filters.region !== 'all') {
    query = query.eq('region', filters.region)
  }

  // 가격 범위 필터 (천만원 단위를 원 단위로 변환)
  if (filters?.minPrice) {
    query = query.gte('sale_price', filters.minPrice * 10000000)
  }
  if (filters?.maxPrice) {
    query = query.lte('sale_price', filters.maxPrice * 10000000)
  }

  // 면적 범위 필터
  if (filters?.minArea) {
    query = query.gte('area', filters.minArea)
  }
  if (filters?.maxArea) {
    query = query.lte('area', filters.maxArea)
  }

  // 정렬
  switch (filters?.sortBy) {
    case 'price-high':
      query = query.order('sale_price', { ascending: false })
      break
    case 'price-low':
      query = query.order('sale_price', { ascending: true })
      break
    case 'area-large':
      query = query.order('area', { ascending: false })
      break
    case 'area-small':
      query = query.order('area', { ascending: true })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching properties:', error)
    return { error: error.message, data: [] }
  }

  return { data, error: null }
}

export async function getProperty(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching property:', error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function updateProperty(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const propertyData = {
    name: formData.get('name') as string,
    region: formData.get('region') as string,
    total_households: formData.get('total_households') ? parseInt(formData.get('total_households') as string) : null,
    area: parseFloat(formData.get('area') as string),
    pyeong: parseFloat(formData.get('pyeong') as string),
    floor: formData.get('floor') ? parseInt(formData.get('floor') as string) : null,
    registered_date: formData.get('registered_date') as string,
    sale_price: parseFloat(formData.get('sale_price') as string) * 10000000, // 천만원 단위를 원 단위로 변환
    recent_transaction_price: formData.get('recent_transaction_price')
      ? parseFloat(formData.get('recent_transaction_price') as string) * 10000000 // 천만원 단위를 원 단위로 변환
      : null,
    management_fee: formData.get('management_fee')
      ? parseFloat(formData.get('management_fee') as string)
      : null,
    rooms: formData.get('rooms') ? parseInt(formData.get('rooms') as string) : null,
    bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms') as string) : null,
    direction: (formData.get('direction') as string) || null,
    agent_name: (formData.get('agent_name') as string) || null,
    agent_contact: (formData.get('agent_contact') as string) || null,
    description: (formData.get('description') as string) || null,
    photo_url_1: (formData.get('photo_url_1') as string) || null,
    photo_url_2: (formData.get('photo_url_2') as string) || null,
  }

  const { data, error } = await supabase
    .from('properties')
    .update(propertyData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Property update error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath('/properties')
  revalidatePath(`/properties/${id}`)
  return { error: null, success: true, id }
}

export async function deleteProperty(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Property deletion error:', error)
    return { error: error.message, success: false }
  }

  revalidatePath('/properties')
  return { error: null, success: true }
}
