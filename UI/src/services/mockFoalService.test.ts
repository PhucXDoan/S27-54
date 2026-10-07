import { describe, expect, it, vi } from 'vitest'
import { createMockFoalService } from './mockFoalService'

const clock = () => {
  let current = new Date('2026-10-07T14:00:00.000Z')
  return {
    now: () => new Date(current),
    advance: (milliseconds: number) => {
      current = new Date(current.getTime() + milliseconds)
    },
  }
}

describe('MockFoalService', () => {
  it('provides stable snapshots and notifies subscribers after a commit', () => {
    const time = clock()
    const service = createMockFoalService({ now: time.now, startOnSubscribe: false })
    const listener = vi.fn()
    const unsubscribe = service.subscribe(listener)
    const before = service.getSnapshot()

    expect(service.getSnapshot()).toBe(before)
    time.advance(4_000)
    service.advance()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(service.getSnapshot()).not.toBe(before)
    unsubscribe()
  })

  it('acknowledges an alert without clearing its active condition and records activity', () => {
    const time = clock()
    const service = createMockFoalService({ now: time.now, startOnSubscribe: false })
    const alert = service.getFoal('maple')?.alerts[0]
    expect(alert).toBeDefined()

    time.advance(2_000)
    expect(service.acknowledgeAlert('maple', alert!.id, 'Dr. Rivera')).toBe(true)

    const maple = service.getFoal('maple')!
    const acknowledged = maple.alerts.find((item) => item.id === alert!.id)!
    expect(acknowledged.status).toBe('active')
    expect(acknowledged.acknowledged).toBe(true)
    expect(acknowledged.acknowledgedBy).toBe('Dr. Rivera')
    expect(maple.activity.find((item) => item.alertId === alert!.id && item.category === 'clinical')).toMatchObject({
      status: 'acknowledged',
      acknowledgedBy: 'Dr. Rivera',
    })
    expect(maple.activity[0]).toMatchObject({
      type: 'alert-acknowledged',
      status: 'acknowledged',
      alertId: alert!.id,
      acknowledgedBy: 'Dr. Rivera',
    })
  })

  it('preserves the last values and timestamps while a device is offline', () => {
    const time = clock()
    const service = createMockFoalService({ now: time.now, startOnSubscribe: false })
    const before = service.getFoal('luna')!
    const lastHeartRate = before.measurement.heartRate.value
    const lastValidUpdate = before.lastValidUpdate

    expect(service.setScenario('luna', 'offline')).toBe(true)
    time.advance(12_000)
    service.advance()

    const offline = service.getFoal('luna')!
    expect(offline.connectionStatus).toBe('offline')
    expect(offline.measurement.heartRate.value).toBe(lastHeartRate)
    expect(offline.measurement.heartRate.isStale).toBe(true)
    expect(offline.measurement.respirationRate.isStale).toBe(true)
    expect(offline.lastValidUpdate).toBe(lastValidUpdate)
  })

  it('uses null—not zero—for an unavailable sensor and resumes smooth updates when restored', () => {
    const time = clock()
    const service = createMockFoalService({ now: time.now, startOnSubscribe: false })

    service.setScenario('luna', 'respUnavailable')
    expect(service.getFoal('luna')?.measurement.respirationRate.value).toBeNull()
    expect(service.getFoal('luna')?.measurement.respirationRate.status).toBe('unavailable')

    service.setScenario('luna', 'normal')
    const restored = service.getFoal('luna')!.measurement.heartRate.value!
    time.advance(4_000)
    service.advance()
    const next = service.getFoal('luna')!.measurement.heartRate.value!
    expect(Math.abs(next - restored)).toBeLessThanOrEqual(2)
  })

  it('marks the prior alert event resolved when a scenario condition clears', () => {
    const time = clock()
    const service = createMockFoalService({ now: time.now, startOnSubscribe: false })

    service.setScenario('luna', 'highHR')
    const alertId = service.getFoal('luna')!.alerts[0]!.id
    time.advance(4_000)
    service.setScenario('luna', 'normal')

    const luna = service.getFoal('luna')!
    expect(luna.alerts).toHaveLength(0)
    expect(luna.activity.find((item) => item.alertId === alertId)).toMatchObject({
      status: 'resolved',
    })
  })

  it('ages standing events out of the rolling one-hour count', () => {
    const time = clock()
    const service = createMockFoalService({ now: time.now, startOnSubscribe: false })

    expect(service.getFoal('luna')!.measurement.movement.risesPastHour).toBeGreaterThan(0)
    time.advance(2 * 60 * 60 * 1_000)
    service.advance()

    expect(service.getFoal('luna')!.measurement.movement.risesPastHour).toBe(0)
  })
})
