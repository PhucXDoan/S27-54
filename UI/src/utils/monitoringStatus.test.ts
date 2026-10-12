import { describe, expect, it } from 'vitest'
import { DEMONSTRATION_RANGES } from '../config/demonstrationRanges'
import {
  formatHeartRate,
  formatRelativeTime,
  formatRespirationRate,
  formatVitalDelta,
} from './formatters'
import { getRangeStatus, getTrendDirection, sortFoalsByPriority } from './monitoringStatus'
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

