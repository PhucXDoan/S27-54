import { CheckCircle2, CircleDot, Filter } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import type { ActivityEvent } from '../../types/monitoring'
import { formatExactDateTime, formatExactTime } from '../../utils/formatters'
import styles from './HistoryTable.module.css'

type HistoryFilter = 'all' | ActivityEvent['category']

export interface HistoryTableProps {
  events: ActivityEvent[]
  initialFilter?: HistoryFilter
  title?: string
  description?: string
}

const filters: Array<{ id: HistoryFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'movement', label: 'Movement' },
  { id: 'clinical', label: 'Clinical alerts' },
  { id: 'equipment', label: 'Equipment & connection' },
  { id: 'staff', label: 'Staff actions' },
]

const categoryLabels: Record<ActivityEvent['category'], string> = {
  movement: 'Movement',
  clinical: 'Clinical alert',
  equipment: 'Equipment & connection',
  staff: 'Staff action',
}

const statusLabels: Record<ActivityEvent['status'], string> = {
  active: 'Active',
  resolved: 'Resolved',
  recorded: 'Recorded',
  acknowledged: 'Acknowledged',
}

function eventTitle(type: string) {
  return type.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function Acknowledgement({ event }: { event: ActivityEvent }) {
  if (!event.acknowledgedBy) {
    if (event.category === 'clinical' && event.status === 'active') {
      return <span className={styles.awaiting}>Awaiting acknowledgement</span>
    }

    return <span className={styles.notApplicable}>Not applicable</span>
  }

  return (
    <span className={styles.acknowledgement}>
      <CheckCircle2 aria-hidden="true" />
      <span>
        By {event.acknowledgedBy}
        {event.acknowledgedAt ? (
          <small> at {formatExactTime(event.acknowledgedAt)}</small>
        ) : null}
      </span>
    </span>
  )
}

export function HistoryTable({
  events,
  initialFilter = 'all',
  title = 'Event history',
  description = 'Movement, clinical, equipment, connection, and staff events for this patient.',
}: HistoryTableProps) {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>(initialFilter)
  const headingId = useId()
  const filteredEvents = useMemo(
    () =>
      [...events]
        .filter((event) => activeFilter === 'all' || event.category === activeFilter)
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
    [activeFilter, events],
  )

  return (
    <section className={styles.history} aria-labelledby={headingId}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Patient record</p>
          <h1 id={headingId}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.count} aria-label={`${filteredEvents.length} events shown`}>
          <strong>{filteredEvents.length}</strong>
          <span>events</span>
        </div>
      </header>

      <div className={styles.filters} role="group" aria-label="Filter event history">
        <span className={styles.filterLabel}>
          <Filter aria-hidden="true" />
          Filter
        </span>
        <div className={styles.filterScroller}>
          {filters.map((filter) => (
            <button
              aria-pressed={activeFilter === filter.id}
              className={activeFilter === filter.id ? styles.activeFilter : styles.filter}
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>
                Event history, newest event first
              </caption>
              <thead>
                <tr>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Event</th>
                  <th scope="col">Category</th>
                  <th scope="col">Status</th>
                  <th scope="col">Acknowledgement</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td className={styles.timestamp}>
                      <time dateTime={event.timestamp}>{formatExactDateTime(event.timestamp)}</time>
                    </td>
                    <td>
                      <strong className={styles.eventTitle}>{eventTitle(event.type)}</strong>
                      <span className={styles.eventDescription}>{event.description}</span>
                    </td>
                    <td>
                      <span className={`${styles.categoryBadge} ${styles[event.category]}`}>
                        {categoryLabels[event.category]}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[event.status]}`}>
                        <CircleDot aria-hidden="true" />
                        {statusLabels[event.status]}
                      </span>
                    </td>
                    <td>
                      <Acknowledgement event={event} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ol className={styles.timeline} aria-label="Event history, newest event first">
            {filteredEvents.map((event) => (
              <li className={styles.timelineItem} key={event.id}>
                <span className={`${styles.timelineMarker} ${styles[event.category]}`} aria-hidden="true" />
                <article>
                  <div className={styles.timelineTopline}>
                    <time dateTime={event.timestamp}>{formatExactDateTime(event.timestamp)}</time>
                    <span className={`${styles.status} ${styles[event.status]}`}>
                      {statusLabels[event.status]}
                    </span>
                  </div>
                  <h2>{eventTitle(event.type)}</h2>
                  <p>{event.description}</p>
                  <div className={styles.timelineMeta}>
                    <span className={`${styles.categoryBadge} ${styles[event.category]}`}>
                      {categoryLabels[event.category]}
                    </span>
                    <Acknowledgement event={event} />
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <div className={styles.empty} role="status">
          <Filter aria-hidden="true" />
          <strong>No matching events</strong>
          <span>Try another history filter.</span>
        </div>
      )}
    </section>
  )
}

