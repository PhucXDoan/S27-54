import type { Alert } from '../../types/monitoring'
import { AlertBanner } from './AlertBanner'

import './AlertList.css'

export interface AlertListProps {
  alerts: Alert[]
  title?: string
  emptyMessage?: string
  getStartTimeLabel?: (alert: Alert) => string
  getAcknowledgementLabel?: (alert: Alert) => string | undefined
  onAcknowledge?: (alertId: string) => void
  onOpenDetails?: (alertId: string) => void
  acknowledgingAlertId?: string | null
  className?: string
}

export function AlertList({
  alerts,
  title = 'Active alerts',
  emptyMessage = 'No active alerts',
  getStartTimeLabel,
  getAcknowledgementLabel,
  onAcknowledge,
  onOpenDetails,
  acknowledgingAlertId,
  className = '',
}: AlertListProps) {
  return (
    <section
      className={`monitor-alert-list ${className}`.trim()}
      aria-labelledby="monitor-alert-list-title"
    >
      <div className="monitor-alert-list__heading">
        <h2 id="monitor-alert-list-title">{title}</h2>
        {alerts.length > 0 && (
          <span aria-label={`${alerts.length} ${alerts.length === 1 ? 'alert' : 'alerts'}`}>
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <p className="monitor-alert-list__empty" role="status">
          {emptyMessage}
        </p>
      ) : (
        <ul className="monitor-alert-list__items">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <AlertBanner
                alert={alert}
                startTimeLabel={getStartTimeLabel?.(alert)}
                acknowledgementLabel={getAcknowledgementLabel?.(alert)}
                onAcknowledge={onAcknowledge}
                onOpenDetails={onOpenDetails}
                acknowledgeBusy={acknowledgingAlertId === alert.id}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
