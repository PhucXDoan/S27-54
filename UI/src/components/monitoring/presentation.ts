import type {
  Alert,
  ConnectionStatus,
  Posture,
  RangeStatus,
  SensorStatus,
  SignalQuality,
  TrendDirection,
  VitalReading,
} from '../../types/monitoring'
import type { StatusBadgeTone } from './StatusBadge'

export const rangeStatusLabels: Record<RangeStatus, string> = {
  within: 'Within configured range',
  buffer: 'Outside range, within alert buffer',
  above: 'Beyond alert limit',
  below: 'Beyond alert limit',
  unavailable: 'Signal unavailable',
}

export const rangeStatusTones: Record<RangeStatus, StatusBadgeTone> = {
  within: 'positive',
  buffer: 'warning',
  above: 'critical',
  below: 'critical',
  unavailable: 'neutral',
}

export const signalQualityLabels: Record<SignalQuality, string> = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  unavailable: 'Unavailable',
}

export const signalQualityTones: Record<SignalQuality, StatusBadgeTone> = {
  good: 'positive',
  fair: 'warning',
  poor: 'critical',
  unavailable: 'neutral',
}

export const sensorStatusLabels: Record<SensorStatus, string> = {
  connected: 'Connected',
  degraded: 'Degraded',
  disconnected: 'Disconnected',
  unavailable: 'Unavailable',
}

export const sensorStatusTones: Record<SensorStatus, StatusBadgeTone> = {
  connected: 'positive',
  degraded: 'warning',
  disconnected: 'critical',
  unavailable: 'neutral',
}

export const postureLabels: Record<Posture, string> = {
  standing: 'Standing',
  'lying-sternally': 'Lying sternally',
  'lying-laterally': 'Lying laterally',
  changing: 'Changing posture',
  uncertain: 'Classification uncertain',
  unavailable: 'Motion sensor unavailable',
}

export const connectionStatusLabels: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  offline: 'Device offline',
}

export const connectionStatusTones: Record<ConnectionStatus, StatusBadgeTone> = {
  connected: 'positive',
  reconnecting: 'warning',
  offline: 'critical',
}

export const alertSeverityTones: Record<
  Alert['severity'],
  StatusBadgeTone
> = {
  critical: 'critical',
  warning: 'warning',
  info: 'info',
}

export const alertCategoryLabels: Record<Alert['category'], string> = {
  physiological: 'Physiological alert',
  equipment: 'Equipment alert',
  connection: 'Connection alert',
}

export function formatClockTime(isoTime: string | null) {
  if (!isoTime) return 'Unavailable'
  const date = new Date(isoTime)
  if (Number.isNaN(date.getTime())) return isoTime

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function createTrendAccessibleLabel(
  label: string,
  direction: TrendDirection,
  delta: number | null,
  unit: string,
  status: RangeStatus,
) {
  if (status === 'unavailable') return `${label} trend is unavailable.`

  const rangePhrase: Record<Exclude<RangeStatus, 'unavailable'>, string> = {
    within: 'remains within the configured range',
    buffer: 'is outside the configured range, within the alert buffer',
    above: 'is beyond the upper alert limit',
    below: 'is beyond the lower alert limit',
  }

  if (delta === null || !Number.isFinite(delta)) {
    return `${label} change is unavailable and ${rangePhrase[status]}.`
  }

  if (direction === 'stable') {
    return `${label} has no significant change and ${rangePhrase[status]}.`
  }

  const verb = direction === 'up' ? 'increased' : 'decreased'
  return `${label} ${verb} by ${Math.abs(delta)} ${unit} and ${rangePhrase[status]}.`
}

/** A retained or unreliable value must not imply a current physiological status. */
export function getReadingRangeStatus(reading: VitalReading): RangeStatus {
  if (
    reading.value === null ||
    !Number.isFinite(reading.value) ||
    reading.value < 0 ||
    reading.isStale ||
    reading.signalQuality === 'poor' ||
    reading.signalQuality === 'unavailable'
  ) {
    return 'unavailable'
  }

  return reading.status
}
