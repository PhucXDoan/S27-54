import { CheckCircle2, ChevronDown, Pencil, Settings2 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { DEMONSTRATION_RANGE_DISCLAIMER } from '../../config/demonstrationRanges'
import { MONITORING_UI_BOUNDS, validateMonitoringSettings } from '../../config/monitoringSettings'
import type { MonitoringSettings, VitalKind } from '../../types/monitoring'
import { RangeControl } from './RangeControl'
import type { EditableRange } from './RangeControl'
import styles from './MonitoringRangeCard.module.css'

interface MonitoringRangeCardProps {
  foalName: string
  active: MonitoringSettings
  draft: MonitoringSettings | null
  persistenceAvailable: boolean
  onApply: (settings: MonitoringSettings) => boolean
  onSaveDraft: (settings: MonitoringSettings) => boolean
}

type EditableSettings = Record<VitalKind, EditableRange>

const measurements = [
  { kind: 'heartRate', label: 'Heart rate', unit: 'bpm' },
  { kind: 'respirationRate', label: 'Respiration', unit: 'breaths/min' },
] as const

function editableSettings(settings: MonitoringSettings): EditableSettings {
  return {
    heartRate: {
      min: String(settings.heartRate.min), max: String(settings.heartRate.max), buffer: String(settings.heartRate.buffer),
    },
    respirationRate: {
      min: String(settings.respirationRate.min), max: String(settings.respirationRate.max), buffer: String(settings.respirationRate.buffer),
    },
  }
}

function numericSettings(settings: EditableSettings): MonitoringSettings {
  const numeric = (value: string) => value.trim() === '' ? NaN : Number(value)
  return {
    heartRate: {
      min: numeric(settings.heartRate.min), max: numeric(settings.heartRate.max), buffer: numeric(settings.heartRate.buffer),
    },
    respirationRate: {
      min: numeric(settings.respirationRate.min), max: numeric(settings.respirationRate.max), buffer: numeric(settings.respirationRate.buffer),
    },
  }
}

export function MonitoringRangeCard({
  foalName,
  active,
  draft,
  persistenceAvailable,
  onApply,
  onSaveDraft,
}: MonitoringRangeCardProps) {
  const id = useId()
  const editorRef = useRef<HTMLFormElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const [editing, setEditing] = useState(false)
  const [resumingDraft, setResumingDraft] = useState(false)
  const [values, setValues] = useState<EditableSettings>(() => editableSettings(active))
  const [confirmation, setConfirmation] = useState('')
  const pending = numericSettings(values)
  const errors = validateMonitoringSettings(pending)
  const invalid = Object.keys(errors).length > 0

  useEffect(() => {
    if (editing) editorRef.current?.querySelector<HTMLInputElement>('input')?.focus()
  }, [editing])

  function closeEditor() {
    setEditing(false)
    setConfirmation('')
    editButtonRef.current?.focus()
  }

  function beginEditing(resumeDraft: boolean) {
    setValues(editableSettings(resumeDraft && draft ? draft : active))
    setResumingDraft(resumeDraft)
    setConfirmation('')
    setEditing(true)
  }

  function changeValue(kind: VitalKind, field: keyof EditableRange, value: string) {
    setValues((current) => ({ ...current, [kind]: { ...current[kind], [field]: value } }))
  }

  function apply(event: FormEvent) {
    event.preventDefault()
    if (invalid) return
    if (!onApply(pending)) {
      setConfirmation('Settings could not be applied. Review the fields and try again.')
      return
    }
    setEditing(false)
    setConfirmation(`Ranges applied for ${foalName}.`)
    editButtonRef.current?.focus()
  }

  function saveDraft() {
    if (invalid) return
    if (!onSaveDraft(pending)) {
      setConfirmation('The draft could not be saved. Review the fields and try again.')
      return
    }
    setEditing(false)
    setConfirmation('')
    editButtonRef.current?.focus()
  }

  return (
    <section className={`${styles.card} panel`} aria-labelledby={`${id}-title`}>
      <div className={styles.heading}>
        <Settings2 aria-hidden="true" />
        <div>
          <p className={styles.eyebrow}>Prototype configuration</p>
          <h2 id={`${id}-title`}>Demonstration ranges</h2>
        </div>
        <button
          ref={editButtonRef}
          className={styles.editButton}
          type="button"
          aria-label="Edit demonstration ranges"
          aria-expanded={editing}
          aria-controls={`${id}-editor`}
          onClick={() => editing ? closeEditor() : beginEditing(false)}
        >
          <Pencil aria-hidden="true" /> Edit
        </button>
      </div>

      <dl className={styles.activeRanges} aria-label="Active monitoring settings">
        {measurements.map(({ kind, label, unit }) => (
          <div key={kind}>
            <dt>{label}</dt>
            <dd>
              <strong>{active[kind].min}–{active[kind].max} {unit}</strong>
              {active[kind].buffer > 0 ? <small>+ / − {active[kind].buffer} {unit} alert buffer</small> : null}
            </dd>
          </div>
        ))}
      </dl>

      {!editing && draft ? (
        <div className={styles.savedDraft}>
          <span>Draft saved — not active.</span>
          <button type="button" onClick={() => beginEditing(true)}>Resume draft</button>
        </div>
      ) : null}

      <div id={`${id}-editor`}>
      {editing ? (
        <form ref={editorRef} className={styles.editor} onSubmit={apply} noValidate>
          <div className={styles.pendingNote}>
            <strong>{resumingDraft ? 'Saved draft · pending' : 'Pending changes'}</strong>
            <span>For {foalName}. Active monitoring stays unchanged until Apply now.</span>
          </div>

          {measurements.map(({ kind, label, unit }) => (
            <RangeControl
              key={kind}
              kind={kind}
              label={label}
              unit={unit}
              active={active[kind]}
              values={values[kind]}
              errors={errors}
              onChange={(field, value) => changeValue(kind, field, value)}
            />
          ))}

          <details className={styles.bufferSection}>
            <summary><span>Alert buffer</span><ChevronDown aria-hidden="true" /></summary>
            <p className={styles.bufferExplanation}>The buffer controls how far a reading may exceed the range. It does not set a waiting time.</p>
            {measurements.map(({ kind, label, unit }) => {
              const error = errors[`${kind}.buffer`]
              const fieldId = `${id}-${kind}-buffer`
              return (
                <div className={styles.bufferField} key={kind}>
                  <label htmlFor={fieldId}>{label}</label>
                  <div className={styles.bufferSentence}>
                    <span>Allow an additional</span>
                    <input
                      id={fieldId}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={MONITORING_UI_BOUNDS[kind].bufferMax}
                      step={MONITORING_UI_BOUNDS[kind].step}
                      value={values[kind].buffer}
                      aria-label={`${label} alert buffer`}
                      aria-invalid={Boolean(error)}
                      aria-describedby={`${fieldId}-description${error ? ` ${fieldId}-error` : ''}`}
                      onChange={(event) => changeValue(kind, 'buffer', event.target.value)}
                    />
                    <span>{unit}</span>
                  </div>
                  <span className={styles.bufferDescription} id={`${fieldId}-description`}>beyond either end of the range before alerting.</span>
                  {error ? <p className={styles.fieldError} id={`${fieldId}-error`}>{error}</p> : null}
                </div>
              )
            })}
          </details>

          <div className={styles.workflowActions}>
            <button type="submit" className={styles.applyButton} disabled={invalid}>Apply now</button>
            <button type="button" className={styles.saveButton} disabled={invalid} onClick={saveDraft}>Save for later</button>
            <button type="button" className={styles.cancelButton} onClick={closeEditor}>Cancel</button>
          </div>
          <p className={styles.workflowNote}>Save for later keeps a draft. It never activates automatically.</p>
          <p className={styles.storageNote}>
            {persistenceAvailable
              ? 'Stored in this browser for this foal/session. No settings are sent to hardware.'
              : 'Browser storage is unavailable. Settings and drafts last for this open session only.'}
          </p>
        </form>
      ) : null}
      </div>

      <div role="status" aria-live="polite" className={confirmation ? styles.confirmation : styles.emptyConfirmation}>{confirmation}</div>
      {!editing && !persistenceAvailable && (draft || confirmation) ? (
        <p className={styles.storageNote}>Browser storage is unavailable. Settings and drafts last for this open session only.</p>
      ) : null}
      <p className={styles.disclaimer}><CheckCircle2 aria-hidden="true" />{DEMONSTRATION_RANGE_DISCLAIMER}</p>
    </section>
  )
}
