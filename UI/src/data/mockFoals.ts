import { DEMONSTRATION_RANGES } from '../config/demonstrationRanges'
import type {
  Activity,
  Alert,
  ClinicalSeries,
  Foal,
  Scenario,
  ScenarioId,
  VitalReading,
} from '../types/monitoring'

const atOffset = (now: Date, milliseconds: number): string =>
  new Date(now.getTime() + milliseconds).toISOString()

const activity = (
  id: string,
  foalId: string,
  timestamp: string,
  values: Omit<Activity, 'id' | 'foalId' | 'timestamp'>,
): Activity => ({ id, foalId, timestamp, ...values })

const alert = (
  id: string,
  foalId: string,
  startedAt: string,
  values: Omit<Alert, 'id' | 'foalId' | 'startedAt'>,
): Alert => ({ id, foalId, startedAt, ...values })

const vital = (
  value: number | null,
  previousValue: number | null,
  unit: VitalReading['unit'],
  lastValidAt: string | null,
  signalQuality: VitalReading['signalQuality'] = 'good',
  isStale = false,
): VitalReading => {
  if (value === null) {
    return {
      value,
      previousValue,
      delta: null,
      unit,
      trend: 'stable',
      status: 'unavailable',
      signalQuality,
      lastValidAt,
      isStale,
    }
  }

  const delta = previousValue === null ? 0 : value - previousValue
  const range = unit === 'bpm' ? DEMONSTRATION_RANGES.heartRate : DEMONSTRATION_RANGES.respirationRate
  const stableDelta =
    unit === 'bpm'
      ? DEMONSTRATION_RANGES.trendStableDelta.heartRate
      : DEMONSTRATION_RANGES.trendStableDelta.respirationRate

  return {
    value,
    previousValue,
    delta,
    unit,
    trend: Math.abs(delta) <= stableDelta ? 'stable' : delta > 0 ? 'up' : 'down',
    status: value > range.max ? 'above' : value < range.min ? 'below' : 'within',
    signalQuality,
    lastValidAt,
    isStale,
  }
}

export const createClinicalSeries = (
  now: Date,
  heartRate: number,
  respirationRate: number,
): ClinicalSeries => {
  const ecg = Array.from({ length: 161 }, (_, index) => {
    const offsetSeconds = -8 + index * 0.05
    const phase = ((offsetSeconds * heartRate) / 60) % 1
    const normalizedPhase = phase < 0 ? phase + 1 : phase
    const p = 0.08 * Math.exp(-((normalizedPhase - 0.18) ** 2) / 0.002)
    const q = -0.12 * Math.exp(-((normalizedPhase - 0.36) ** 2) / 0.0005)
    const r = 1.05 * Math.exp(-((normalizedPhase - 0.4) ** 2) / 0.00018)
    const s = -0.24 * Math.exp(-((normalizedPhase - 0.44) ** 2) / 0.00045)
    const t = 0.22 * Math.exp(-((normalizedPhase - 0.68) ** 2) / 0.008)
    return { offsetSeconds, value: Number((p + q + r + s + t).toFixed(3)) }
  })

  const respiration = Array.from({ length: 81 }, (_, index) => {
    const offsetSeconds = -8 + index * 0.1
    const radians = (offsetSeconds * respirationRate * 2 * Math.PI) / 60
    return { offsetSeconds, value: Number(Math.sin(radians).toFixed(3)) }
  })

  const heartRateTrend = Array.from({ length: 24 }, (_, index) => ({
    timestamp: atOffset(now, -(23 - index) * 5 * 60_000),
    value: Math.round(heartRate + Math.sin(index / 2.7) * 3),
  }))
  const respirationTrend = Array.from({ length: 24 }, (_, index) => ({
    timestamp: atOffset(now, -(23 - index) * 5 * 60_000),
    value: Math.round(respirationRate + Math.sin(index / 3.1) * 2),
  }))

  return { ecg, respiration, heartRateTrend, respirationTrend }
}

