import { DEMONSTRATION_RANGES } from '../config/demonstrationRanges'
import {
  createClinicalSeries,
  createInitialFoals,
  DEFAULT_SCENARIO_BY_FOAL_ID,
  MOCK_SCENARIOS,
} from '../data/mockFoals'
import type {
  Activity,
  ActivityType,
  Alert,
  AlertKind,
  AlertSeverity,
  Foal,
  MonitoringListener,
  MonitoringSnapshot,
  RangeStatus,
  Scenario,
  ScenarioId,
  SignalQuality,
  VitalKind,
  VitalReading,
  VitalUnit,
} from '../types/monitoring'
import { getRangeForVital, getRangeStatus, getTrendDirection } from '../utils/monitoringStatus'

export interface MockFoalServiceOptions {
  initialFoals?: Foal[]
  initialScenarios?: Record<string, ScenarioId>
  updateIntervalMs?: number
  now?: () => Date
  startOnSubscribe?: boolean
}

const NORMAL_TARGETS: Record<string, { heartRate: number; respirationRate: number }> = {
  luna: { heartRate: 84, respirationRate: 30 },
  maple: { heartRate: 92, respirationRate: 34 },
  orion: { heartRate: 78, respirationRate: 26 },
}

const midpoint = (min: number, max: number): number => Math.round((min + max) / 2)

const normalTargetsFor = (foalId: string) =>
  NORMAL_TARGETS[foalId] ?? {
    heartRate: midpoint(DEMONSTRATION_RANGES.heartRate.min, DEMONSTRATION_RANGES.heartRate.max),
    respirationRate: midpoint(
      DEMONSTRATION_RANGES.respirationRate.min,
      DEMONSTRATION_RANGES.respirationRate.max,
    ),
  }

const cloneFoals = (foals: Foal[]): Foal[] => structuredClone(foals)

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const stepToward = (current: number, target: number, maximumStep: number): number => {
  const difference = target - current
  if (Math.abs(difference) <= maximumStep) return target
  return current + Math.sign(difference) * maximumStep
}

const buildReading = (
  kind: VitalKind,
  value: number,
  previousValue: number | null,
  timestamp: string,
  signalQuality: SignalQuality = 'good',
): VitalReading => {
  const stableDelta = DEMONSTRATION_RANGES.trendStableDelta[kind]
  const unit: VitalUnit = kind === 'heartRate' ? 'bpm' : 'breaths/min'
  return {
    value,
    previousValue,
    delta: previousValue === null ? 0 : value - previousValue,
    unit,
    trend: getTrendDirection(value, previousValue, stableDelta),
    status: getRangeStatus(value, getRangeForVital(kind)),
    signalQuality,
    lastValidAt: timestamp,
    isStale: false,
  }
}

const unavailableReading = (
  existing: VitalReading,
  signalQuality: SignalQuality = 'unavailable',
): VitalReading => ({
  ...existing,
  value: null,
  previousValue: existing.value ?? existing.previousValue,
  delta: null,
  trend: 'stable',
  status: 'unavailable',
  signalQuality,
  isStale: true,
})

const alertDetails = (
  foal: Foal,
  kind: AlertKind,
  startedAt: string,
  acknowledged = false,
): Alert => {
  const details: Record<
    AlertKind,
    {
      category: Alert['category']
      severity: AlertSeverity
      title: string
      message: string
    }
  > = {
    'high-heart-rate': {
      category: 'physiological',
      severity: 'critical',
      title: 'Heart rate above demonstration range',
      message: 'Heart rate is above the configured demonstration range.',
    },
    'low-heart-rate': {
      category: 'physiological',
      severity: 'critical',
      title: 'Heart rate below demonstration range',
      message: 'Heart rate is below the configured demonstration range.',
    },
    'high-respiration-rate': {
      category: 'physiological',
      severity: 'critical',
      title: 'Respiration above demonstration range',
      message: 'Respiration has remained above the configured demonstration range for 45 seconds.',
    },
    'low-respiration-rate': {
      category: 'physiological',
      severity: 'critical',
      title: 'Respiration below demonstration range',
      message: 'Respiration is below the configured demonstration range.',
    },
    'ecg-signal-unavailable': {
      category: 'equipment',
      severity: 'warning',
      title: 'ECG signal unavailable',
      message: 'ECG signal unavailable. Check electrode contact.',
    },
    'respiration-signal-unavailable': {
      category: 'equipment',
      severity: 'warning',
      title: 'Respiration signal unavailable',
      message: 'Respiration signal unavailable. Check sensor placement.',
    },
    'movement-sensor-unavailable': {
      category: 'equipment',
      severity: 'warning',
      title: 'Movement sensor unavailable',
      message: 'Movement classification is unavailable. Check the wearable position.',
    },
    'device-offline': {
      category: 'connection',
      severity: 'critical',
      title: 'Device offline',
      message: 'No current device updates. Previous measurements are marked stale.',
    },
    'low-battery': {
      category: 'equipment',
      severity: 'warning',
      title: 'Device battery low',
      message: 'Battery is below the configured demonstration threshold.',
    },
  }

  return {
    id: `scenario-${foal.id}-${kind}`,
    foalId: foal.id,
    kind,
    ...details[kind],
    startedAt,
    status: 'active',
    acknowledged,
    acknowledgedAt: acknowledged ? startedAt : null,
    acknowledgedBy: acknowledged ? 'Demo clinician' : null,
  }
}

