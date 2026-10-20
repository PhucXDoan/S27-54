import { cloneMonitoringSettings, validateMonitoringSettings } from '../config/monitoringSettings'
import type { Foal, MonitoringSettings } from '../types/monitoring'

export type MonitoringSettingsStorage = Pick<Storage, 'getItem' | 'setItem'>

export const monitoringSettingsStorageKey = (foalId: string, sessionId: string): string =>
  `foalwatch.monitoring-settings.v1:${encodeURIComponent(foalId)}:${encodeURIComponent(sessionId)}`

const browserStorage = (): MonitoringSettingsStorage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

const readSettings = (value: unknown): MonitoringSettings | null => {
  if (typeof value !== 'object' || value === null) return null
  const candidate = value as Partial<MonitoringSettings>
  // Older prototype settings without buffers retain their ranges and use zero.
  const normalized = {
    heartRate: { ...candidate.heartRate, buffer: candidate.heartRate?.buffer === undefined ? 0 : candidate.heartRate.buffer },
    respirationRate: { ...candidate.respirationRate, buffer: candidate.respirationRate?.buffer === undefined ? 0 : candidate.respirationRate.buffer },
  }
  return Object.keys(validateMonitoringSettings(normalized)).length === 0
    ? cloneMonitoringSettings(normalized as MonitoringSettings)
    : null
}

/** Prototype browser persistence for settings and drafts, scoped to a monitoring session. */
export class MonitoringSettingsStore {
  private readonly storage: MonitoringSettingsStorage | null
  private available: boolean

  constructor(storage?: MonitoringSettingsStorage | null) {
    this.storage = storage === undefined ? browserStorage() : storage
    this.available = this.storage !== null
  }

  getStatus = (): 'available' | 'unavailable' => this.available ? 'available' : 'unavailable'

  load(foal: Foal): Foal {
    if (!this.storage || !this.available) return foal
    try {
      const raw = this.storage.getItem(monitoringSettingsStorageKey(foal.id, foal.sessionId))
      if (!raw) return foal
      const record: unknown = JSON.parse(raw)
      if (typeof record !== 'object' || record === null) return foal
      const stored = record as Record<string, unknown>
      if (stored.version !== 1 || stored.foalId !== foal.id || stored.sessionId !== foal.sessionId) return foal
      return {
        ...foal,
        monitoringSettings: readSettings(stored.active) ?? foal.monitoringSettings,
        monitoringSettingsDraft: readSettings(stored.draft),
      }
    } catch (error) {
      // Malformed data should not disable otherwise available browser storage.
      if (!(error instanceof SyntaxError)) this.available = false
      return foal
    }
  }

  save(foal: Foal): void {
    if (!this.storage || !this.available) return
    try {
      this.storage.setItem(monitoringSettingsStorageKey(foal.id, foal.sessionId), JSON.stringify({
        version: 1,
        foalId: foal.id,
        sessionId: foal.sessionId,
        active: foal.monitoringSettings,
        draft: foal.monitoringSettingsDraft,
      }))
    } catch {
      this.available = false
    }
  }
}
