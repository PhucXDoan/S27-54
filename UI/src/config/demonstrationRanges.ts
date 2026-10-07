import type { VitalUnit } from '../types/monitoring'

export interface DemonstrationRange {
  min: number
  max: number
  unit: VitalUnit
  label: string
}

/**
 * CONFIGURABLE DEMONSTRATION RANGES ONLY.
 *
 * These placeholder values exist to exercise the prototype UI. They have not
 * been clinically validated or approved. A future settings/API layer should
 * replace this object without changing presentation components.
 */
export const DEMONSTRATION_RANGES = {
  heartRate: {
    min: 60,
    max: 120,
    unit: 'bpm',
    label: 'Configured demonstration range',
  },
  respirationRate: {
    min: 20,
    max: 50,
    unit: 'breaths/min',
    label: 'Configured demonstration range',
  },
  lowBatteryPercentage: 20,
  trendStableDelta: {
    heartRate: 1,
    respirationRate: 1,
  },
  staleAfterMs: 12_000,
  updateIntervalMs: 4_000,
  historyLimit: 100,
  trendPointLimit: 60,
} as const satisfies {
  heartRate: DemonstrationRange
  respirationRate: DemonstrationRange
  lowBatteryPercentage: number
  trendStableDelta: Record<'heartRate' | 'respirationRate', number>
  staleAfterMs: number
  updateIntervalMs: number
  historyLimit: number
  trendPointLimit: number
}

export const DEMONSTRATION_RANGE_DISCLAIMER =
  'Prototype demonstration ranges are configurable and are not clinically validated.'