const activityTypeForAlert = (kind: AlertKind): ActivityType => {
  const types: Partial<Record<AlertKind, ActivityType>> = {
    'high-heart-rate': 'high-heart-rate-alert',
    'low-heart-rate': 'low-heart-rate-alert',
    'high-respiration-rate': 'high-respiration-alert',
    'low-respiration-rate': 'low-respiration-alert',
    'ecg-signal-unavailable': 'electrode-disconnected',
    'respiration-signal-unavailable': 'respiration-sensor-unavailable',
    'device-offline': 'device-offline',
    'low-battery': 'low-battery',
  }
  return types[kind] ?? 'staff-note'
}

const activityCategoryForAlert = (alert: Alert): Activity['category'] => {
  if (alert.category === 'physiological') return 'clinical'
  return 'equipment'
}

const prependActivity = (foal: Foal, item: Activity): Foal => ({
  ...foal,
  activity: [item, ...foal.activity].slice(0, DEMONSTRATION_RANGES.historyLimit),
})

const markRelatedActivityAcknowledged = (
  foal: Foal,
  alertId: string,
  acknowledgedAt: string,
  acknowledgedBy: string,
): Foal => ({
  ...foal,
  activity: foal.activity.map((item) =>
    item.alertId === alertId
      ? {
          ...item,
          status: 'acknowledged',
          acknowledgedAt,
          acknowledgedBy,
        }
      : item,
  ),
})

const resolveRelatedAlertActivities = (foal: Foal): Foal => {
  const activeAlertIds = new Set(
    foal.alerts.filter((alert) => alert.status === 'active').map((alert) => alert.id),
  )
  if (activeAlertIds.size === 0) return foal

  return {
    ...foal,
    activity: foal.activity.map((item) =>
      item.alertId && activeAlertIds.has(item.alertId)
        ? { ...item, status: 'resolved' }
        : item,
    ),
  }
}

const makeActivity = (
  foal: Foal,
  timestamp: string,
  type: ActivityType,
  category: Activity['category'],
  description: string,
  status: Activity['status'] = 'recorded',
  alertId?: string,
): Activity => ({
  id: `activity-${foal.id}-${timestamp}-${type}`,
  foalId: foal.id,
  timestamp,
  type,
  category,
  description,
  status,
  ...(alertId ? { alertId } : {}),
})

const appendTrendPoint = (
  points: Foal['clinicalSeries']['heartRateTrend'],
  timestamp: string,
  value: number | null,
) => {
  if (value === null) return points
  return [...points, { timestamp, value }].slice(-DEMONSTRATION_RANGES.trendPointLimit)
}

const activeAlertForScenario = (scenario: ScenarioId): AlertKind | null => {
  const kinds: Partial<Record<ScenarioId, AlertKind>> = {
    highHR: 'high-heart-rate',
    lowHR: 'low-heart-rate',
    highResp: 'high-respiration-rate',
    electrodeDisconnected: 'ecg-signal-unavailable',
    respUnavailable: 'respiration-signal-unavailable',
    offline: 'device-offline',
    lowBattery: 'low-battery',
    unacknowledged: 'high-respiration-rate',
    acknowledged: 'high-respiration-rate',
  }
  return kinds[scenario] ?? null
}

