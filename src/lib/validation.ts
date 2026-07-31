import { z } from 'zod'
import { STRATEGIES } from '@/types'

const nonNegativeNumber = z.number({ error: 'Informe um número' }).min(0, 'Não pode ser negativo')

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do produto'),
  strategy: z.enum(STRATEGIES),
  dailyBudget: nonNegativeNumber,
  maxCpcCpa: nonNegativeNumber,
  targetConversionValue: nonNegativeNumber,
  account: z.string().trim(),
  page: z.string().trim(),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const dailyRecordSchema = z.object({
  date: z.string().min(1, 'Informe a data'),
  impressions: nonNegativeNumber,
  clicks: nonNegativeNumber,
  visitors: nonNegativeNumber,
  checkouts: nonNegativeNumber,
  conversions: nonNegativeNumber,
  cost: nonNegativeNumber,
  convertedValue: nonNegativeNumber,
  maxCpcCpa: nonNegativeNumber,
  dailyBudget: nonNegativeNumber,
  bidStrategy: z.enum(STRATEGIES),
  topShare: nonNegativeNumber,
  firstAboveShare: nonNegativeNumber,
  impressionShare: nonNegativeNumber,
  account: z.string().trim(),
  page: z.string().trim(),
  note: z.string().trim(),
})

export type DailyRecordFormValues = z.infer<typeof dailyRecordSchema>
