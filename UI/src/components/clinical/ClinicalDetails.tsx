import {
  Activity,
  ArrowLeft,
  Battery,
  CircleCheck,
  CircleOff,
  HeartPulse,
  LayoutGrid,
  Radio,
  Waves,
} from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { DEMONSTRATION_RANGES, DEMONSTRATION_RANGE_DISCLAIMER } from '../../config/demonstrationRanges'
import type { ElectrodeStatus, Foal, SensorStatus, SignalQuality, VitalReading } from '../../types/monitoring'
import {
  formatExactTime,
  formatPosture,
  formatRelativeTime,
  formatSignalQuality,
  formatVitalValue,
} from '../../utils/formatters'
import { MovementInsights } from './MovementInsights'
import { VitalTrendChart } from './VitalTrendChart'
import { WaveformChart } from './WaveformChart'
import styles from './ClinicalDetails.module.css'

export interface ClinicalDetailsProps {
  foal: Foal
  onBack?: () => void
  onOverview?: () => void
  backLabel?: string
}

const electrodeLabels: Record<ElectrodeStatus, string> = {
  connected: 'Electrodes connected',
  'poor-contact': 'Poor electrode contact',
  disconnected: 'Electrode disconnected',
  unavailable: 'Electrode status unavailable',
}

const sensorLabels: Record<SensorStatus, string> = {
  connected: 'Sensor connected',
  degraded: 'Sensor signal degraded',
  disconnected: 'Sensor disconnected',
  unavailable: 'Sensor unavailable',
}

function signalTone(quality: SignalQuality) {
  if (quality === 'good') return styles.good
  if (quality === 'fair') return styles.fair
  return styles.problem
}

function SignalStatus({
  quality,
  secondary,
}: {
  quality: SignalQuality
  secondary: string
}) {
  const Icon = quality === 'good' || quality === 'fair' ? CircleCheck : CircleOff
  return (
    <div className={`${styles.signalStatus} ${signalTone(quality)}`}>
      <Icon aria-hidden="true" />
      <span>
        <strong>{formatSignalQuality(quality)} signal</strong>
        <small>{secondary}</small>
      </span>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ 'aria-hidden'?: boolean }>
  label: string
  children: ReactNode
}) {
  return (
    <div className={styles.metric}>
      <Icon aria-hidden={true} />
      <span>
        <small>{label}</small>
        <strong>{children}</strong>
      </span>
    </div>
  )
}

function waveformDuration(points: Foal['clinicalSeries']['ecg']) {
  if (points.length < 2) return 0
  return Math.abs(points[points.length - 1]!.offsetSeconds - points[0]!.offsetSeconds)
}

function readingTime(reading: VitalReading) {
  return reading.lastValidAt ? formatExactTime(reading.lastValidAt) : 'No valid reading'
}

