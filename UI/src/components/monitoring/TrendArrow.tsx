import type { RangeStatus, TrendDirection } from '../../types/monitoring'

import './TrendArrow.css'

export interface TrendArrowProps {
  direction: TrendDirection
  status: RangeStatus
  delta: number | null
  accessibleLabel: string
  /** Unit displayed beside the delta. Defaults to bpm. */
  deltaUnit?: string
  className?: string
}

const pathByDirection: Record<TrendDirection, string> = {
  up: 'M3 19 L10 13 L16 16 L26 6',
  down: 'M3 5 L10 11 L16 8 L26 18',
  stable: 'M3 13 L9 10 L15 14 L21 10 L27 12',
}

const arrowheadByDirection: Record<TrendDirection, string> = {
  up: '24 3, 31 3, 29 10',
  down: '24 21, 31 21, 29 14',
  stable: '27 8, 32 12, 27 16',
}

function formatTrendDelta(
  direction: TrendDirection,
  delta: number | null,
  unit: string,
) {
  if (direction === 'stable') return 'No significant change'
  if (delta === null || !Number.isFinite(delta)) return 'Change unavailable'

  const magnitude = Math.abs(delta)
  const sign = direction === 'up' ? '+' : '\u2212'
  return `${sign}${magnitude} ${unit}`
}

/** Compact stock-chart-style trend indicator with independent trend and range status. */
export function TrendArrow({
  direction,
  status,
  delta,
  accessibleLabel,
  deltaUnit = 'bpm',
  className = '',
}: TrendArrowProps) {
  const unavailable = status === 'unavailable'
  const displayDirection = unavailable ? 'stable' : direction
  const deltaText = unavailable
    ? 'Trend unavailable'
    : formatTrendDelta(direction, delta, deltaUnit)

  return (
    <span
      className={`monitor-trend monitor-trend--${status} ${className}`.trim()}
      data-direction={direction}
      data-status={status}
    >
      <svg
        className="monitor-trend__icon"
        viewBox="0 0 34 24"
        role="img"
        aria-label={accessibleLabel}
      >
        <path d={pathByDirection[displayDirection]} />
        <polygon points={arrowheadByDirection[displayDirection]} />
      </svg>
      <span className="monitor-trend__delta">{deltaText}</span>
    </span>
  )
}