export const MOCK_SCENARIOS: readonly Scenario[] = [
  {
    id: 'normal',
    label: 'Normal monitoring',
    description: 'Connected device with available signals and values inside the demonstration ranges.',
  },
  {
    id: 'highHR',
    label: 'High heart rate',
    description: 'Demonstrates heart rate above the configured demonstration range.',
  },
  {
    id: 'lowHR',
    label: 'Low heart rate',
    description: 'Demonstrates heart rate below the configured demonstration range.',
  },
  {
    id: 'highResp',
    label: 'High respiration',
    description: 'Demonstrates respiration above the configured demonstration range.',
  },
  {
    id: 'electrodeDisconnected',
    label: 'Electrode disconnected',
    description: 'Preserves the last heart-rate reading and marks ECG signal unavailable.',
  },
  {
    id: 'respUnavailable',
    label: 'Respiration unavailable',
    description: 'Preserves the last respiration reading and marks its sensor unavailable.',
  },
  {
    id: 'offline',
    label: 'Device offline',
    description: 'Stops valid updates and clearly marks preserved values as stale.',
  },
  {
    id: 'lowBattery',
    label: 'Low battery',
    description: 'Keeps monitoring active while battery falls below the demonstration threshold.',
  },
  {
    id: 'unacknowledged',
    label: 'Unacknowledged alert',
    description: 'Shows an active physiological alert that staff have not acknowledged.',
  },
  {
    id: 'acknowledged',
    label: 'Acknowledged alert',
    description: 'Shows the same active condition after staff acknowledgement.',
  },
] as const

export const DEFAULT_SCENARIO_BY_FOAL_ID: Record<string, ScenarioId> = {
  luna: 'normal',
  maple: 'unacknowledged',
  orion: 'electrodeDisconnected',
}

