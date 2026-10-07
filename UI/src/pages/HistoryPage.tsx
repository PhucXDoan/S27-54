import { useNavigate } from 'react-router-dom'

import { HistoryTable } from '../components/activity'
import { ConnectionBar } from '../components/monitoring'
import type { Foal } from '../types/monitoring'
import { formatExactTime, formatRelativeTime } from '../utils/formatters'

import './HistoryPage.css'

interface HistoryPageProps {
  foal: Foal
  now?: Date
}

export function HistoryPage({ foal, now = new Date() }: HistoryPageProps) {
  const navigate = useNavigate()

  return (
    <main className="history-page">
      <ConnectionBar
        status={foal.connectionStatus}
        batteryPercentage={foal.batteryPercentage}
        lastValidUpdate={foal.lastValidUpdate}
        lastUpdateLabel={`${formatExactTime(foal.lastValidUpdate)} · ${formatRelativeTime(
          foal.lastValidUpdate,
          now,
        )}`}
        onBack={() => navigate(`/foals/${foal.id}`)}
        backLabel="Back to monitor"
        title={`${foal.name} / Full history`}
      />
      <HistoryTable
        events={foal.activity}
        title={`${foal.name} event history`}
        description={`Patient ${foal.patientId} · ${foal.stall}. Movement, clinical, equipment, connection, and staff events.`}
      />
    </main>
  )
}
