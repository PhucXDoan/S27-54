import type { ReactNode } from 'react'
import {
  ArrowLeft,
  Battery,
  BatteryLow,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'

import type { ConnectionStatus } from '../../types/monitoring'
import { DEMONSTRATION_RANGES } from '../../config/demonstrationRanges'
import { StatusBadge } from './StatusBadge'
import {
  connectionStatusLabels,
  connectionStatusTones,
  formatClockTime,
} from './presentation'

import './ConnectionBar.css'

export interface ConnectionBarProps {
  status: ConnectionStatus
  batteryPercentage: number
  lastValidUpdate: string | null
  lastUpdateLabel?: string
  onBack?: () => void
  backLabel?: string
  title?: string
  actions?: ReactNode
  className?: string
}

const connectionIcons: Record<ConnectionStatus, ReactNode> = {
  connected: <Wifi aria-hidden="true" />,
  reconnecting: <RefreshCw aria-hidden="true" />,
  offline: <WifiOff aria-hidden="true" />,
}

/** Persistent monitor header for navigation, connection freshness, and battery. */
export function ConnectionBar({
  status,
  batteryPercentage,
  lastValidUpdate,
  lastUpdateLabel,
  onBack,
  backLabel = 'All foals',
  title = 'Patient monitor',
  actions,
  className = '',
}: ConnectionBarProps) {
  const battery = Math.min(100, Math.max(0, Math.round(batteryPercentage)))
  const batteryTone =
    battery <= DEMONSTRATION_RANGES.lowBatteryPercentage / 2
      ? 'critical'
      : battery <= DEMONSTRATION_RANGES.lowBatteryPercentage
        ? 'warning'
        : 'positive'
  const BatteryIcon = battery <= 20 ? BatteryLow : Battery

  return (
    <header
      className={`monitor-connection-bar monitor-connection-bar--${status} ${className}`.trim()}
      aria-label="Monitor connection and device status"
    >
      <div className="monitor-connection-bar__nav">
        {onBack && (
          <button type="button" onClick={onBack} className="monitor-connection-bar__back">
            <ArrowLeft aria-hidden="true" />
            <span>{backLabel}</span>
          </button>
        )}
        <span className="monitor-connection-bar__title">{title}</span>
      </div>

      <div className="monitor-connection-bar__statuses">
        <StatusBadge
          tone={connectionStatusTones[status]}
          icon={connectionIcons[status]}
          ariaLabel={`Device status: ${connectionStatusLabels[status]}`}
        >
          {connectionStatusLabels[status]}
        </StatusBadge>

        <div className="monitor-connection-bar__update">
          <span>{status === 'offline' ? 'Last valid update' : 'Latest valid update'}</span>
          <strong>
            {lastValidUpdate ? (
              <time dateTime={lastValidUpdate}>
                {lastUpdateLabel ?? formatClockTime(lastValidUpdate)}
              </time>
            ) : (
              'Unavailable'
            )}
          </strong>
        </div>

        <StatusBadge
          tone={batteryTone}
          icon={<BatteryIcon aria-hidden="true" />}
          ariaLabel={`Device battery: ${battery} percent`}
        >
          {battery}% battery
        </StatusBadge>
        {actions && <div className="monitor-connection-bar__actions">{actions}</div>}
      </div>
    </header>
  )
}
