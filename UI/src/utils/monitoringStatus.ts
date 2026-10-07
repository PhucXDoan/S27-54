import { DEMONSTRATION_RANGES, type DemonstrationRange } from '../config/demonstrationRanges'
import type {
  Alert,
  Foal,
  RangeStatus,
  ScenarioId,
  TrendDirection,
  VitalKind,
} from '../types/monitoring'

export type FoalOverallStatus = 'clinical-alert' | 'equipment-alert' | 'offline' | 'monitoring'

export const getRangeStatus = (
  value: number | null,
  range: Pick<DemonstrationRange, 'min' | 'max'>,
): RangeStatus => {
  if (value === null || !Number.isFinite(value)) return 'unavailable'
  if (value < range.min) return 'below'
  if (value > range.max) return 'above'
  return 'within'
}

export const getRangeForVital = (kind: VitalKind): DemonstrationRange =>
  kind === 'heartRate' ? DEMONSTRATION_RANGES.heartRate : DEMONSTRATION_RANGES.respirationRate

export const getTrendDirection = (
  current: number | null,
  previous: number | null,
  stableDelta = 1,
): TrendDirection => {
  if (current === null || previous === null) return 'stable'
  const delta = current - previous
  if (Math.abs(delta) <= stableDelta) return 'stable'
  return delta > 0 ? 'up' : 'down'
}

export const getActiveAlerts = (alerts: readonly Alert[]): Alert[] =>
  alerts.filter((item) => item.status === 'active')

export const getFoalOverallStatus = (foal: Foal): FoalOverallStatus => {
  if (foal.connectionStatus === 'offline') return 'offline'
  const alerts = getActiveAlerts(foal.alerts)
  if (alerts.some((item) => item.category === 'physiological')) return 'clinical-alert'
  if (alerts.some((item) => item.category === 'equipment' || item.category === 'connection')) {
    return 'equipment-alert'
  }
  return 'monitoring'
}

const PRIORITY: Record<FoalOverallStatus, number> = {
  'clinical-alert': 0,
  'equipment-alert': 1,
  offline: 1,
  monitoring: 2,
}

/** Stable sort for the overview: urgent clinical states, equipment/offline, then normal monitoring. */
export const sortFoalsByPriority = (foals: readonly Foal[]): Foal[] =>
  foals
    .map((foal, index) => ({ foal, index }))
    .sort((left, right) => {
      const priorityDifference =
        PRIORITY[getFoalOverallStatus(left.foal)] - PRIORITY[getFoalOverallStatus(right.foal)]
      return priorityDifference || left.index - right.index
    })
    .map(({ foal }) => foal)

export const isUnavailableScenario = (scenario: ScenarioId): boolean =>
  scenario === 'electrodeDisconnected' || scenario === 'respUnavailable' || scenario === 'offline'

