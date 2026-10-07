import { Clock3, Footprints, Radio, RefreshCw } from 'lucide-react'

import type { MovementMeasurement } from '../../types/monitoring'
import { StatusBadge } from './StatusBadge'
import {
  formatClockTime,
  postureLabels,
  sensorStatusLabels,
  sensorStatusTones,
} from './presentation'

import './MovementCard.css'

export interface MovementCardProps {
  movement: MovementMeasurement
  lastPostureChangeLabel?: string
  lastStandingLabel?: string
  isStale?: boolean
  unavailableHint?: string
  className?: string
}

/** Presents interpreted movement events without exposing raw accelerometer axes. */
export function MovementCard({
  movement,
  lastPostureChangeLabel,
  lastStandingLabel,
  isStale = false,
  unavailableHint = 'Check the movement sensor connection.',
  className = '',
}: MovementCardProps) {
  const unavailable =
    movement.posture === 'unavailable' ||
    movement.sensorStatus === 'unavailable' ||
    movement.sensorStatus === 'disconnected'

  return (
    <article
      className={`monitor-movement-card ${isStale ? 'monitor-movement-card--stale' : ''} ${unavailable ? 'monitor-movement-card--unavailable' : ''} ${className}`.trim()}
      aria-labelledby="movement-card-title"
    >
      <div className="monitor-movement-card__header">
        <div>
          <span className="monitor-movement-card__eyebrow">Movement</span>
          <h2 id="movement-card-title">Posture &amp; transitions</h2>
        </div>
        <StatusBadge tone={sensorStatusTones[movement.sensorStatus]}>
          Motion sensor {sensorStatusLabels[movement.sensorStatus].toLowerCase()}
        </StatusBadge>
      </div>

      <div className="monitor-movement-card__current">
        <Footprints aria-hidden="true" />
        <div>
          <span>Current state</span>
          <strong>{postureLabels[movement.posture]}</strong>
        </div>
      </div>

      {unavailable && (
        <p className="monitor-movement-card__notice" role="status">
          {unavailableHint}
        </p>
      )}

      {isStale && (
        <p className="monitor-movement-card__stale" role="status">
          <Clock3 aria-hidden="true" />
          <strong>Last known movement state — stale</strong>
        </p>
      )}

      <dl className="monitor-movement-card__details">
        <div>
          <dt>
            <RefreshCw aria-hidden="true" />
            Last posture change
          </dt>
          <dd>
            <time dateTime={movement.lastPostureChangeAt}>
              {lastPostureChangeLabel ??
                formatClockTime(movement.lastPostureChangeAt)}
            </time>
          </dd>
        </div>
        <div>
          <dt>
            <Footprints aria-hidden="true" />
            Last standing event
          </dt>
          <dd>
            {movement.lastStandAt ? (
              <time dateTime={movement.lastStandAt}>
                {lastStandingLabel ??
                  `Stood up at ${formatClockTime(movement.lastStandAt)}`}
              </time>
            ) : (
              'No recent standing event'
            )}
          </dd>
        </div>
        <div>
          <dt>
            <Radio aria-hidden="true" />
            Rising events, past hour
          </dt>
          <dd className="monitor-movement-card__count">
            {unavailable ? 'Unavailable' : movement.risesPastHour}
          </dd>
        </div>
      </dl>
    </article>
  )
}
