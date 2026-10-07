import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  FileClock,
  Gauge,
  HeartPulse,
  Radio,
  Settings2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { RecentActivity } from '../components/activity'
import {
  AlertList,
  ConnectionBar,
  MovementCard,
  PatientIdentity,
  StatusBadge,
  VitalSignCard,
} from '../components/monitoring'
import {
  DEMONSTRATION_RANGES,
  DEMONSTRATION_RANGE_DISCLAIMER,
} from '../config/demonstrationRanges'
import type { Foal } from '../types/monitoring'
import {
  formatAge,
  formatExactTime,
  formatRelativeTime,
  formatSignalQuality,
} from '../utils/formatters'

import './MonitorPage.css'

interface MonitorPageProps {
  foal: Foal
  onAcknowledgeAlert: (alertId: string) => void
  now?: Date
}

function statusTone(status: string) {
  if (status === 'connected' || status === 'good') return 'positive' as const
  if (status === 'degraded' || status === 'fair' || status === 'poor') return 'warning' as const
  return 'critical' as const
}

export function MonitorPage({ foal, onAcknowledgeAlert, now = new Date() }: MonitorPageProps) {
  const navigate = useNavigate()
  const activeAlerts = foal.alerts.filter((alert) => alert.status === 'active')
  const movementIsStale = foal.connectionStatus === 'offline'

  return (
    <main className="monitor-page">
      <ConnectionBar
        status={foal.connectionStatus}
        batteryPercentage={foal.batteryPercentage}
        lastValidUpdate={foal.lastValidUpdate}
        lastUpdateLabel={`${formatExactTime(foal.lastValidUpdate)} · ${formatRelativeTime(
          foal.lastValidUpdate,
          now,
        )}`}
        onBack={() => navigate('/')}
        title={`${foal.name} / Live monitor`}
        actions={
          <button
            className="monitor-page__history-link"
            type="button"
            onClick={() => navigate(`/foals/${foal.id}/history`)}
          >
            <FileClock aria-hidden="true" /> History
          </button>
        }
      />

      {foal.connectionStatus === 'offline' && (
        <div className="monitor-page__offline" role="alert">
          <Radio aria-hidden="true" />
          <div>
            <strong>DEVICE OFFLINE</strong>
            <span>
              No new measurements are being received. Values below are the last known readings and
              are marked stale.
            </span>
          </div>
        </div>
      )}

      <div className="monitor-page__grid">
        <div className="monitor-page__primary">
          <AlertList
            alerts={activeAlerts}
            getStartTimeLabel={(alert) =>
              `${formatExactTime(alert.startedAt)} · ${formatRelativeTime(alert.startedAt, now)}`
            }
            getAcknowledgementLabel={(alert) =>
              alert.acknowledgedAt
                ? `Acknowledged by ${alert.acknowledgedBy ?? 'staff'} at ${formatExactTime(
                    alert.acknowledgedAt,
                  )}. Condition remains active.`
                : undefined
            }
            onAcknowledge={onAcknowledgeAlert}
            onOpenDetails={() => navigate(`/foals/${foal.id}/clinical`)}
          />

          <section className="monitor-page__vitals" aria-label="Current vital signs">
            <VitalSignCard
              label="Heart rate"
              reading={foal.measurement.heartRate}
              signalLabel="ECG signal"
              latestReadingLabel={formatExactTime(foal.measurement.heartRate.lastValidAt ?? '')}
              unavailableMessage="Heart rate unavailable"
              unavailableHint="Check ECG electrode contact."
              staleMessage="Previous heart rate — stale"
            />
            <VitalSignCard
              label="Respiration rate"
              reading={foal.measurement.respirationRate}
              signalLabel="Respiration signal"
              latestReadingLabel={formatExactTime(foal.measurement.respirationRate.lastValidAt ?? '')}
              unavailableMessage="Respiration unavailable"
              unavailableHint="Check the respiration sensor connection."
              staleMessage="Previous respiration rate — stale"
            />
          </section>

          <MovementCard
            movement={foal.measurement.movement}
            isStale={movementIsStale}
            lastPostureChangeLabel={formatRelativeTime(
              foal.measurement.movement.lastPostureChangeAt,
              now,
            )}
            lastStandingLabel={
              foal.measurement.movement.lastStandAt
                ? `Stood up ${formatRelativeTime(foal.measurement.movement.lastStandAt, now)}`
                : undefined
            }
          />

          <button
            className="clinical-details-cta"
            type="button"
            onClick={() => navigate(`/foals/${foal.id}/clinical`)}
          >
            <span className="clinical-details-cta__icon">
              <Activity aria-hidden="true" />
            </span>
            <span>
              <strong>View clinical details and waveforms</strong>
              <small>ECG, respiration, longer trends, and movement transitions</small>
            </span>
            <ArrowUpRight aria-hidden="true" />
          </button>

          <RecentActivity
            events={foal.activity}
            onViewFullHistory={() => navigate(`/foals/${foal.id}/history`)}
            maxItems={7}
          />
        </div>

        <aside className="monitor-page__rail" aria-label="Patient and sensor details">
          <PatientIdentity foal={foal} ageLabel={formatAge(foal.dateOfBirth, now)} />

          <section className="sensor-summary panel" aria-labelledby="sensor-summary-title">
            <div className="sensor-summary__heading">
              <div>
                <p className="eyebrow">Device health</p>
                <h2 id="sensor-summary-title">Sensors</h2>
              </div>
              <Gauge aria-hidden="true" />
            </div>
            <dl>
              <div>
                <dt>
                  <HeartPulse aria-hidden="true" /> ECG electrode
                </dt>
                <dd>
                  <StatusBadge tone={statusTone(foal.electrodeStatus)}>
                    {foal.electrodeStatus === 'poor-contact'
                      ? 'Poor contact'
                      : foal.electrodeStatus.charAt(0).toUpperCase() + foal.electrodeStatus.slice(1)}
                  </StatusBadge>
                </dd>
              </div>
              <div>
                <dt>
                  <Activity aria-hidden="true" /> ECG quality
                </dt>
                <dd>
                  <StatusBadge tone={statusTone(foal.measurement.heartRate.signalQuality)}>
                    {formatSignalQuality(foal.measurement.heartRate.signalQuality)}
                  </StatusBadge>
                </dd>
              </div>
              <div>
                <dt>
                  <Radio aria-hidden="true" /> Respiration
                </dt>
                <dd>
                  <StatusBadge tone={statusTone(foal.respirationSensorStatus)}>
                    {foal.respirationSensorStatus.charAt(0).toUpperCase() +
                      foal.respirationSensorStatus.slice(1)}
                  </StatusBadge>
                </dd>
              </div>
              <div>
                <dt>
                  <CircleDot aria-hidden="true" /> Movement
                </dt>
                <dd>
                  <StatusBadge tone={statusTone(foal.measurement.movement.sensorStatus)}>
                    {foal.measurement.movement.sensorStatus.charAt(0).toUpperCase() +
                      foal.measurement.movement.sensorStatus.slice(1)}
                  </StatusBadge>
                </dd>
              </div>
            </dl>
          </section>

          <section className="range-summary panel" aria-labelledby="range-summary-title">
            <div className="range-summary__heading">
              <Settings2 aria-hidden="true" />
              <div>
                <p className="eyebrow">Prototype configuration</p>
                <h2 id="range-summary-title">Demonstration ranges</h2>
              </div>
            </div>
            <dl>
              <div>
                <dt>Heart rate</dt>
                <dd>
                  {DEMONSTRATION_RANGES.heartRate.min}–{DEMONSTRATION_RANGES.heartRate.max} bpm
                </dd>
              </div>
              <div>
                <dt>Respiration</dt>
                <dd>
                  {DEMONSTRATION_RANGES.respirationRate.min}–
                  {DEMONSTRATION_RANGES.respirationRate.max} breaths/min
                </dd>
              </div>
            </dl>
            <p>
              <CheckCircle2 aria-hidden="true" /> {DEMONSTRATION_RANGE_DISCLAIMER}
            </p>
          </section>
        </aside>
      </div>
    </main>
  )
}
