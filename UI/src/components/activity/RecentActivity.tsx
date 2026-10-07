import {
  Activity as ClinicalActivityIcon,
  Clock3,
  Move,
  Radio,
  UserRoundCheck,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { ActivityEvent } from '../../types/monitoring'
import { formatExactTime, formatRelativeTime } from '../../utils/formatters'
import styles from './RecentActivity.module.css'

export interface RecentActivityProps {
  events: ActivityEvent[]
  onViewFullHistory: () => void
  maxItems?: number
}

const categoryIcons: Record<ActivityEvent['category'], ComponentType<{ 'aria-hidden'?: boolean }>> = {
  movement: Move,
  clinical: ClinicalActivityIcon,
  equipment: Radio,
  staff: UserRoundCheck,
}

const categoryLabels: Record<ActivityEvent['category'], string> = {
  movement: 'Movement',
  clinical: 'Clinical alert',
  equipment: 'Equipment & connection',
  staff: 'Staff action',
}

function eventTitle(event: ActivityEvent) {
  return event.type
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function RecentActivity({
  events,
  onViewFullHistory,
  maxItems = 7,
}: RecentActivityProps) {
  const recentEvents = [...events]
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, maxItems)

  return (
    <section className={styles.card} aria-labelledby="recent-activity-heading">
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>Patient log</p>
          <h2 id="recent-activity-heading">Recent activity</h2>
        </div>
        <Clock3 className={styles.headingIcon} aria-hidden="true" />
      </div>

      {recentEvents.length > 0 ? (
        <ol className={styles.list}>
          {recentEvents.map((event) => {
            const Icon = categoryIcons[event.category]

            return (
              <li className={styles.item} key={event.id}>
                <span className={`${styles.icon} ${styles[event.category]}`}>
                  <Icon aria-hidden={true} />
                </span>
                <div className={styles.content}>
                  <div className={styles.eventHeading}>
                    <span className={styles.title}>{eventTitle(event)}</span>
                    <span className={styles.category}>{categoryLabels[event.category]}</span>
                  </div>
                  <p className={styles.description}>{event.description}</p>
                  <p className={styles.time}>
                    <time dateTime={event.timestamp}>{formatExactTime(event.timestamp)}</time>
                    <span aria-hidden="true"> · </span>
                    <span>{formatRelativeTime(event.timestamp)}</span>
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className={styles.empty}>No activity has been recorded for this monitoring session.</p>
      )}

      <button className={styles.historyButton} type="button" onClick={onViewFullHistory}>
        View full history
        <span aria-hidden="true">→</span>
      </button>
    </section>
  )
}

