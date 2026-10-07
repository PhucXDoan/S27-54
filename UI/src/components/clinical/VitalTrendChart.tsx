import { useId, useMemo } from 'react'
import type { VitalPoint } from '../../types/monitoring'
import { formatExactTime } from '../../utils/formatters'
import styles from './VitalTrendChart.module.css'

export interface VitalTrendChartProps {
  points: VitalPoint[]
  title: string
  unit: 'bpm' | 'breaths/min'
  kind: 'heartRate' | 'respiration'
  range?: { minimum: number; maximum: number }
  isStale?: boolean
}

const WIDTH = 620
const HEIGHT = 190
const LEFT = 42
const RIGHT = 14
const TOP = 18
const BOTTOM = 32

function buildTrend(points: VitalPoint[], range?: { minimum: number; maximum: number }) {
  if (points.length === 0) return null

  const timestamps = points.map((point) => Date.parse(point.timestamp))
  const values = points.map((point) => point.value)
  const minimum = Math.min(...values, range?.minimum ?? Number.POSITIVE_INFINITY)
  const maximum = Math.max(...values, range?.maximum ?? Number.NEGATIVE_INFINITY)
  const padding = Math.max((maximum - minimum) * 0.16, 2)
  const minY = minimum - padding
  const maxY = maximum + padding
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)
  const timeRange = Math.max(maxTime - minTime, 1)
  const valueRange = Math.max(maxY - minY, 1)

  const coordinates = points.map((point) => ({
    x: LEFT + ((Date.parse(point.timestamp) - minTime) / timeRange) * (WIDTH - LEFT - RIGHT),
    y: TOP + ((maxY - point.value) / valueRange) * (HEIGHT - TOP - BOTTOM),
  }))

  const line = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
  const first = coordinates[0]!
  const last = coordinates[coordinates.length - 1]!
  const area = `${line} L ${last.x.toFixed(2)} ${HEIGHT - BOTTOM} L ${first.x.toFixed(2)} ${HEIGHT - BOTTOM} Z`

  const rangeBand = range
    ? {
        y: TOP + ((maxY - range.maximum) / valueRange) * (HEIGHT - TOP - BOTTOM),
        height: ((range.maximum - range.minimum) / valueRange) * (HEIGHT - TOP - BOTTOM),
      }
    : null

  return { line, area, coordinates, minY, maxY, rangeBand }
}

export function VitalTrendChart({
  points,
  title,
  unit,
  kind,
  range,
  isStale = false,
}: VitalTrendChartProps) {
  const reactId = useId()
  const chartId = reactId.replaceAll(':', '')
  const trend = useMemo(() => buildTrend(points, range), [points, range])
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]

  if (!trend || !firstPoint || !lastPoint) {
    return (
      <div className={styles.empty} role="img" aria-label={`${title}. Trend data unavailable.`}>
        Trend data unavailable
      </div>
    )
  }

  const latest = lastPoint.value
  const minimum = Math.min(...points.map((point) => point.value))
  const maximum = Math.max(...points.map((point) => point.value))

  return (
    <figure className={`${styles.figure} ${styles[kind]}`}>
      <figcaption className={styles.caption}>
        <span>
          <strong>{title}</strong>
          <small>
            {points.length} calculated readings{isStale ? ' · retained data' : ''}
          </small>
        </span>
        <span className={styles.latest}>
          {latest} <small>{unit}</small>
        </span>
      </figcaption>
      <svg
        aria-label={`${title}. ${isStale ? 'Retained historical data. ' : ''}Latest ${latest} ${unit}, range ${minimum} to ${maximum} ${unit}.`}
        className={styles.svg}
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      >
        <defs>
          <linearGradient id={`${chartId}-area`} x1="0" x2="0" y1="0" y2="1">
            <stop className={styles.areaStart} offset="0" />
            <stop className={styles.areaEnd} offset="1" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = TOP + (line / 3) * (HEIGHT - TOP - BOTTOM)
          const value = trend.maxY - (line / 3) * (trend.maxY - trend.minY)
          return (
            <g key={line}>
              <line className={styles.gridLine} x1={LEFT} x2={WIDTH - RIGHT} y1={y} y2={y} />
              <text className={styles.axisLabel} x={LEFT - 7} y={y + 3} textAnchor="end">
                {Math.round(value)}
              </text>
            </g>
          )
        })}
        {trend.rangeBand ? (
          <rect
            className={styles.rangeBand}
            height={trend.rangeBand.height}
            width={WIDTH - LEFT - RIGHT}
            x={LEFT}
            y={trend.rangeBand.y}
          />
        ) : null}
        <path d={trend.area} fill={`url(#${chartId}-area)`} />
        <path className={styles.line} d={trend.line} fill="none" />
        {trend.coordinates.map((coordinate, index) => (
          <circle
            className={index === trend.coordinates.length - 1 ? styles.lastPoint : styles.point}
            cx={coordinate.x}
            cy={coordinate.y}
            key={`${points[index]!.timestamp}-${index}`}
            r={index === trend.coordinates.length - 1 ? 4 : 2.2}
          />
        ))}
        <text className={styles.timeLabel} x={LEFT} y={HEIGHT - 8}>
          {formatExactTime(firstPoint.timestamp)}
        </text>
        <text className={styles.timeLabel} x={WIDTH - RIGHT} y={HEIGHT - 8} textAnchor="end">
          {formatExactTime(lastPoint.timestamp)}
        </text>
      </svg>
      {range ? (
        <p className={styles.rangeKey}>
          Shaded band: configured demonstration range{isStale ? ' · trend is stale' : ''}
        </p>
      ) : null}
    </figure>
  )
}
