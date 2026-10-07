import type { ReactNode } from 'react'
import {
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  Info,
  TriangleAlert,
} from 'lucide-react'

import './StatusBadge.css'

export type StatusBadgeTone =
  | 'positive'
  | 'warning'
  | 'critical'
  | 'info'
  | 'neutral'

export interface StatusBadgeProps {
  children: ReactNode
  tone?: StatusBadgeTone
  icon?: ReactNode
  className?: string
  ariaLabel?: string
}

const toneIcons: Record<StatusBadgeTone, ReactNode> = {
  positive: <CheckCircle2 aria-hidden="true" />,
  warning: <TriangleAlert aria-hidden="true" />,
  critical: <CircleAlert aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
  neutral: <CircleHelp aria-hidden="true" />,
}

/** A compact status indicator that always pairs color with an icon and text. */
export function StatusBadge({
  children,
  tone = 'neutral',
  icon,
  className = '',
  ariaLabel,
}: StatusBadgeProps) {
  return (
    <span
      className={`monitor-status-badge monitor-status-badge--${tone} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <span className="monitor-status-badge__icon">{icon ?? toneIcons[tone]}</span>
      <span>{children}</span>
    </span>
  )
}
