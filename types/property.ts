export type Property = {
  id: string
  user_id: string
  name: string
  region: string
  total_households: number
  area: number
  pyeong: number
  floor: number
  registered_date: string
  sale_price: number
  recent_transaction_price: number
  management_fee?: number
  rooms?: number
  bathrooms?: number
  direction?: string
  agent_name?: string
  agent_contact?: string
  description?: string
  photo_url_1?: string
  photo_url_2?: string
  created_at: string
  updated_at: string
}

export type PriceHistory = {
  id: string
  property_id: string
  date: string
  price: number
  transaction_type: 'sale' | 'jeonse' | 'monthly'
  created_at: string
}

export type CreatePropertyInput = Omit<Property, 'id' | 'created_at' | 'updated_at'>

export type UpdatePropertyInput = Partial<CreatePropertyInput>
