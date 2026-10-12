import { Activity, Clock3, Radio } from 'lucide-react'

import type { VitalReading } from '../../types/monitoring'
import { StatusBadge } from './StatusBadge'
import { TrendArrow } from './TrendArrow'
import {
  createTrendAccessibleLabel,
  formatClockTime,
  rangeStatusLabels,
  rangeStatusTones,
  signalQualityLabels,
  signalQualityTones,
} from './presentation'

import './VitalSignCard.css'

export interface VitalSignCardProps {
  label: string
  reading: VitalReading
  /** E.g. “ECG signal” or “Respiration signal”. */
  signalLabel: string
  latestReadingLabel?: string
  unavailableMessage?: string
  unavailableHint?: string
  staleMessage?: string
  trendAccessibleLabel?: string
  className?: string
}

/** Current calculated vital value with trend, range, signal, and freshness context. */
export function VitalSignCard({
  label,
  reading,
  signalLabel,
  latestReadingLabel,
  unavailableMessage = `${label} unavailable`,
  unavailableHint = 'Check the sensor connection.',
  staleMessage = 'Previous value — stale',
  trendAccessibleLabel,
  className = '',
}: VitalSignCardProps) {
  const isUnavailable = reading.value === null || reading.status === 'unavailable'
  const headingId = `vital-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const lastReadingText =
    latestReadingLabel ?? formatClockTime(reading.lastValidAt)
  const accessibleTrend =
    trendAccessibleLabel ??
    createTrendAccessibleLabel(
      label,
      reading.trend,
      reading.delta,
      reading.unit,
      reading.status,
    )

  return (
    <article
      className={`monitor-vital-card ${reading.isStale ? 'monitor-vital-card--stale' : ''} ${isUnavailable ? 'monitor-vital-card--unavailable' : ''} ${className}`.trim()}
      aria-labelledby={headingId}
    >
      <div className="monitor-vital-card__header">
        <h2 id={headingId}>{label}</h2>
        <StatusBadge tone={rangeStatusTones[reading.status]}>
          {rangeStatusLabels[reading.status]}
        </StatusBadge>
      </div>

      {isUnavailable ? (
        <div className="monitor-vital-card__missing" role="status">
          <Activity aria-hidden="true" />
          <div>
            <strong>{unavailableMessage}</strong>
            <p>{unavailableHint}</p>
          </div>
        </div>
      ) : (
        <div className="monitor-vital-card__measurement">
          <div className="monitor-vital-card__value-group">
            <span className="monitor-vital-card__value">{reading.value}</span>
            <span className="monitor-vital-card__unit">{reading.unit}</span>
          </div>
          <TrendArrow
            direction={reading.trend}
            status={reading.status}
            delta={reading.delta}
            deltaUnit={reading.unit}
            accessibleLabel={accessibleTrend}
          />
        </div>
      )}

      {reading.isStale && (
        <div className="monitor-vital-card__stale" role="status">
          <Clock3 aria-hidden="true" />
          <strong>{staleMessage}</strong>
        </div>
      )}

      <dl className="monitor-vital-card__meta">
        <div>
          <dt>
            <Radio aria-hidden="true" />
            {signalLabel}
          </dt>
          <dd>
            <StatusBadge tone={signalQualityTones[reading.signalQuality]}>
              {signalQualityLabels[reading.signalQuality]}
            </StatusBadge>
          </dd>
        </div>
        <div>
          <dt>
            <Clock3 aria-hidden="true" />
            Latest valid reading
          </dt>
          <dd>
            {reading.lastValidAt ? (
              <time dateTime={reading.lastValidAt}>{lastReadingText}</time>
            ) : (
              'Unavailable'
            )}
          </dd>
        </div>
      </dl>
    </article>
  )
}
