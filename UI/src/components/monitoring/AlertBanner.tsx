import {
  Activity,
  Check,
  CircleAlert,
  Clock3,
  ExternalLink,
  RadioTower,
  WifiOff,
} from 'lucide-react'

import type { Alert } from '../../types/monitoring'
import { StatusBadge } from './StatusBadge'
import {
  alertCategoryLabels,
  alertSeverityTones,
  formatClockTime,
} from './presentation'

import './AlertBanner.css'

export interface AlertBannerProps {
  alert: Alert
  startTimeLabel?: string
  acknowledgementLabel?: string
  onAcknowledge?: (alertId: string) => void
  onOpenDetails?: (alertId: string) => void
  acknowledgeBusy?: boolean
  className?: string
}

const categoryIcons = {
  physiological: Activity,
  equipment: RadioTower,
  connection: WifiOff,
} as const

/** One persistent clinical/equipment alert. Acknowledgement never clears its state. */
export function AlertBanner({
  alert,
  startTimeLabel,
  acknowledgementLabel,
  onAcknowledge,
  onOpenDetails,
  acknowledgeBusy = false,
  className = '',
}: AlertBannerProps) {
  const CategoryIcon = categoryIcons[alert.category]
  const isActive = alert.status === 'active'
  const role = isActive && !alert.acknowledged ? 'alert' : 'status'

  return (
    <article
      className={`monitor-alert monitor-alert--${alert.severity} ${alert.acknowledged ? 'monitor-alert--acknowledged' : ''} ${!isActive ? 'monitor-alert--resolved' : ''} ${className}`.trim()}
      aria-labelledby={`alert-${alert.id}-title`}
      role={role}
    >
      <div className="monitor-alert__icon" aria-hidden="true">
        <CategoryIcon />
      </div>

      <div className="monitor-alert__body">
        <div className="monitor-alert__labels">
          <StatusBadge
            tone={isActive ? alertSeverityTones[alert.severity] : 'neutral'}
            icon={isActive ? <CircleAlert aria-hidden="true" /> : <Check aria-hidden="true" />}
          >
            {isActive ? alertCategoryLabels[alert.category] : 'Resolved'}
          </StatusBadge>
          {alert.acknowledged && (
            <StatusBadge tone="info" icon={<Check aria-hidden="true" />}>
              Acknowledged
            </StatusBadge>
          )}
        </div>

        <h3 id={`alert-${alert.id}-title`}>{alert.title}</h3>
        <p>{alert.message}</p>

        <div className="monitor-alert__time">
          <Clock3 aria-hidden="true" />
          <span>Started</span>
          <time dateTime={alert.startedAt}>
            {startTimeLabel ?? formatClockTime(alert.startedAt)}
          </time>
        </div>

        {alert.acknowledged && (
          <p className="monitor-alert__acknowledgement">
            {acknowledgementLabel ??
              `Seen${alert.acknowledgedBy ? ` by ${alert.acknowledgedBy}` : ''}${
                alert.acknowledgedAt
                  ? ` at ${formatClockTime(alert.acknowledgedAt)}`
                  : ''
              }. Condition remains ${isActive ? 'active' : 'resolved'}.`}
          </p>
        )}
      </div>

      <div className="monitor-alert__actions">
        {onAcknowledge && isActive && (
          <button
            type="button"
            className="monitor-alert__button monitor-alert__button--primary"
            onClick={() => onAcknowledge(alert.id)}
            disabled={alert.acknowledged || acknowledgeBusy}
          >
            <Check aria-hidden="true" />
            {alert.acknowledged
              ? 'Acknowledged'
              : acknowledgeBusy
                ? 'Recording…'
                : 'Acknowledge'}
          </button>
        )}
        {onOpenDetails && (
          <button
            type="button"
            className="monitor-alert__button"
            onClick={() => onOpenDetails(alert.id)}
          >
            <ExternalLink aria-hidden="true" />
            Open details
          </button>
        )}
      </div>
    </article>
  )
}
