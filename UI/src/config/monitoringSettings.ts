import { DEMONSTRATION_RANGES } from './demonstrationRanges'
import type { MonitoringSettings, VitalKind } from '../types/monitoring'

/** Prototype UI bounds only; these are not clinically validated adjustment limits. */
export const MONITORING_UI_BOUNDS = {
  heartRate: { min: 0, max: 240, step: 1, bufferMax: 100 },
  respirationRate: { min: 0, max: 120, step: 1, bufferMax: 60 },
} as const

export type MonitoringSettingsErrors = Partial<
  Record<`${VitalKind}.${'min' | 'max' | 'buffer'}`, string>
>

export const createDefaultMonitoringSettings = (): MonitoringSettings => ({
  heartRate: { min: DEMONSTRATION_RANGES.heartRate.min, max: DEMONSTRATION_RANGES.heartRate.max, buffer: 0 },
  respirationRate: { min: DEMONSTRATION_RANGES.respirationRate.min, max: DEMONSTRATION_RANGES.respirationRate.max, buffer: 0 },
})

export const cloneMonitoringSettings = (settings: MonitoringSettings): MonitoringSettings => ({
  heartRate: { ...settings.heartRate },
  respirationRate: { ...settings.respirationRate },
})

export const validateMonitoringSettings = (settings: unknown): MonitoringSettingsErrors => {
  const errors: MonitoringSettingsErrors = {}
  const candidate = settings as Partial<MonitoringSettings> | null
  for (const kind of ['heartRate', 'respirationRate'] as const) {
    const range = candidate?.[kind]
    const bounds = MONITORING_UI_BOUNDS[kind]
    for (const field of ['min', 'max', 'buffer'] as const) {
      const value = range?.[field]
      const minimum = field === 'buffer' ? 0 : bounds.min
      const maximum = field === 'buffer' ? bounds.bufferMax : bounds.max
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        errors[`${kind}.${field}`] = 'Enter a number.'
      } else if (value < minimum || value > maximum) {
        errors[`${kind}.${field}`] = `Enter a value from ${minimum} to ${maximum}.`
      } else if (!Number.isInteger((value - minimum) / bounds.step)) {
        errors[`${kind}.${field}`] = `Use steps of ${bounds.step}.`
      }
    }
    if (range && Number.isFinite(range.min) && Number.isFinite(range.max) && range.min >= range.max) {
      errors[`${kind}.min`] = 'Lower limit must be smaller than upper limit.'
      errors[`${kind}.max`] = 'Upper limit must be greater than lower limit.'
    }
  }
  return errors
}
