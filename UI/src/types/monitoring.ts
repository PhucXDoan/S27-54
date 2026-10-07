/** ISO-8601 timestamp. Kept as a string so snapshots remain serializable. */
export type ISODateString = string

export type ScenarioId =
  | 'normal'
  | 'highHR'
  | 'lowHR'
  | 'highResp'
  | 'electrodeDisconnected'
  | 'respUnavailable'
  | 'offline'
  | 'lowBattery'
  | 'unacknowledged'
  | 'acknowledged'

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline'
export type ConnectionState = ConnectionStatus

export type SignalQuality = 'good' | 'fair' | 'poor' | 'unavailable'
export type SensorStatus = 'connected' | 'degraded' | 'disconnected' | 'unavailable'
export type ElectrodeStatus = 'connected' | 'poor-contact' | 'disconnected' | 'unavailable'

export type Posture =
  | 'standing'
  | 'lying-sternally'
  | 'lying-laterally'
  | 'changing'
  | 'uncertain'
  | 'unavailable'
export type MovementState = Posture

export type RangeStatus = 'within' | 'above' | 'below' | 'unavailable'
export type VitalStatus = RangeStatus
export type TrendDirection = 'up' | 'down' | 'stable'
export type VitalUnit = 'bpm' | 'breaths/min'
export type VitalKind = 'heartRate' | 'respirationRate'

export interface VitalReading {
  value: number | null
  previousValue: number | null
  delta: number | null
  unit: VitalUnit
  trend: TrendDirection
  status: RangeStatus
  signalQuality: SignalQuality
  lastValidAt: ISODateString | null
  isStale: boolean
}

/** Friendly alias for components that call a reading a vital sign. */
export type VitalSign = VitalReading

export interface MovementMeasurement {
  posture: Posture
  previousPosture: Posture | null
  lastPostureChangeAt: ISODateString
  lastStandAt: ISODateString | null
  risesPastHour: number
  sensorStatus: SensorStatus
}

export interface Measurement {
  timestamp: ISODateString
  heartRate: VitalReading
  respirationRate: VitalReading
  movement: MovementMeasurement
}

export type AlertKind =
  | 'high-heart-rate'
  | 'low-heart-rate'
  | 'high-respiration-rate'
  | 'low-respiration-rate'
  | 'ecg-signal-unavailable'
  | 'respiration-signal-unavailable'
  | 'movement-sensor-unavailable'
  | 'device-offline'
  | 'low-battery'

export type AlertCategory = 'physiological' | 'equipment' | 'connection'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertStatus = 'active' | 'resolved'

export interface Alert {
  id: string
  foalId: string
  kind: AlertKind
  category: AlertCategory
  severity: AlertSeverity
  title: string
  message: string
  startedAt: ISODateString
  status: AlertStatus
  acknowledged: boolean
  acknowledgedAt: ISODateString | null
  acknowledgedBy: string | null
}

export type MonitoringAlert = Alert

export type ActivityType =
  | 'stood-up'
  | 'lay-down'
  | 'posture-changed'
  | 'repeated-rising-threshold'
  | 'high-heart-rate-alert'
  | 'low-heart-rate-alert'
  | 'high-respiration-alert'
  | 'low-respiration-alert'
  | 'electrode-disconnected'
  | 'respiration-sensor-unavailable'
  | 'sensor-restored'
  | 'device-offline'
  | 'device-reconnected'
  | 'low-battery'
  | 'alert-acknowledged'
  | 'patient-checked'
  | 'staff-note'

export type ActivityCategory = 'movement' | 'clinical' | 'equipment' | 'staff'
export type ActivityStatus = 'active' | 'resolved' | 'recorded' | 'acknowledged'

export interface Activity {
  id: string
  foalId: string
  timestamp: ISODateString
  type: ActivityType
  category: ActivityCategory
  description: string
  status: ActivityStatus
  alertId?: string
  acknowledgedAt?: ISODateString
  acknowledgedBy?: string
}

export type ActivityEvent = Activity

export interface VitalPoint {
  timestamp: ISODateString
  value: number
}

export interface WaveformPoint {
  /** Offset from the newest sample, in seconds. */
  offsetSeconds: number
  value: number
}

export interface ClinicalSeries {
  ecg: WaveformPoint[]
  respiration: WaveformPoint[]
  heartRateTrend: VitalPoint[]
  respirationTrend: VitalPoint[]
}

export interface Foal {
  id: string
  patientId: string
  name: string
  mareName: string
  stall: string
  photoUrl: string
  dateOfBirth: ISODateString
  measurement: Measurement
  connectionStatus: ConnectionStatus
  batteryPercentage: number
  lastValidUpdate: ISODateString
  electrodeStatus: ElectrodeStatus
  respirationSensorStatus: SensorStatus
  alerts: Alert[]
  activity: Activity[]
  clinicalSeries: ClinicalSeries
}

export interface Scenario {
  id: ScenarioId
  label: string
  description: string
}

export interface MonitoringSnapshot {
  foals: Foal[]
  scenarioByFoalId: Record<string, ScenarioId>
  updatedAt: ISODateString
  tick: number
}

export type MonitoringListener = () => void
