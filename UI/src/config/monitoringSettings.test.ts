import { describe, expect, it } from 'vitest'
import { createDefaultMonitoringSettings, MONITORING_UI_BOUNDS, validateMonitoringSettings } from './monitoringSettings'

describe('prototype monitoring settings validation', () => {
  it('starts with the existing ranges and zero buffers', () => {
    expect(createDefaultMonitoringSettings()).toEqual({
      heartRate: { min: 60, max: 120, buffer: 0 },
      respirationRate: { min: 20, max: 50, buffer: 0 },
    })
    expect(validateMonitoringSettings(createDefaultMonitoringSettings())).toEqual({})
  })

  it('returns field errors for empty, crossed, out-of-bounds, fractional, and negative entries', () => {
    const settings = createDefaultMonitoringSettings()
    settings.heartRate = { min: NaN, max: MONITORING_UI_BOUNDS.heartRate.max + 1, buffer: -1 }
    settings.respirationRate = { min: 55, max: 50, buffer: 0.5 }
    expect(validateMonitoringSettings(settings)).toMatchObject({
      'heartRate.min': 'Enter a number.',
      'heartRate.max': 'Enter a value from 0 to 240.',
      'heartRate.buffer': 'Enter a value from 0 to 100.',
      'respirationRate.min': 'Lower limit must be smaller than upper limit.',
      'respirationRate.max': 'Upper limit must be greater than lower limit.',
      'respirationRate.buffer': 'Use steps of 1.',
    })
    expect(Object.keys(validateMonitoringSettings(null))).toHaveLength(6)
  })

  it('accepts inclusive UI limits and refuses equal range limits or excess buffers', () => {
    const settings = createDefaultMonitoringSettings()
    settings.heartRate = { min: 0, max: 240, buffer: 100 }
    settings.respirationRate = { min: 0, max: 120, buffer: 60 }
    expect(validateMonitoringSettings(settings)).toEqual({})
    settings.heartRate.min = settings.heartRate.max
    settings.respirationRate.buffer = 61
    expect(validateMonitoringSettings(settings)).toHaveProperty('heartRate.min')
    expect(validateMonitoringSettings(settings)).toHaveProperty('respirationRate.buffer')
  })
})