export const createInitialFoals = (now = new Date()): Foal[] => {
  const current = now.toISOString()
  const mapleAlertId = 'alert-maple-high-resp'
  const orionAlertId = 'alert-orion-electrode'

  return [
    {
      id: 'luna',
      patientId: 'F-2407',
      name: 'Luna',
      mareName: 'Silver Fern',
      stall: 'NICU · Stall 3',
      photoUrl: '/foals/luna.png',
      dateOfBirth: atOffset(now, -2 * 24 * 60 * 60_000),
      measurement: {
        timestamp: current,
        heartRate: vital(84, 82, 'bpm', current),
        respirationRate: vital(30, 29, 'breaths/min', current),
        movement: {
          posture: 'standing',
          previousPosture: 'lying-sternally',
          lastPostureChangeAt: atOffset(now, -4 * 60_000),
          lastStandAt: atOffset(now, -4 * 60_000),
          risesPastHour: 3,
          sensorStatus: 'connected',
        },
      },
      connectionStatus: 'connected',
      batteryPercentage: 86,
      lastValidUpdate: current,
      electrodeStatus: 'connected',
      respirationSensorStatus: 'connected',
      alerts: [],
      activity: [
        activity('activity-luna-1', 'luna', atOffset(now, -4 * 60_000), {
          type: 'stood-up',
          category: 'movement',
          description: 'Stood up from a sternal lying position.',
          status: 'recorded',
        }),
        activity('activity-luna-2', 'luna', atOffset(now, -18 * 60_000), {
          type: 'patient-checked',
          category: 'staff',
          description: 'Routine bedside patient check recorded.',
          status: 'recorded',
        }),
        activity('activity-luna-3', 'luna', atOffset(now, -31 * 60_000), {
          type: 'lay-down',
          category: 'movement',
          description: 'Lay down sternally.',
          status: 'recorded',
        }),
        activity('activity-luna-4', 'luna', atOffset(now, -52 * 60_000), {
          type: 'sensor-restored',
          category: 'equipment',
          description: 'Movement signal quality returned to good.',
          status: 'resolved',
        }),
        activity('activity-luna-5', 'luna', atOffset(now, -74 * 60_000), {
          type: 'staff-note',
          category: 'staff',
          description: 'Foal resting comfortably with mare.',
          status: 'recorded',
        }),
      ],
      clinicalSeries: createClinicalSeries(now, 84, 30),
    },
    {
      id: 'maple',
      patientId: 'F-2411',
      name: 'Maple',
      mareName: 'Autumn Song',
      stall: 'NICU · Stall 6',
      photoUrl: '/foals/maple.png',
      dateOfBirth: atOffset(now, -20 * 60 * 60_000),
      measurement: {
        timestamp: current,
        heartRate: vital(96, 93, 'bpm', current),
        respirationRate: vital(58, 55, 'breaths/min', current),
        movement: {
          posture: 'lying-sternally',
          previousPosture: 'standing',
          lastPostureChangeAt: atOffset(now, -7 * 60_000),
          lastStandAt: atOffset(now, -7 * 60_000),
          risesPastHour: 4,
          sensorStatus: 'connected',
        },
      },
      connectionStatus: 'connected',
      batteryPercentage: 63,
      lastValidUpdate: current,
      electrodeStatus: 'connected',
      respirationSensorStatus: 'connected',
      alerts: [
        alert(mapleAlertId, 'maple', atOffset(now, -45_000), {
          kind: 'high-respiration-rate',
          category: 'physiological',
          severity: 'critical',
          title: 'Respiration above demonstration range',
          message: 'Respiration has remained above the configured demonstration range for 45 seconds.',
          status: 'active',
          acknowledged: false,
          acknowledgedAt: null,
          acknowledgedBy: null,
        }),
      ],
      activity: [
        activity('activity-maple-1', 'maple', atOffset(now, -45_000), {
          type: 'high-respiration-alert',
          category: 'clinical',
          description: 'Respiration crossed the configured demonstration range.',
          status: 'active',
          alertId: mapleAlertId,
        }),
        activity('activity-maple-2', 'maple', atOffset(now, -7 * 60_000), {
          type: 'lay-down',
          category: 'movement',
          description: 'Lay down sternally.',
          status: 'recorded',
        }),
        activity('activity-maple-3', 'maple', atOffset(now, -15 * 60_000), {
          type: 'stood-up',
          category: 'movement',
          description: 'Stood up after a lateral rest.',
          status: 'recorded',
        }),
        activity('activity-maple-4', 'maple', atOffset(now, -28 * 60_000), {
          type: 'patient-checked',
          category: 'staff',
          description: 'Patient assessed at bedside.',
          status: 'recorded',
        }),
        activity('activity-maple-5', 'maple', atOffset(now, -42 * 60_000), {
          type: 'posture-changed',
          category: 'movement',
          description: 'Posture changed from lateral to sternal lying.',
          status: 'recorded',
        }),
      ],
      clinicalSeries: createClinicalSeries(now, 96, 58),
    },
    {
      id: 'orion',
      patientId: 'F-2414',
      name: 'Orion',
      mareName: 'Northern Light',
      stall: 'Isolation · Stall 2',
      photoUrl: '/foals/orion.png',
      dateOfBirth: atOffset(now, -3 * 24 * 60 * 60_000),
      measurement: {
        timestamp: current,
        heartRate: vital(null, 78, 'bpm', atOffset(now, -76_000), 'unavailable', true),
        respirationRate: vital(26, 27, 'breaths/min', current, 'fair'),
        movement: {
          posture: 'lying-laterally',
          previousPosture: 'lying-sternally',
          lastPostureChangeAt: atOffset(now, -12 * 60_000),
          lastStandAt: atOffset(now, -38 * 60_000),
          risesPastHour: 2,
          sensorStatus: 'connected',
        },
      },
      connectionStatus: 'reconnecting',
      batteryPercentage: 41,
      lastValidUpdate: current,
      electrodeStatus: 'disconnected',
      respirationSensorStatus: 'connected',
      alerts: [
        alert(orionAlertId, 'orion', atOffset(now, -76_000), {
          kind: 'ecg-signal-unavailable',
          category: 'equipment',
          severity: 'warning',
          title: 'ECG signal unavailable',
          message: 'ECG signal unavailable. Check electrode contact.',
          status: 'active',
          acknowledged: false,
          acknowledgedAt: null,
          acknowledgedBy: null,
        }),
      ],
      activity: [
        activity('activity-orion-1', 'orion', atOffset(now, -76_000), {
          type: 'electrode-disconnected',
          category: 'equipment',
          description: 'ECG electrode contact was lost.',
          status: 'active',
          alertId: orionAlertId,
        }),
        activity('activity-orion-2', 'orion', atOffset(now, -12 * 60_000), {
          type: 'posture-changed',
          category: 'movement',
          description: 'Posture changed to lateral lying.',
          status: 'recorded',
        }),
        activity('activity-orion-3', 'orion', atOffset(now, -38 * 60_000), {
          type: 'stood-up',
          category: 'movement',
          description: 'Stood up briefly before returning to rest.',
          status: 'recorded',
        }),
        activity('activity-orion-4', 'orion', atOffset(now, -49 * 60_000), {
          type: 'patient-checked',
          category: 'staff',
          description: 'Electrode placement checked during rounds.',
          status: 'recorded',
        }),
        activity('activity-orion-5', 'orion', atOffset(now, -67 * 60_000), {
          type: 'sensor-restored',
          category: 'equipment',
          description: 'Respiration sensor signal restored.',
          status: 'resolved',
        }),
      ],
      clinicalSeries: createClinicalSeries(now, 78, 26),
    },
  ]
}

export const INITIAL_FOALS = createInitialFoals()
