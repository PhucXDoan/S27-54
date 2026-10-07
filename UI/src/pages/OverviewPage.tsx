import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BatteryLow,
  CircleCheck,
  Footprints,
  HeartPulse,
  MapPin,
  RadioTower,
  ShieldAlert,
  WifiOff,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { DEMONSTRATION_RANGES } from '../config/demonstrationRanges'
import type { Alert, Foal } from '../types/monitoring'
import { formatPosture, formatRelativeTime } from '../utils/formatters'

import './OverviewPage.css'

interface OverviewPageProps {
  foals: Foal[]
  now?: Date
}

interface PatientState {
  label: string
  detail: string
  tone: 'normal' | 'warning' | 'critical' | 'offline'
  priority: number
}

function activeAlerts(foal: Foal): Alert[] {
  return foal.alerts.filter((alert) => alert.status === 'active')
}

function getPatientState(foal: Foal): PatientState {
  const alerts = activeAlerts(foal)
  const unacknowledgedClinical = alerts.find(
    (alert) => alert.category === 'physiological' && !alert.acknowledged,
  )
  const clinical = alerts.find((alert) => alert.category === 'physiological')
  const equipment = alerts.find(
    (alert) => alert.category === 'equipment' || alert.category === 'connection',
  )

  if (foal.connectionStatus === 'offline') {
    return {
      label: 'Device offline',
      detail: equipment?.title ?? 'No live measurements',
      tone: 'offline',
      priority: 40,
    }
  }

  if (unacknowledgedClinical) {
    return {
      label: 'Clinical alert',
      detail: unacknowledgedClinical.title,
      tone: 'critical',
      priority: 50,
    }
  }

  if (equipment) {
    return {
      label: 'Sensor attention',
      detail: equipment.title,
      tone: 'warning',
      priority: 35,
    }
  }

  if (clinical) {
    return {
      label: clinical.acknowledged ? 'Alert acknowledged' : 'Clinical alert',
      detail: clinical.title,
      tone: 'critical',
      priority: 30,
    }
  }

  if (foal.batteryPercentage <= DEMONSTRATION_RANGES.lowBatteryPercentage) {
    return {
      label: 'Low battery',
      detail: `${foal.batteryPercentage}% remaining`,
      tone: 'warning',
      priority: 25,
    }
  }

  return {
    label: 'Monitoring normally',
    detail: 'No active alerts',
    tone: 'normal',
    priority: 0,
  }
}

const stateIcons = {
  normal: CircleCheck,
  warning: ShieldAlert,
  critical: AlertTriangle,
  offline: WifiOff,
} as const

