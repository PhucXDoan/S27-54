import { describe, expect, it, vi } from 'vitest'
import { createMockFoalService } from './mockFoalService'
import { createDefaultMonitoringSettings } from '../config/monitoringSettings'
import { createInitialFoals } from '../data/mockFoals'
import { monitoringSettingsStorageKey, type MonitoringSettingsStorage } from './monitoringSettingsStorage'

const memoryStorage = (): MonitoringSettingsStorage => {
  const values = new Map<string, string>()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value) } }
}

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

  it('keeps a saved draft separate from active monitoring and isolated to its foal', () => {
    const time = clock()
    const service = createMockFoalService({ now: time.now, startOnSubscribe: false, storage: null })
    const pending = createDefaultMonitoringSettings()
    pending.heartRate.max = 80
    const before = service.getFoal('luna')!
    const mapleBefore = service.getFoal('maple')!

    expect(service.saveMonitoringSettingsDraft('luna', pending)).toBe(true)
    pending.heartRate.max = 75
    expect(service.getFoal('luna')!.monitoringSettingsDraft!.heartRate.max).toBe(80)
    expect(service.getFoal('luna')!.monitoringSettings).toEqual(before.monitoringSettings)
    expect(service.getFoal('luna')!.measurement).toBe(before.measurement)
    expect(service.getFoal('maple')).toBe(mapleBefore)
    expect(service.getSettingsPersistenceStatus()).toBe('unavailable')
  })

  it('applies immediately, clears the draft, and records old/new settings for the session without changing measurements', () => {
    const time = clock()
    const service = createMockFoalService({ now: time.now, startOnSubscribe: false, storage: null })
    const pending = createDefaultMonitoringSettings()
    pending.heartRate.max = 80
    service.saveMonitoringSettingsDraft('luna', pending)
    const before = service.getFoal('luna')!
    const mapleBefore = service.getFoal('maple')!
    time.advance(1_000)
    expect(service.applyMonitoringSettings('luna', pending)).toBe(true)
    const after = service.getFoal('luna')!
    expect(after.monitoringSettings).toEqual(pending)
    expect(after.monitoringSettingsDraft).toBeNull()
    expect(after.measurement.heartRate).toEqual({ ...before.measurement.heartRate, status: 'above' })
    expect(after.clinicalSeries).toBe(before.clinicalSeries)
    expect(after.alerts.some((item) => item.kind === 'high-heart-rate')).toBe(true)
    expect(after.activity[0]).toMatchObject({
      type: 'monitoring-settings-applied',
      foalId: 'luna',
      sessionId: after.sessionId,
      timestamp: time.now().toISOString(),
      monitoringSettingsChange: { oldSettings: before.monitoringSettings, newSettings: pending },
    })
    expect(after.activity[0]!.description).toContain('no new measurement was taken')
    expect(service.getFoal('maple')).toBe(mapleBefore)
  })

  it('uses red eligibility, keeps acknowledgements, and resolves prior alert history when a buffer makes it amber', () => {
    const time = clock()
    const service = createMockFoalService({ now: time.now, startOnSubscribe: false, storage: null })
    const originalAlert = service.getFoal('maple')!.alerts[0]!
    service.acknowledgeAlert('maple', originalAlert.id, 'Test clinician')
    expect(service.applyMonitoringSettings('maple', createDefaultMonitoringSettings())).toBe(true)
    expect(service.getFoal('maple')!.alerts[0]!.acknowledgedBy).toBe('Test clinician')

    const buffered = createDefaultMonitoringSettings()
    buffered.respirationRate.buffer = 8
    service.applyMonitoringSettings('maple', buffered)
    const maple = service.getFoal('maple')!
    expect(maple.measurement.respirationRate.value).toBe(58)
    expect(maple.measurement.respirationRate.status).toBe('buffer')
    expect(maple.alerts.filter((item) => item.category === 'physiological')).toHaveLength(0)
    expect(maple.activity.find((item) => item.alertId === originalAlert.id)).toMatchObject({ status: 'resolved' })
    expect(maple.activity.find((item) => item.alertId === originalAlert.id)!.description).toContain('updated monitoring settings')
  })

  it('keeps scenario measurement targets independent of ranges and evaluates again on each tick', () => {
    const time = clock()
    const service = createMockFoalService({ now: time.now, startOnSubscribe: false, storage: null })
    const control = createMockFoalService({ now: time.now, startOnSubscribe: false, storage: null })
    const settings = createDefaultMonitoringSettings()
    settings.heartRate = { min: 60, max: 100, buffer: 30 }
    service.applyMonitoringSettings('luna', settings)
    service.setScenario('luna', 'highHR')
    control.setScenario('luna', 'highHR')
    expect(service.getFoal('luna')!.measurement.heartRate.value).toBe(128)
    expect(service.getFoal('luna')!.measurement.heartRate.status).toBe('buffer')
    expect(service.getFoal('luna')!.alerts).toHaveLength(0)
    for (let tick = 0; tick < 4; tick += 1) {
      time.advance(4_000)
      service.advance()
      control.advance()
      expect(service.getFoal('luna')!.measurement.heartRate.value).toBe(control.getFoal('luna')!.measurement.heartRate.value)
      expect(service.getFoal('luna')!.measurement.heartRate.status).toBe('buffer')
      expect(service.getFoal('luna')!.alerts).toHaveLength(0)
    }
    settings.heartRate.buffer = 0
    service.applyMonitoringSettings('luna', settings)
    expect(service.getFoal('luna')!.measurement.heartRate.status).toBe('above')
    expect(service.getFoal('luna')!.alerts[0]!.kind).toBe('high-heart-rate')
  })

  it('keeps stale, poor-signal, missing, and invalid readings unavailable when applying settings', () => {
    for (const overrides of [{ isStale: true }, { signalQuality: 'poor' as const }, { value: null }, { value: NaN }]) {
      const initialFoals = createInitialFoals()
      initialFoals[0]!.measurement.heartRate = { ...initialFoals[0]!.measurement.heartRate, ...overrides }
      const service = createMockFoalService({ initialFoals, startOnSubscribe: false, storage: null })
      const settings = createDefaultMonitoringSettings()
      settings.heartRate.max = 70
      service.applyMonitoringSettings('luna', settings)
      expect(service.getFoal('luna')!.measurement.heartRate.status).toBe('unavailable')
      expect(service.getFoal('luna')!.alerts).toHaveLength(0)
    }
  })

  it('rejects invalid saves or applications without changing state', () => {
    const service = createMockFoalService({ startOnSubscribe: false, storage: null })
    const settings = createDefaultMonitoringSettings()
    settings.heartRate.min = settings.heartRate.max
    const before = service.getSnapshot()
    expect(service.applyMonitoringSettings('luna', settings)).toBe(false)
    expect(service.saveMonitoringSettingsDraft('luna', settings)).toBe(false)
    expect(service.applyMonitoringSettings('missing', createDefaultMonitoringSettings())).toBe(false)
    expect(service.getSnapshot()).toBe(before)
  })

  it('reloads active settings and a pending draft only for the matching foal/session', () => {
    const storage = memoryStorage()
    const service = createMockFoalService({ storage, startOnSubscribe: false })
    const active = createDefaultMonitoringSettings()
    active.heartRate.buffer = 10
    service.applyMonitoringSettings('luna', active)
    const pending = createDefaultMonitoringSettings()
    pending.respirationRate.max = 40
    service.saveMonitoringSettingsDraft('luna', pending)

    const restored = createMockFoalService({ storage, startOnSubscribe: false })
    expect(restored.getFoal('luna')!.monitoringSettings).toEqual(active)
    expect(restored.getFoal('luna')!.monitoringSettingsDraft).toEqual(pending)
    expect(restored.getFoal('maple')!.monitoringSettings).toEqual(createDefaultMonitoringSettings())
    expect(restored.getFoal('maple')!.monitoringSettingsDraft).toBeNull()

    restored.applyMonitoringSettings('luna', pending)
    expect(createMockFoalService({ storage, startOnSubscribe: false }).getFoal('luna')!.monitoringSettingsDraft).toBeNull()

    const nextSession = createInitialFoals()
    nextSession[0]!.sessionId = 'new-session'
    const fresh = createMockFoalService({ storage, initialFoals: nextSession, startOnSubscribe: false })
    expect(fresh.getFoal('luna')!.monitoringSettings).toEqual(createDefaultMonitoringSettings())
    expect(fresh.getFoal('luna')!.monitoringSettingsDraft).toBeNull()
  })

  it('ignores malformed or invalid stored settings and tolerates denied browser storage', () => {
    const storage = memoryStorage()
    const foal = createInitialFoals()[0]!
    const key = monitoringSettingsStorageKey(foal.id, foal.sessionId)
    storage.setItem(key, '{bad json')
    expect(createMockFoalService({ storage }).getFoal('luna')!.monitoringSettings).toEqual(createDefaultMonitoringSettings())
    storage.setItem(key, JSON.stringify({ version: 1, foalId: foal.id, sessionId: foal.sessionId, active: { heartRate: { min: 120, max: 60, buffer: 0 } } }))
    expect(createMockFoalService({ storage }).getFoal('luna')!.monitoringSettings).toEqual(createDefaultMonitoringSettings())
    const denied = createMockFoalService({
      storage: { getItem: () => { throw new Error('Denied') }, setItem: () => { throw new Error('Denied') } },
      startOnSubscribe: false,
    })
    expect(denied.saveMonitoringSettingsDraft('luna', createDefaultMonitoringSettings())).toBe(true)
    expect(denied.getFoal('luna')!.monitoringSettingsDraft).toEqual(createDefaultMonitoringSettings())
    expect(denied.getSettingsPersistenceStatus()).toBe('unavailable')

    const full = createMockFoalService({ storage: { getItem: () => null, setItem: () => { throw new Error('Quota') } } })
    expect(full.applyMonitoringSettings('luna', createDefaultMonitoringSettings())).toBe(true)
    expect(full.getSettingsPersistenceStatus()).toBe('unavailable')
  })

  it('loads stored ranges without a buffer using zero, while preserving an explicitly stored buffer', () => {
    const storage = memoryStorage()
    const foal = createInitialFoals()[0]!
    storage.setItem(monitoringSettingsStorageKey(foal.id, foal.sessionId), JSON.stringify({
      version: 1,
      foalId: foal.id,
      sessionId: foal.sessionId,
      active: { heartRate: { min: 65, max: 115 }, respirationRate: { min: 22, max: 45, buffer: 6 } },
      draft: null,
    }))
    const service = createMockFoalService({ storage, startOnSubscribe: false })
    expect(service.getFoal('luna')!.monitoringSettings).toEqual({
      heartRate: { min: 65, max: 115, buffer: 0 },
      respirationRate: { min: 22, max: 45, buffer: 6 },
    })
  })
})
