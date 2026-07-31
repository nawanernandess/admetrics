import type { Strategy } from '@/types'

export const STRATEGY_BADGE_CLASSES: Record<Strategy, string> = {
  Portfólio: 'bg-teal-50 text-teal-700 border border-teal-200',
  CPA: 'bg-purple-50 text-purple-700 border border-purple-200',
  ROAS: 'bg-orange-50 text-orange-700 border border-orange-200',
  'Maximizar cliques': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Maximizar conversões': 'bg-green-50 text-green-700 border border-green-200',
  'CPC manual': 'bg-slate-100 text-slate-600 border border-slate-200',
}
