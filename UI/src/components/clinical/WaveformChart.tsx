import { useId, useMemo } from 'react'
import type { WaveformPoint } from '../../types/monitoring'
import styles from './WaveformChart.module.css'

export type WaveformKind = 'ecg' | 'respiration'

export interface WaveformChartProps {
  points: WaveformPoint[]
  kind: WaveformKind
  title: string
  description: string
  isUnavailable?: boolean
}

const WIDTH = 900
const HEIGHT = 188
const PADDING_X = 18
const PADDING_Y = 20

function createPath(points: WaveformPoint[]) {
  if (points.length === 0) return ''

  const offsets = points.map((point) => point.offsetSeconds)
  const values = points.map((point) => point.value)
  const minOffset = Math.min(...offsets)
  const maxOffset = Math.max(...offsets)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const offsetRange = Math.max(maxOffset - minOffset, 0.001)
  const valueRange = Math.max(maxValue - minValue, 0.001)

  return points
    .map((point, index) => {
      const x = PADDING_X + ((point.offsetSeconds - minOffset) / offsetRange) * (WIDTH - PADDING_X * 2)
      const y = HEIGHT - PADDING_Y - ((point.value - minValue) / valueRange) * (HEIGHT - PADDING_Y * 2)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

export function WaveformChart({
  points,
  kind,
  title,
  description,
  isUnavailable = false,
}: WaveformChartProps) {
  const reactId = useId()
  const chartId = reactId.replaceAll(':', '')
  const titleId = `${chartId}-title`
  const descriptionId = `${chartId}-description`
  const path = useMemo(() => createPath(points), [points])
  const duration =
    points.length > 1
      ? Math.abs(points[points.length - 1]!.offsetSeconds - points[0]!.offsetSeconds)
      : 0

  if (isUnavailable || !path) {
    return (
      <div className={styles.unavailable} role="img" aria-label={`${title}. Signal unavailable.`}>
        <span className={styles.unavailableLine} aria-hidden="true" />
        <strong>Signal unavailable</strong>
        <span>Waveform will resume when a valid signal returns.</span>
      </div>
    )
  }

  return (
    <div className={`${styles.chart} ${styles[kind]}`}>
      <svg
        aria-labelledby={`${titleId} ${descriptionId}`}
        className={styles.svg}
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      >
        <title id={titleId}>{title}</title>
        <desc id={descriptionId}>{description}</desc>
        <defs>
          <pattern id={`${chartId}-small-grid`} width="18" height="18" patternUnits="userSpaceOnUse">
            <path className={styles.gridMinor} d="M 18 0 L 0 0 0 18" fill="none" />
          </pattern>
          <pattern id={`${chartId}-grid`} width="90" height="90" patternUnits="userSpaceOnUse">
            <rect width="90" height="90" fill={`url(#${chartId}-small-grid)`} />
            <path className={styles.gridMajor} d="M 90 0 L 0 0 0 90" fill="none" />
          </pattern>
          <linearGradient id={`${chartId}-fade`} x1="0" x2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.55" />
            <stop offset="0.08" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id={`${chartId}-mask`}>
            <rect width={WIDTH} height={HEIGHT} fill={`url(#${chartId}-fade)`} />
          </mask>
        </defs>
        <rect className={styles.grid} width={WIDTH} height={HEIGHT} fill={`url(#${chartId}-grid)`} />
        <line className={styles.baseline} x1="0" x2={WIDTH} y1={HEIGHT / 2} y2={HEIGHT / 2} />
        <path className={styles.traceShadow} d={path} fill="none" mask={`url(#${chartId}-mask)`} />
        <path className={styles.trace} d={path} fill="none" mask={`url(#${chartId}-mask)`} />
      </svg>
      <div className={styles.axis} aria-hidden="true">
        <span>−{duration.toFixed(0)} s</span>
        <span>Now</span>
      </div>
    </div>
  )
}