const valuesForScenario = (
  foal: Foal,
  scenario: ScenarioId,
): { heartRate: number; respirationRate: number } => {
  const normal = normalTargetsFor(foal.id)
  switch (scenario) {
    case 'highHR':
      return { ...normal, heartRate: DEMONSTRATION_RANGES.heartRate.max + 8 }
    case 'lowHR':
      return { ...normal, heartRate: DEMONSTRATION_RANGES.heartRate.min - 8 }
    case 'highResp':
    case 'unacknowledged':
    case 'acknowledged':
      return { ...normal, respirationRate: DEMONSTRATION_RANGES.respirationRate.max + 8 }
    default:
      return normal
  }
}

const applyScenario = (foal: Foal, scenario: ScenarioId, timestamp: string): Foal => {
  const foalWithResolvedHistory = resolveRelatedAlertActivities(foal)
  const targets = valuesForScenario(foal, scenario)
  const previousConnection = foal.connectionStatus
  const previousElectrode = foal.electrodeStatus
  const previousRespirationSensor = foal.respirationSensorStatus
  const previousHeart = foal.measurement.heartRate.value ?? foal.measurement.heartRate.previousValue
  const previousRespiration =
    foal.measurement.respirationRate.value ?? foal.measurement.respirationRate.previousValue

  let next: Foal = {
    ...foalWithResolvedHistory,
    connectionStatus: 'connected',
    batteryPercentage:
      foal.batteryPercentage <= DEMONSTRATION_RANGES.lowBatteryPercentage ? 68 : foal.batteryPercentage,
    lastValidUpdate: timestamp,
    electrodeStatus: 'connected',
    respirationSensorStatus: 'connected',
    alerts: [],
    measurement: {
      ...foal.measurement,
      timestamp,
      heartRate: buildReading('heartRate', targets.heartRate, previousHeart, timestamp),
      respirationRate: buildReading(
        'respirationRate',
        targets.respirationRate,
        previousRespiration,
        timestamp,
      ),
      movement: {
        ...foal.measurement.movement,
        posture:
          foal.measurement.movement.posture === 'unavailable'
            ? 'standing'
            : foal.measurement.movement.posture,
        sensorStatus: 'connected',
      },
    },
  }

  if (scenario === 'electrodeDisconnected') {
    next = {
      ...next,
      connectionStatus: 'reconnecting',
      electrodeStatus: 'disconnected',
      measurement: {
        ...next.measurement,
        heartRate: unavailableReading(foal.measurement.heartRate),
      },
    }
  } else if (scenario === 'respUnavailable') {
    next = {
      ...next,
      respirationSensorStatus: 'unavailable',
      measurement: {
        ...next.measurement,
        respirationRate: unavailableReading(foal.measurement.respirationRate),
      },
    }
  } else if (scenario === 'offline') {
    next = {
      ...next,
      connectionStatus: 'offline',
      lastValidUpdate: foal.lastValidUpdate,
      measurement: {
        ...foal.measurement,
        heartRate: { ...foal.measurement.heartRate, isStale: true },
        respirationRate: { ...foal.measurement.respirationRate, isStale: true },
      },
      clinicalSeries: foal.clinicalSeries,
    }
  } else if (scenario === 'lowBattery') {
    next = { ...next, batteryPercentage: Math.max(5, DEMONSTRATION_RANGES.lowBatteryPercentage - 6) }
  }

  const alertKind = activeAlertForScenario(scenario)
  if (alertKind) {
    const acknowledged = scenario === 'acknowledged'
    const scenarioAlert = alertDetails(next, alertKind, timestamp, acknowledged)
    next = { ...next, alerts: [scenarioAlert] }
    next = prependActivity(
      next,
      makeActivity(
        next,
        timestamp,
        activityTypeForAlert(alertKind),
        activityCategoryForAlert(scenarioAlert),
        scenarioAlert.message,
        'active',
        scenarioAlert.id,
      ),
    )
    if (acknowledged) {
      next = markRelatedActivityAcknowledged(
        next,
        scenarioAlert.id,
        timestamp,
        'Demo clinician',
      )
      const acknowledgement = makeActivity(
        next,
        timestamp,
        'alert-acknowledged',
        'staff',
        `${scenarioAlert.title} acknowledged by Demo clinician; the condition remains active.`,
        'acknowledged',
        scenarioAlert.id,
      )
      acknowledgement.acknowledgedAt = timestamp
      acknowledgement.acknowledgedBy = 'Demo clinician'
      next = prependActivity(next, acknowledgement)
    }
  }

  if (previousConnection === 'offline' && scenario !== 'offline') {
    next = prependActivity(
      next,
      makeActivity(
        next,
        timestamp,
        'device-reconnected',
        'equipment',
        'Device reconnected and current monitoring resumed.',
        'resolved',
      ),
    )
  }

  if (
    (previousElectrode === 'disconnected' && scenario !== 'electrodeDisconnected') ||
    (previousRespirationSensor === 'unavailable' && scenario !== 'respUnavailable')
  ) {
    next = prependActivity(
      next,
      makeActivity(
        next,
        timestamp,
        'sensor-restored',
        'equipment',
        'Sensor signal restored and current monitoring resumed.',
        'resolved',
      ),
    )
  }

  if (scenario !== 'offline') {
    const freshSeries = createClinicalSeries(
      new Date(timestamp),
      next.measurement.heartRate.value ?? targets.heartRate,
      next.measurement.respirationRate.value ?? targets.respirationRate,
    )
    next = {
      ...next,
      clinicalSeries: {
        ecg: scenario === 'electrodeDisconnected' ? foal.clinicalSeries.ecg : freshSeries.ecg,
        respiration:
          scenario === 'respUnavailable' ? foal.clinicalSeries.respiration : freshSeries.respiration,
        heartRateTrend: appendTrendPoint(
          foal.clinicalSeries.heartRateTrend,
          timestamp,
          next.measurement.heartRate.value,
        ),
        respirationTrend: appendTrendPoint(
          foal.clinicalSeries.respirationTrend,
          timestamp,
          next.measurement.respirationRate.value,
        ),
      },
    }
  }

  return next
}

