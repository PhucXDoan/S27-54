import type {
  ConnectionStatus,
  Posture,
  RangeStatus,
  SignalQuality,
  VitalUnit,
} from '../types/monitoring'

export type DateInput = string | number | Date

const toDate = (value: DateInput): Date => (value instanceof Date ? value : new Date(value))

const isValidDate = (value: Date): boolean => !Number.isNaN(value.getTime())

export const formatExactTime = (value: DateInput, locale = 'en-US'): string => {
  const date = toDate(value)
  if (!isValidDate(date)) return 'Time unavailable'
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export const formatExactDateTime = (value: DateInput, locale = 'en-US'): string => {
  const date = toDate(value)
  if (!isValidDate(date)) return 'Time unavailable'
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export const formatRelativeTime = (value: DateInput, now: DateInput = Date.now()): string => {
  const date = toDate(value)
  const reference = toDate(now)
  if (!isValidDate(date) || !isValidDate(reference)) return 'Time unavailable'

  const differenceSeconds = Math.round((date.getTime() - reference.getTime()) / 1_000)
  const absoluteSeconds = Math.abs(differenceSeconds)

  if (absoluteSeconds < 5) return 'just now'

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: 'year', seconds: 365 * 24 * 60 * 60 },
    { unit: 'month', seconds: 30 * 24 * 60 * 60 },
    { unit: 'day', seconds: 24 * 60 * 60 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ]
  const selected = units.find(({ seconds }) => absoluteSeconds >= seconds) ?? units[units.length - 1]
  if (!selected) return 'just now'
  const amount = Math.round(differenceSeconds / selected.seconds)
  return new Intl.RelativeTimeFormat('en', { numeric: 'always' }).format(amount, selected.unit)
}

export const formatActivityTime = (
  value: DateInput,
  now: DateInput = Date.now(),
  locale = 'en-US',
): string => `${formatExactTime(value, locale)} — ${formatRelativeTime(value, now)}`

export const formatVitalValue = (
  value: number | null,
  unit: VitalUnit,
  unavailableLabel = 'Unavailable',
): string => (value === null || !Number.isFinite(value) ? unavailableLabel : `${Math.round(value)} ${unit}`)

export const formatHeartRate = (value: number | null): string =>
  formatVitalValue(value, 'bpm', 'Heart rate unavailable')

export const formatRespirationRate = (value: number | null): string =>
  formatVitalValue(value, 'breaths/min', 'Respiration unavailable')

export const formatVitalDelta = (delta: number | null, unit: VitalUnit): string => {
  if (delta === null || Math.abs(delta) <= 1) return 'No significant change'
  const rounded = Math.round(delta)
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)} ${unit}`
}

export const formatRangeStatus = (status: RangeStatus): string => {
  const labels: Record<RangeStatus, string> = {
    within: 'Within configured range',
    above: 'Above configured range',
    below: 'Below configured range',
    unavailable: 'Signal unavailable',
  }
  return labels[status]
}

export const formatPosture = (posture: Posture): string => {
  const labels: Record<Posture, string> = {
    standing: 'Standing',
    'lying-sternally': 'Lying sternally',
    'lying-laterally': 'Lying laterally',
    changing: 'Changing posture',
    uncertain: 'Classification uncertain',
    unavailable: 'Motion sensor unavailable',
  }
  return labels[posture]
}

export const formatSignalQuality = (quality: SignalQuality): string => {
  const labels: Record<SignalQuality, string> = {
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    unavailable: 'Unavailable',
  }
  return labels[quality]
}

export const formatConnectionStatus = (status: ConnectionStatus): string => {
  const labels: Record<ConnectionStatus, string> = {
    connected: 'Connected',
    reconnecting: 'Reconnecting',
    offline: 'Device offline',
  }
  return labels[status]
}

export const formatBattery = (percentage: number): string =>
  `${Math.max(0, Math.min(100, Math.round(percentage)))}%`

export const formatAge = (dateOfBirth: DateInput, now: DateInput = Date.now()): string => {
  const birth = toDate(dateOfBirth)
  const reference = toDate(now)
  if (!isValidDate(birth) || !isValidDate(reference)) return 'Age unavailable'
  const hours = Math.max(0, Math.floor((reference.getTime() - birth.getTime()) / 3_600_000))
  if (hours < 48) return `${hours} ${hours === 1 ? 'hour' : 'hours'} old`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} old`
}

