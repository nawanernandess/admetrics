import type { Strategy } from '@/types'
import { STRATEGY_BADGE_CLASSES } from '@/lib/strategyStyles'

export function StrategyBadge({ strategy }: { strategy: Strategy }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-150 ${STRATEGY_BADGE_CLASSES[strategy]}`}
    >
      {strategy}
    </span>
  )
}