const advanceMovement = (foal: Foal, tick: number, timestamp: string): Foal => {
  const oneHourAgo = Date.parse(timestamp) - 60 * 60 * 1_000
  const recentRises = foal.activity.filter(
    (item) =>
      item.type === 'stood-up' &&
      Number.isFinite(Date.parse(item.timestamp)) &&
      Date.parse(item.timestamp) >= oneHourAgo,
  ).length
  const withCurrentRiseCount: Foal =
    recentRises === foal.measurement.movement.risesPastHour
      ? foal
      : {
          ...foal,
          measurement: {
            ...foal.measurement,
            movement: {
              ...foal.measurement.movement,
              risesPastHour: recentRises,
            },
          },
        }

  if (withCurrentRiseCount.measurement.movement.sensorStatus !== 'connected' || tick % 15 !== 0) {
    return withCurrentRiseCount
  }
  const current = withCurrentRiseCount.measurement.movement.posture
  const nextPosture = current === 'standing' ? 'lying-sternally' : 'standing'
  const stoodUp = nextPosture === 'standing'
  const next: Foal = {
    ...withCurrentRiseCount,
    measurement: {
      ...withCurrentRiseCount.measurement,
      movement: {
        ...withCurrentRiseCount.measurement.movement,
        previousPosture: current,
        posture: nextPosture,
        lastPostureChangeAt: timestamp,
        lastStandAt: stoodUp ? timestamp : withCurrentRiseCount.measurement.movement.lastStandAt,
        risesPastHour: recentRises + (stoodUp ? 1 : 0),
      },
    },
  }
  return prependActivity(
    next,
    makeActivity(
      next,
      timestamp,
      stoodUp ? 'stood-up' : 'lay-down',
      'movement',
      stoodUp ? 'Stood up from a resting posture.' : 'Lay down sternally.',
    ),
  )
}