export function OverviewPage({ foals, now = new Date() }: OverviewPageProps) {
  const sortedFoals = [...foals].sort(
    (first, second) => getPatientState(second).priority - getPatientState(first).priority,
  )
  const alertCount = foals.reduce(
    (count, foal) => count + activeAlerts(foal).filter((alert) => !alert.acknowledged).length,
    0,
  )
  const attentionCount = foals.filter((foal) => getPatientState(foal).priority > 0).length
  const onlineCount = foals.filter((foal) => foal.connectionStatus === 'connected').length

  return (
    <main className="page-shell overview-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Equine neonatal unit</p>
          <h1 className="page-title">Patient board</h1>
          <p className="page-subtitle">
            A prioritized view of monitored foals, current measurements, and device status.
          </p>
        </div>
        <div className="overview-page__timestamp">
          <span>Board updated</span>
          <strong>
            {new Intl.DateTimeFormat(undefined, {
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
            }).format(now)}
          </strong>
        </div>
      </div>

      <div className="overview-summary" aria-label="Monitoring summary">
        <article>
          <span className="overview-summary__icon overview-summary__icon--teal">
            <RadioTower aria-hidden="true" />
          </span>
          <div>
            <strong>{foals.length}</strong>
            <span>Foals monitored</span>
          </div>
          <small>{onlineCount} connected</small>
        </article>
        <article>
          <span className="overview-summary__icon overview-summary__icon--red">
            <AlertTriangle aria-hidden="true" />
          </span>
          <div>
            <strong>{alertCount}</strong>
            <span>Unacknowledged</span>
          </div>
          <small>{alertCount === 0 ? 'No new alerts' : 'Review needed'}</small>
        </article>
        <article>
          <span className="overview-summary__icon overview-summary__icon--amber">
            <Activity aria-hidden="true" />
          </span>
          <div>
            <strong>{attentionCount}</strong>
            <span>Need attention</span>
          </div>
          <small>Clinical or equipment</small>
        </article>
      </div>

      <div className="notice overview-page__notice">
        <ShieldAlert aria-hidden="true" size={18} />
        <span>
          Prototype monitoring aid. Values and configurable demonstration ranges are simulated and
          are not clinically validated.
        </span>
      </div>

      <section className="patient-board" aria-labelledby="patient-board-title">
        <div className="section-heading">
          <div>
            <h2 id="patient-board-title">Monitored foals</h2>
            <p>Active alerts and equipment failures appear first.</p>
          </div>
          <span className="patient-board__legend">
            <span aria-hidden="true" /> Live simulated data
          </span>
        </div>

        <div className="patient-list">
          {sortedFoals.map((foal) => {
            const state = getPatientState(foal)
            const StateIcon = stateIcons[state.tone]
            const isDeviceOffline = foal.connectionStatus === 'offline'
            const heartRateIsStale =
              foal.measurement.heartRate.isStale && foal.measurement.heartRate.value !== null
            const respirationIsStale =
              foal.measurement.respirationRate.isStale &&
              foal.measurement.respirationRate.value !== null

            return (
              <Link
                className={`patient-row patient-row--${state.tone}`}
                to={`/foals/${foal.id}`}
                key={foal.id}
              >
                <span className="sr-only">Open monitor for {foal.name}. </span>
                <span className="patient-row__severity" aria-hidden="true" />
                <img className="patient-row__photo" src={foal.photoUrl} alt="" />

                <div className="patient-row__identity">
                  <div className="patient-row__name-line">
                    <h3>{foal.name}</h3>
                    <span>{foal.patientId}</span>
                  </div>
                  <p>Mare: {foal.mareName}</p>
                  <p>
                    <MapPin aria-hidden="true" /> {foal.stall}
                  </p>
                </div>

                <dl className="patient-row__measurements">
                  <div>
                    <dt>
                      <HeartPulse aria-hidden="true" /> Heart rate
                    </dt>
                    <dd>
                      {foal.measurement.heartRate.value === null ? (
                        <span className="patient-row__unavailable">Unavailable</span>
                      ) : (
                        <>
                          <strong>{foal.measurement.heartRate.value}</strong>
                          <span>bpm</span>
                          {heartRateIsStale && (
                            <span className="patient-row__stale-label">Stale</span>
                          )}
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Activity aria-hidden="true" /> Respiration
                    </dt>
                    <dd>
                      {foal.measurement.respirationRate.value === null ? (
                        <span className="patient-row__unavailable">Unavailable</span>
                      ) : (
                        <>
                          <strong>{foal.measurement.respirationRate.value}</strong>
                          <span>breaths/min</span>
                          {respirationIsStale && (
                            <span className="patient-row__stale-label">Stale</span>
                          )}
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Footprints aria-hidden="true" /> Posture
                    </dt>
                    <dd className="patient-row__posture">
                      {formatPosture(foal.measurement.movement.posture)}
                    </dd>
                  </div>
                </dl>

                <div className="patient-row__status">
                  <span className={`patient-row__status-pill patient-row__status-pill--${state.tone}`}>
                    <StateIcon aria-hidden="true" /> {state.label}
                  </span>
                  <strong>{state.detail}</strong>
                  <small>
                    {isDeviceOffline ? 'Last update ' : 'Updated '}
                    {formatRelativeTime(foal.lastValidUpdate, now)}
                  </small>
                  {foal.batteryPercentage <= DEMONSTRATION_RANGES.lowBatteryPercentage && (
                    <small className="patient-row__battery">
                      <BatteryLow aria-hidden="true" /> {foal.batteryPercentage}% battery
                    </small>
                  )}
                </div>

                <span className="patient-row__open" aria-hidden="true">
                  <ArrowRight />
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
