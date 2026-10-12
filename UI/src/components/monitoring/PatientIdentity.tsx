import { CalendarDays, ImageOff, MapPin, ShieldPlus } from 'lucide-react'

import type { Foal } from '../../types/monitoring'

import './PatientIdentity.css'

export type PatientIdentityFoal = Pick<
  Foal,
  'name' | 'patientId' | 'mareName' | 'stall' | 'photoUrl' | 'dateOfBirth'
>

export interface PatientIdentityProps {
  foal: PatientIdentityFoal
  ageLabel?: string
  imageAlt?: string
  className?: string
}

function formatBirthDate(dateOfBirth: string) {
  const parsed = new Date(`${dateOfBirth.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return dateOfBirth

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed)
}

/** Compact identification block intended for the upper-right monitor rail. */
export function PatientIdentity({
  foal,
  ageLabel,
  imageAlt = `${foal.name}, foal patient`,
  className = '',
}: PatientIdentityProps) {
  return (
    <aside
      className={`monitor-patient ${className}`.trim()}
      aria-labelledby="monitor-patient-name"
    >
      <div className="monitor-patient__photo">
        {foal.photoUrl ? (
          <img src={foal.photoUrl} alt={imageAlt} />
        ) : (
          <div className="monitor-patient__photo-fallback" aria-label="No patient photograph available">
            <ImageOff aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="monitor-patient__content">
        <span className="monitor-patient__eyebrow">Patient identity</span>
        <h2 id="monitor-patient-name">{foal.name}</h2>
        <p className="monitor-patient__id">
          <ShieldPlus aria-hidden="true" />
          Patient ID {foal.patientId}
        </p>

        <dl>
          <div>
            <dt>Mare</dt>
            <dd>{foal.mareName}</dd>
          </div>
          <div>
            <dt>
              <MapPin aria-hidden="true" />
              Location
            </dt>
            <dd>{foal.stall}</dd>
          </div>
          <div>
            <dt>
              <CalendarDays aria-hidden="true" />
              {ageLabel ? 'Age' : 'Date of birth'}
            </dt>
            <dd>{ageLabel ?? formatBirthDate(foal.dateOfBirth)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}