const advanceFoal = (foal: Foal, scenario: ScenarioId, tick: number, timestamp: string): Foal => {
  if (scenario === 'offline') {
    return {
      ...foal,
      connectionStatus: 'offline',
      measurement: {
        ...foal.measurement,
        heartRate: { ...foal.measurement.heartRate, isStale: true },
        respirationRate: { ...foal.measurement.respirationRate, isStale: true },
      },
    }
  }

  const targets = valuesForScenario(foal, scenario)
  const heartAvailable = scenario !== 'electrodeDisconnected'
  const respirationAvailable = scenario !== 'respUnavailable'
  const currentHeart = foal.measurement.heartRate.value ?? targets.heartRate
  const currentRespiration = foal.measurement.respirationRate.value ?? targets.respirationRate
  const heartWobble = Math.round(Math.sin((tick + foal.name.length) / 3))
  const respirationWobble = Math.round(Math.sin((tick + foal.id.length) / 4))
  const nextHeart = stepToward(currentHeart, targets.heartRate + heartWobble, 2)
  const nextRespiration = stepToward(currentRespiration, targets.respirationRate + respirationWobble, 1)

  let next: Foal = {
    ...foal,
    lastValidUpdate: timestamp,
    batteryPercentage:
      scenario === 'lowBattery'
        ? foal.batteryPercentage
        : clamp(foal.batteryPercentage - (tick % 45 === 0 ? 1 : 0), 0, 100),
    measurement: {
      ...foal.measurement,
      timestamp,
      heartRate: heartAvailable
        ? buildReading('heartRate', nextHeart, foal.measurement.heartRate.value, timestamp)
        : unavailableReading(foal.measurement.heartRate),
      respirationRate: respirationAvailable
        ? buildReading(
            'respirationRate',
            nextRespiration,
            foal.measurement.respirationRate.value,
            timestamp,
          )
        : unavailableReading(foal.measurement.respirationRate),
    },
  }

  const freshSeries = createClinicalSeries(new Date(timestamp), nextHeart, nextRespiration)
  next = {
    ...next,
    clinicalSeries: {
      ecg: heartAvailable ? freshSeries.ecg : foal.clinicalSeries.ecg,
      respiration: respirationAvailable ? freshSeries.respiration : foal.clinicalSeries.respiration,
      heartRateTrend: appendTrendPoint(
        foal.clinicalSeries.heartRateTrend,
        timestamp,
        next.measurement.heartRate.value,
      ),
      respirationTrend: appendTrendPoint(
        foal.clinicalSeries.respirationTrend,
        timestamp,
        next.measurement.respirationRate.value,
      ),
    },
  }

  return advanceMovement(next, tick, timestamp)
}

export class MockFoalService {
  private snapshot: MonitoringSnapshot
  private readonly listeners = new Set<MonitoringListener>()
  private timer: ReturnType<typeof setInterval> | null = null
  private readonly now: () => Date
  private readonly updateIntervalMs: number
  private readonly startOnSubscribe: boolean

  constructor(options: MockFoalServiceOptions = {}) {
    this.now = options.now ?? (() => new Date())
    this.updateIntervalMs = options.updateIntervalMs ?? DEMONSTRATION_RANGES.updateIntervalMs
    this.startOnSubscribe = options.startOnSubscribe ?? true
    const createdAt = this.now()
    this.snapshot = {
      foals: cloneFoals(options.initialFoals ?? createInitialFoals(createdAt)),
      scenarioByFoalId: {
        ...DEFAULT_SCENARIO_BY_FOAL_ID,
        ...options.initialScenarios,
      },
      updatedAt: createdAt.toISOString(),
      tick: 0,
    }
  }

  /** Stable function reference designed for React's useSyncExternalStore. */
  getSnapshot = (): MonitoringSnapshot => this.snapshot

  getServerSnapshot = (): MonitoringSnapshot => this.snapshot

  subscribe = (listener: MonitoringListener): (() => void) => {
    this.listeners.add(listener)
    if (this.startOnSubscribe) this.start()
    return () => {
      this.listeners.delete(listener)
    }
  }

  start = (): void => {
    if (this.timer !== null) return
    this.timer = setInterval(this.advance, this.updateIntervalMs)
  }

  stop = (): void => {
    if (this.timer === null) return
    clearInterval(this.timer)
    this.timer = null
  }

  isRunning = (): boolean => this.timer !== null

  getFoal = (foalId: string): Foal | undefined =>
    this.snapshot.foals.find((foal) => foal.id === foalId)

  getScenario = (foalId: string): ScenarioId => this.snapshot.scenarioByFoalId[foalId] ?? 'normal'

  getScenarios = (): readonly Scenario[] => MOCK_SCENARIOS

  /** Runs one deterministic update immediately; also useful for fake-clock tests. */
  advance = (): void => {
    const now = this.now()
    const timestamp = now.toISOString()
    const tick = this.snapshot.tick + 1
    const foals = this.snapshot.foals.map((foal) =>
      advanceFoal(foal, this.getScenario(foal.id), tick, timestamp),
    )
    this.commit({ ...this.snapshot, foals, updatedAt: timestamp, tick })
  }

