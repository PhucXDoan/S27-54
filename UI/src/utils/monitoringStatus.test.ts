import { describe, expect, it } from 'vitest'
import { DEMONSTRATION_RANGES } from '../config/demonstrationRanges'
import {
  formatHeartRate,
  formatRelativeTime,
  formatRespirationRate,
  formatVitalDelta,
} from './formatters'
import { getRangeStatus, getReadingRangeStatus, getTrendDirection, sortFoalsByPriority } from './monitoringStatus'
import { createInitialFoals } from '../data/mockFoals'

describe('monitoring status mappings', () => {
  it('maps values at boundaries to within and null to unavailable', () => {
    const range = DEMONSTRATION_RANGES.heartRate
    expect(getRangeStatus(range.min, range)).toBe('within')
    expect(getRangeStatus(range.max, range)).toBe('within')
    expect(getRangeStatus(range.max + 1, range)).toBe('above')
    expect(getRangeStatus(range.min - 1, range)).toBe('below')
    expect(getRangeStatus(null, range)).toBe('unavailable')
  })

  it('uses a deadband for stable trends', () => {
    expect(getTrendDirection(83, 80, 1)).toBe('up')
    expect(getTrendDirection(77, 80, 1)).toBe('down')
    expect(getTrendDirection(81, 80, 1)).toBe('stable')
    expect(getTrendDirection(null, 80, 1)).toBe('stable')
  })

  it.each([
    [49, 'below'], [50, 'buffer'], [59, 'buffer'], [60, 'within'],
    [120, 'within'], [121, 'buffer'], [130, 'buffer'], [131, 'above'],
  ] as const)('evaluates %s against inclusive range and buffer boundaries as %s', (value, expected) => {
    expect(getRangeStatus(value, { min: 60, max: 120, buffer: 10 })).toBe(expected)
  })

  it('has no amber interval when the buffer is zero', () => {
    expect(getRangeStatus(59, { min: 60, max: 120, buffer: 0 })).toBe('below')
    expect(getRangeStatus(121, { min: 60, max: 120, buffer: 0 })).toBe('above')
  })

  it('keeps invalid, stale, and poor-signal readings unavailable', () => {
    const range = { min: 60, max: 120, buffer: 10 }
    for (const value of [null, NaN, Infinity, -1]) {
      expect(getRangeStatus(value, range)).toBe('unavailable')
    }
    const reading = createInitialFoals()[0]!.measurement.heartRate
    expect(getReadingRangeStatus({ ...reading, isStale: true }, range)).toBe('unavailable')
    expect(getReadingRangeStatus({ ...reading, signalQuality: 'poor' }, range)).toBe('unavailable')
    expect(getReadingRangeStatus({ ...reading, signalQuality: 'unavailable' }, range)).toBe('unavailable')
    expect(getReadingRangeStatus({ ...reading, signalQuality: 'fair' }, range)).toBe('within')
  })

  it('prioritizes clinical and equipment states ahead of normal monitoring', () => {
    const foals = createInitialFoals(new Date('2026-10-07T14:00:00.000Z'))
    expect(sortFoalsByPriority(foals).map((foal) => foal.id)).toEqual(['maple', 'orion', 'luna'])
  })
})

describe('monitoring formatters', () => {
  it('never renders a missing vital as zero', () => {
    expect(formatHeartRate(null)).toBe('Heart rate unavailable')
    expect(formatRespirationRate(null)).toBe('Respiration unavailable')
  })

  it('formats relative time and signed deltas for clinical display', () => {
    const now = new Date('2026-10-07T14:04:00.000Z')
    expect(formatRelativeTime('2026-10-07T14:00:00.000Z', now)).toBe('4 minutes ago')
    expect(formatVitalDelta(3, 'bpm')).toBe('+3 bpm')
    expect(formatVitalDelta(-2, 'bpm')).toBe('−2 bpm')
    expect(formatVitalDelta(1, 'bpm')).toBe('No significant change')
  })
})

