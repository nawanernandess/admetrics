export const STRATEGIES = [
  'Portfólio',
  'CPA',
  'ROAS',
  'Maximizar cliques',
  'Maximizar conversões',
  'CPC manual',
] as const

export type Strategy = (typeof STRATEGIES)[number]

export interface Product {
  id: string
  userId?: string
  name: string
  strategy: Strategy
  dailyBudget: number
  maxCpcCpa: number
  targetConversionValue: number
  account: string
  page: string
}

export type ProductInput = Omit<Product, 'id'>

export interface DailyRecord {
  id: string
  productId: string
  date: string
  impressions: number
  clicks: number
  visitors: number
  checkouts: number
  conversions: number
  cost: number
  convertedValue: number
  maxCpcCpa: number
  dailyBudget: number
  bidStrategy: Strategy
  topShare: number
  firstAboveShare: number
  impressionShare: number
  account: string
  page: string
  note: string
}

export type DailyRecordInput = Omit<DailyRecord, 'id' | 'productId'>

export interface ComputedRecord extends DailyRecord {
  ctr: number
  averageCpc: number
  result: number
  result7d: number
  cumulativeResult: number
  dropoffRate: number
  conversionRate: number
  costPerConversion: number
  roas: number
  cpm: number
}