  setScenario = (foalId: string, scenario: ScenarioId): boolean => {
    if (!MOCK_SCENARIOS.some((item) => item.id === scenario)) return false
    const index = this.snapshot.foals.findIndex((foal) => foal.id === foalId)
    if (index < 0) return false
    if (this.getScenario(foalId) === scenario) return true

    const timestamp = this.now().toISOString()
    const foals = [...this.snapshot.foals]
    const foal = foals[index]
    if (!foal) return false
    foals[index] = applyScenario(foal, scenario, timestamp)
    this.commit({
      ...this.snapshot,
      foals,
      scenarioByFoalId: { ...this.snapshot.scenarioByFoalId, [foalId]: scenario },
      updatedAt: timestamp,
    })
    return true
  }

  acknowledgeAlert = (
    foalId: string,
    alertId: string,
    acknowledgedBy = 'Clinical staff',
  ): boolean => {
    const index = this.snapshot.foals.findIndex((foal) => foal.id === foalId)
    const current = this.snapshot.foals[index]
    if (index < 0 || !current) return false
    const target = current.alerts.find(
      (item) => item.id === alertId && item.status === 'active' && !item.acknowledged,
    )
    if (!target) return false

    const timestamp = this.now().toISOString()
    let next: Foal = {
      ...current,
      alerts: current.alerts.map((item) =>
        item.id === alertId
          ? {
              ...item,
              acknowledged: true,
              acknowledgedAt: timestamp,
              acknowledgedBy,
            }
          : item,
      ),
    }
    next = markRelatedActivityAcknowledged(next, alertId, timestamp, acknowledgedBy)
    const acknowledgement = makeActivity(
      next,
      timestamp,
      'alert-acknowledged',
      'staff',
      `${target.title} acknowledged by ${acknowledgedBy}; the condition remains active.`,
      'acknowledged',
      target.id,
    )
    acknowledgement.acknowledgedAt = timestamp
    acknowledgement.acknowledgedBy = acknowledgedBy
    next = prependActivity(next, acknowledgement)

    const foals = [...this.snapshot.foals]
    foals[index] = next
    this.commit({ ...this.snapshot, foals, updatedAt: timestamp })
    return true
  }

  acknowledgeAlertById = (alertId: string, acknowledgedBy = 'Clinical staff'): boolean => {
    const foal = this.snapshot.foals.find((item) => item.alerts.some((alert) => alert.id === alertId))
    return foal ? this.acknowledgeAlert(foal.id, alertId, acknowledgedBy) : false
  }

  addStaffActivity = (foalId: string, description: string, staffName = 'Clinical staff'): boolean => {
    const index = this.snapshot.foals.findIndex((foal) => foal.id === foalId)
    const current = this.snapshot.foals[index]
    if (index < 0 || !current || !description.trim()) return false
    const timestamp = this.now().toISOString()
    const item = makeActivity(
      current,
      timestamp,
      'staff-note',
      'staff',
      `${description.trim()} — ${staffName}`,
    )
    const foals = [...this.snapshot.foals]
    foals[index] = prependActivity(current, item)
    this.commit({ ...this.snapshot, foals, updatedAt: timestamp })
    return true
  }

  reset = (): void => {
    const now = this.now()
    this.commit({
      foals: createInitialFoals(now),
      scenarioByFoalId: { ...DEFAULT_SCENARIO_BY_FOAL_ID },
      updatedAt: now.toISOString(),
      tick: 0,
    })
  }

  private commit(next: MonitoringSnapshot): void {
    this.snapshot = next
    this.listeners.forEach((listener) => listener())
  }
}

export const createMockFoalService = (options?: MockFoalServiceOptions): MockFoalService =>
  new MockFoalService(options)

export const mockFoalService = createMockFoalService()

export const selectFoalById = (
  snapshot: MonitoringSnapshot,
  foalId: string | undefined,
): Foal | undefined => snapshot.foals.find((foal) => foal.id === foalId)

export const selectActiveAlerts = (foal: Foal): Alert[] =>
  foal.alerts.filter((alert) => alert.status === 'active')

export const selectVitalStatus = (foal: Foal, kind: VitalKind): RangeStatus =>
  foal.measurement[kind].status
