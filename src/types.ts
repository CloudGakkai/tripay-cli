// export types
export type SignaturePayloadType = {
  invoiceRef: string
  amount: number
}

export interface TripayConfig {
  merchant_code: string
  api_key: string
  private_key: string
}

export type OrderItem = {
  sku?: string
  name: string
  price: number
  quantity: number
  product_url?: string
  image_url?: string
}

export interface PaymentPayload {
  method: string
  merchant_ref: string
  amount: number
  customer_name: string
  customer_email: string
  customer_phone: string
  order_items: OrderItem[]
  callback_url?: string
  return_url?: string
  expired_time?: string
  signature: string
}
