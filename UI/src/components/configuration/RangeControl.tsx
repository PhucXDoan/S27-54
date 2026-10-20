import { useId, useRef } from 'react'
import type { PointerEvent } from 'react'

import { MONITORING_UI_BOUNDS } from '../../config/monitoringSettings'
import type { MonitoringSettingsErrors } from '../../config/monitoringSettings'
import type { MonitoringSettings, VitalKind } from '../../types/monitoring'
import styles from './MonitoringRangeCard.module.css'

export interface EditableRange {
  min: string
  max: string
  buffer: string
}

interface RangeControlProps {
  kind: VitalKind
  label: string
  unit: string
  values: EditableRange
  active: MonitoringSettings[VitalKind]
  errors: MonitoringSettingsErrors
  onChange: (field: keyof EditableRange, value: string) => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Native range inputs provide keyboard semantics; the shared track adds touch/drag targeting. */
export function RangeControl({
  kind,
  label,
  unit,
  values,
  active,
  errors,
  onChange,
}: RangeControlProps) {
  const id = useId()
  const lowerRef = useRef<HTMLInputElement>(null)
  const upperRef = useRef<HTMLInputElement>(null)
  const draggedHandle = useRef<'min' | 'max' | null>(null)
  const bounds = MONITORING_UI_BOUNDS[kind]
  const lowerNumber = values.min.trim() === '' ? NaN : Number(values.min)
  const upperNumber = values.max.trim() === '' ? NaN : Number(values.max)
  const validLimits =
    Number.isFinite(lowerNumber) && Number.isFinite(upperNumber) &&
    lowerNumber >= bounds.min && upperNumber <= bounds.max && lowerNumber < upperNumber
  // Invalid text remains editable with its field error; handles retain a coherent range.
  const lower = validLimits ? lowerNumber : active.min
  const upper = validLimits ? upperNumber : active.max
  const lowerPercent = ((lower - bounds.min) / (bounds.max - bounds.min)) * 100
  const upperPercent = ((upper - bounds.min) / (bounds.max - bounds.min)) * 100

  function changeHandle(field: 'min' | 'max', proposedValue: number) {
    const next =
      field === 'min'
        ? clamp(proposedValue, bounds.min, upper - bounds.step)
        : clamp(proposedValue, lower + bounds.step, bounds.max)
    onChange(field, String(next))
  }

  function valueAtPointer(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const fraction = clamp((event.clientX - box.left) / box.width, 0, 1)
    return bounds.min + Math.round((fraction * (bounds.max - bounds.min)) / bounds.step) * bounds.step
  }

  function beginTrackDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLInputElement || event.button !== 0) return
    const nextValue = valueAtPointer(event)
    const field = Math.abs(nextValue - lower) <= Math.abs(nextValue - upper) ? 'min' : 'max'
    draggedHandle.current = field
    event.currentTarget.setPointerCapture(event.pointerId)
    const handleRef = field === 'min' ? lowerRef : upperRef
    handleRef.current?.focus()
    changeHandle(field, nextValue)
  }

  return (
    <fieldset className={styles.rangeSection}>
      <legend>{label} <span>{unit}</span></legend>
      <p className={styles.activeReference} id={`${id}-active`}>
        Active: <strong>{active.min}–{active.max} {unit}</strong>
        {active.buffer > 0 ? <span> · buffer {active.buffer} {unit}</span> : null}
      </p>

      <div
        className={styles.dualRange}
        onPointerDown={beginTrackDrag}
        onPointerMove={(event) => {
          if (draggedHandle.current) changeHandle(draggedHandle.current, valueAtPointer(event))
        }}
        onPointerUp={() => { draggedHandle.current = null }}
        onPointerCancel={() => { draggedHandle.current = null }}
      >
        <span className={styles.sliderTrack} aria-hidden="true" />
        <span
          className={styles.sliderSelection}
          style={{ left: `${Math.min(lowerPercent, upperPercent)}%`, width: `${Math.abs(upperPercent - lowerPercent)}%` }}
          aria-hidden="true"
        />
        <input
          ref={lowerRef}
          type="range"
          className={styles.lowerSlider}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={lower}
          aria-label={`${label} lower limit slider`}
          aria-valuemin={bounds.min}
          aria-valuemax={upper - bounds.step}
          aria-valuetext={`${lower} ${unit}, lower limit`}
          aria-describedby={`${id}-active`}
          onChange={(event) => changeHandle('min', Number(event.target.value))}
        />
        <input
          ref={upperRef}
          type="range"
          className={styles.upperSlider}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={upper}
          aria-label={`${label} upper limit slider`}
          aria-valuemin={lower + bounds.step}
          aria-valuemax={bounds.max}
          aria-valuetext={`${upper} ${unit}, upper limit`}
          aria-describedby={`${id}-active`}
          onChange={(event) => changeHandle('max', Number(event.target.value))}
        />
      </div>
      <div className={styles.sliderBounds} aria-hidden="true"><span>{bounds.min}</span><span>{bounds.max}</span></div>

      <div className={styles.numberFields}>
        {(['min', 'max'] as const).map((field) => {
          const error = errors[`${kind}.${field}`]
          const fieldId = `${id}-${field}`
          const fieldLabel = field === 'min' ? 'Lower limit' : 'Upper limit'
          return (
            <div className={styles.numberField} key={field}>
              <label htmlFor={fieldId}>{fieldLabel}</label>
              <div className={styles.inputUnit}>
                <input
                  id={fieldId}
                  type="number"
                  inputMode="decimal"
                  min={bounds.min}
                  max={bounds.max}
                  step={bounds.step}
                  value={values[field]}
                  aria-label={`${label} ${fieldLabel.toLowerCase()}`}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${id}-active${error ? ` ${fieldId}-error` : ''}`}
                  onChange={(event) => onChange(field, event.target.value)}
                />
                <span>{unit}</span>
              </div>
              {error ? <p className={styles.fieldError} id={`${fieldId}-error`}>{error}</p> : null}
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
