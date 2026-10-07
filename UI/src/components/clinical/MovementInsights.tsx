import { ArrowDownToLine, ArrowUpFromLine, Footprints, TimerReset } from 'lucide-react'
import { useMemo } from 'react'
import type { ActivityEvent, Posture } from '../../types/monitoring'
import { formatExactTime, formatPosture, formatRelativeTime } from '../../utils/formatters'
import styles from './MovementInsights.module.css'

export interface MovementInsightsProps {
  currentPosture: Posture
  events: ActivityEvent[]
  risesPastHour: number
  lastPostureChangeAt: string
  windowHours?: number
  now: number
  isStale?: boolean
}

type DistributionPosture = 'standing' | 'lying-sternally' | 'lying-laterally' | 'uncertain'

const distributionOrder: DistributionPosture[] = [
  'standing',
  'lying-sternally',
  'lying-laterally',
  'uncertain',
]

function normalizedPosture(posture: Posture): DistributionPosture {
  if (posture === 'standing' || posture === 'lying-sternally' || posture === 'lying-laterally') {
    return posture
  }
  return 'uncertain'
}

function inferPosture(event: ActivityEvent): DistributionPosture | null {
  const description = event.description.toLowerCase()
  if (event.type === 'stood-up' || description.includes('standing')) return 'standing'
  if (description.includes('laterally') || description.includes('lateral')) return 'lying-laterally'
  if (event.type === 'lay-down' || description.includes('sternally')) return 'lying-sternally'
  if (description.includes('uncertain')) return 'uncertain'
  return null
}

function precedingPosture(event: ActivityEvent): DistributionPosture {
  if (event.type === 'stood-up') return 'lying-sternally'
  if (event.type === 'lay-down') return 'standing'
  return 'uncertain'
}

function calculateDistribution(
  events: ActivityEvent[],
  currentPosture: Posture,
  now: number,
  windowHours: number,
) {
  const start = now - windowHours * 60 * 60 * 1000
  const transitions = events
    .filter((event) => event.category === 'movement')
    .map((event) => ({ event, at: Date.parse(event.timestamp), posture: inferPosture(event) }))
    .filter(
      (transition): transition is { event: ActivityEvent; at: number; posture: DistributionPosture } =>
        transition.posture !== null && Number.isFinite(transition.at) && transition.at >= start && transition.at <= now,
    )
    .sort((a, b) => a.at - b.at)

  const durations: Record<DistributionPosture, number> = {
    standing: 0,
    'lying-sternally': 0,
    'lying-laterally': 0,
    uncertain: 0,
  }

  if (transitions.length === 0) {
    durations[normalizedPosture(currentPosture)] = now - start
  } else {
    let activePosture = precedingPosture(transitions[0]!.event)
    let cursor = start
    transitions.forEach((transition) => {
      durations[activePosture] += Math.max(0, transition.at - cursor)
      activePosture = transition.posture
      cursor = transition.at
    })
    durations[activePosture] += Math.max(0, now - cursor)
  }

  const total = Math.max(Object.values(durations).reduce((sum, duration) => sum + duration, 0), 1)
  return distributionOrder.map((posture) => ({
    posture,
    minutes: Math.round(durations[posture] / 60_000),
    percent: Math.round((durations[posture] / total) * 100),
  }))
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder > 0 ? `${hours} hr ${remainder} min` : `${hours} hr`
}

function transitionTitle(event: ActivityEvent) {
  if (event.type === 'stood-up') return 'Stood up'
  if (event.type === 'lay-down') return 'Lay down'
  return 'Posture changed'
}

export function MovementInsights({
  currentPosture,
  events,
  risesPastHour,
  lastPostureChangeAt,
  windowHours = 6,
  now,
  isStale = false,
}: MovementInsightsProps) {
  const referenceTime = now
  const transitionEvents = useMemo(
    () =>
      [...events]
        .filter(
          (event) =>
            event.category === 'movement' &&
            (event.type === 'stood-up' || event.type === 'lay-down' || event.type === 'posture-changed'),
        )
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
        .slice(0, 8),
    [events],
  )
  const distribution = useMemo(
    () => calculateDistribution(events, currentPosture, referenceTime, windowHours),
    [currentPosture, events, referenceTime, windowHours],
  )

  return (
    <section className={styles.section} aria-labelledby="movement-details-heading">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Classified movement</p>
          <h2 id="movement-details-heading">Posture & transitions</h2>
          <p>
            {isStale
              ? 'Device offline. Posture and transition summaries are retained historical data.'
              : 'No raw accelerometer values are shown in this clinical view.'}
          </p>
        </div>
        <span className={styles.currentPosture}>
          <Footprints aria-hidden="true" />
          <span>
            <small>{isStale ? 'Last known posture · stale' : 'Current posture'}</small>
            <strong>{formatPosture(currentPosture)}</strong>
          </span>
        </span>
      </header>

      <div className={styles.summary}>
        <div>
          <ArrowUpFromLine aria-hidden="true" />
          <span>
            <strong>{risesPastHour}</strong>
            <small>rising events · past hour</small>
          </span>
        </div>
        <div>
          <TimerReset aria-hidden="true" />
          <span>
            <strong>{formatRelativeTime(lastPostureChangeAt, referenceTime)}</strong>
            <small>since last posture change</small>
          </span>
        </div>
        <div>
          <ArrowDownToLine aria-hidden="true" />
          <span>
            <strong>{transitionEvents.length}</strong>
            <small>recent classified transitions</small>
          </span>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <div>
              <h3>Posture distribution</h3>
              <p>Time classified during the past {windowHours} hours</p>
            </div>
          </div>
          <div className={styles.distribution}>
            {distribution.map((entry) => (
              <div className={styles.distributionRow} key={entry.posture}>
                <div className={styles.distributionLabel}>
                  <span>{formatPosture(entry.posture)}</span>
                  <strong>{formatDuration(entry.minutes)}</strong>
                </div>
                <div
                  aria-label={`${formatPosture(entry.posture)}: ${entry.percent}%`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={entry.percent}
                  className={styles.barTrack}
                  role="progressbar"
                >
                  <span
                    className={`${styles.barFill} ${styles[entry.posture]}`}
                    style={{ width: `${Math.max(entry.percent, entry.minutes > 0 ? 2 : 0)}%` }}
                  />
                </div>
                <span className={styles.percent}>{entry.percent}%</span>
              </div>
            ))}
          </div>
          <p className={styles.estimateNote}>
            Distribution is estimated from simulated classified posture transitions.
          </p>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <div>
              <h3>Transition timeline</h3>
              <p>Newest classified transition first</p>
            </div>
          </div>
          {transitionEvents.length > 0 ? (
            <ol className={styles.timeline}>
              {transitionEvents.map((event) => (
                <li key={event.id}>
                  <span
                    className={`${styles.timelineIcon} ${event.type === 'stood-up' ? styles.rise : styles.lie}`}
                    aria-hidden="true"
                  >
                    {event.type === 'stood-up' ? <ArrowUpFromLine /> : <ArrowDownToLine />}
                  </span>
                  <div>
                    <div className={styles.timelineTitle}>
                      <strong>{transitionTitle(event)}</strong>
                      <time dateTime={event.timestamp}>{formatExactTime(event.timestamp)}</time>
                    </div>
                    <p>{event.description}</p>
                    <small>{formatRelativeTime(event.timestamp, referenceTime)}</small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.emptyTimeline}>No posture transitions recorded in this period.</p>
          )}
        </div>
      </div>
    </section>
  )
}