export function ClinicalDetails({
  foal,
  onBack,
  onOverview,
  backLabel = 'Back to monitor',
}: ClinicalDetailsProps) {
  const heartRate = foal.measurement.heartRate
  const respiration = foal.measurement.respirationRate
  const isOffline = foal.connectionStatus === 'offline'
  const connectionLabel =
    foal.connectionStatus === 'offline'
      ? 'Device offline'
      : foal.connectionStatus === 'reconnecting'
        ? 'Reconnecting'
        : 'Monitoring active'
  const heartRateIsStale = isOffline || heartRate.isStale
  const respirationIsStale = isOffline || respiration.isStale
  const ecgUnavailable =
    isOffline ||
    heartRate.signalQuality === 'unavailable' ||
    foal.electrodeStatus === 'disconnected' ||
    foal.electrodeStatus === 'unavailable'
  const respirationUnavailable =
    isOffline ||
    respiration.signalQuality === 'unavailable' ||
    foal.respirationSensorStatus === 'disconnected' ||
    foal.respirationSensorStatus === 'unavailable'
  const ecgDuration = waveformDuration(foal.clinicalSeries.ecg)
  const respirationDuration = waveformDuration(foal.clinicalSeries.respiration)

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerLead}>
          <div className={styles.headerNavigation}>
            {onBack ? (
              <button className={styles.backButton} onClick={onBack} type="button">
                <ArrowLeft aria-hidden="true" />
                {backLabel}
              </button>
            ) : null}
            {onOverview ? (
              <button className={styles.backButton} onClick={onOverview} type="button">
                <LayoutGrid aria-hidden="true" />
                All foals
              </button>
            ) : null}
          </div>
          <p className={styles.eyebrow}>Clinical details · simulated monitoring</p>
          <h1>{foal.name}</h1>
          <p className={styles.patientLine}>
            Patient {foal.patientId} <span aria-hidden="true">·</span> {foal.stall}
          </p>
        </div>
        <div className={styles.headerStatusGroup}>
          <div className={styles.updateSummary}>
            <span
              className={`${styles.connectionDot} ${
                isOffline
                  ? styles.offline
                  : foal.connectionStatus === 'reconnecting'
                    ? styles.reconnecting
                    : ''
              }`}
              aria-hidden="true"
            />
            <span>
              <strong>{connectionLabel}</strong>
              <small>Last valid update {formatRelativeTime(foal.lastValidUpdate)}</small>
            </span>
          </div>
          <div className={styles.batterySummary} aria-label={`Device battery ${foal.batteryPercentage}%`}>
            <Battery aria-hidden="true" />
            <span>
              <strong>{foal.batteryPercentage}% battery</strong>
              <small>Wearable device</small>
            </span>
          </div>
        </div>
      </header>

      <div className={styles.disclaimer} role="note">
        <Activity aria-hidden="true" />
        <span>
          <strong>Prototype monitoring view.</strong> {DEMONSTRATION_RANGE_DISCLAIMER} Waveforms are simulated and
          are not intended for diagnosis.
        </span>
      </div>

      {isOffline ? (
        <div className={styles.staleNotice} role="status">
          <CircleOff aria-hidden="true" />
          <span>
            <strong>Live monitoring is unavailable.</strong> Measurements, trends, and posture below
            are retained from the last valid update and are explicitly marked stale.
          </span>
        </div>
      ) : null}

      <section className={styles.waveformSection} aria-labelledby="ecg-details-heading">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Electrocardiogram</p>
            <h2 id="ecg-details-heading">
              {ecgUnavailable ? 'ECG waveform unavailable' : 'Live ECG waveform'}
            </h2>
            <p>Most recent {ecgDuration.toFixed(0)} seconds of simulated signal</p>
          </div>
          <SignalStatus
            quality={isOffline ? 'unavailable' : heartRate.signalQuality}
            secondary={isOffline ? 'Device offline · last known signal retained' : electrodeLabels[foal.electrodeStatus]}
          />
        </header>

        <div className={styles.metricRow}>
          <Metric icon={HeartPulse} label={heartRateIsStale ? 'Last valid heart rate' : 'Current heart rate'}>
            {formatVitalValue(heartRate.value, 'bpm', 'Unavailable')}
            {heartRateIsStale && heartRate.value !== null ? ' · stale' : ''}
          </Metric>
          <Metric icon={Radio} label="ECG signal quality">
            {isOffline ? 'Unavailable · device offline' : formatSignalQuality(heartRate.signalQuality)}
          </Metric>
          <Metric icon={Waves} label="Latest valid reading">
            {readingTime(heartRate)}
          </Metric>
        </div>

        <WaveformChart
          description={`Simulated ECG trace for ${foal.name}, covering the most recent ${ecgDuration.toFixed(0)} seconds. Current heart rate ${formatVitalValue(heartRate.value, 'bpm')}.`}
          isUnavailable={ecgUnavailable}
          kind="ecg"
          points={foal.clinicalSeries.ecg}
          title={`Live ECG waveform for ${foal.name}`}
        />
      </section>

      <section className={styles.waveformSection} aria-labelledby="respiration-details-heading">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Respiration</p>
            <h2 id="respiration-details-heading">
              {respirationUnavailable ? 'Respiration waveform unavailable' : 'Recent respiration waveform'}
            </h2>
            <p>Most recent {respirationDuration.toFixed(0)} seconds of simulated signal</p>
          </div>
          <SignalStatus
            quality={isOffline ? 'unavailable' : respiration.signalQuality}
            secondary={isOffline ? 'Device offline · last known signal retained' : sensorLabels[foal.respirationSensorStatus]}
          />
        </header>

        <div className={styles.metricRow}>
          <Metric
            icon={Waves}
            label={respirationIsStale ? 'Last valid respiration rate' : 'Current respiration rate'}
          >
            {formatVitalValue(respiration.value, 'breaths/min', 'Unavailable')}
            {respirationIsStale && respiration.value !== null ? ' · stale' : ''}
          </Metric>
          <Metric icon={Radio} label="Respiration signal quality">
            {isOffline
              ? 'Unavailable · device offline'
              : formatSignalQuality(respiration.signalQuality)}
          </Metric>
          <Metric icon={Activity} label="Latest valid reading">
            {readingTime(respiration)}
          </Metric>
        </div>

        <WaveformChart
          description={`Simulated respiration trace for ${foal.name}, covering the most recent ${respirationDuration.toFixed(0)} seconds. Current rate ${formatVitalValue(respiration.value, 'breaths/min')}.`}
          isUnavailable={respirationUnavailable}
          kind="respiration"
          points={foal.clinicalSeries.respiration}
          title={`Recent respiration waveform for ${foal.name}`}
        />
      </section>

      <section className={styles.trendSection} aria-labelledby="longer-trends-heading">
        <header className={styles.trendHeading}>
          <div>
            <p className={styles.eyebrow}>Calculated measurements</p>
            <h2 id="longer-trends-heading">Longer vital trends</h2>
          </div>
          <p>Rolling calculated values, not individual waveform samples</p>
        </header>
        <div className={styles.trendGrid}>
          <VitalTrendChart
            isStale={heartRateIsStale}
            kind="heartRate"
            points={foal.clinicalSeries.heartRateTrend}
            range={{
              minimum: DEMONSTRATION_RANGES.heartRate.min,
              maximum: DEMONSTRATION_RANGES.heartRate.max,
            }}
            title="Heart-rate trend"
            unit="bpm"
          />
          <VitalTrendChart
            isStale={respirationIsStale}
            kind="respiration"
            points={foal.clinicalSeries.respirationTrend}
            range={{
              minimum: DEMONSTRATION_RANGES.respirationRate.min,
              maximum: DEMONSTRATION_RANGES.respirationRate.max,
            }}
            title="Respiration-rate trend"
            unit="breaths/min"
          />
        </div>
      </section>

      <MovementInsights
        currentPosture={foal.measurement.movement.posture}
        events={foal.activity}
        lastPostureChangeAt={foal.measurement.movement.lastPostureChangeAt}
        risesPastHour={foal.measurement.movement.risesPastHour}
        isStale={isOffline}
        now={Date.parse(foal.measurement.timestamp)}
      />

      <footer className={styles.footerNote}>
        <span>
          {isOffline ? 'Last known posture (stale)' : 'Current posture'}:{' '}
          {formatPosture(foal.measurement.movement.posture)}
        </span>
        <span>Monitoring continues when this view is closed.</span>
      </footer>
    </main>
  )
}
