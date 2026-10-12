import { render, screen } from '@testing-library/react'

import type { VitalReading } from '../../types/monitoring'
import { VitalSignCard } from './VitalSignCard'

const baseReading: VitalReading = {
  value: 92,
  previousValue: 89,
  delta: 3,
  unit: 'bpm',
  trend: 'up',
  status: 'within',
  signalQuality: 'good',
  lastValidAt: '2026-10-07T13:42:18.000Z',
  isStale: false,
}

describe('VitalSignCard', () => {
  it('shows an unavailable state without substituting zero', () => {
    render(
      <VitalSignCard
        label="Heart rate"
        signalLabel="ECG signal"
        unavailableHint="Check ECG electrode contact."
        reading={{
          ...baseReading,
          value: null,
          delta: null,
          status: 'unavailable',
          signalQuality: 'unavailable',
          lastValidAt: null,
        }}
      />,
    )

    expect(screen.getByText('Heart rate unavailable')).toBeInTheDocument()
    expect(screen.getByText('Check ECG electrode contact.')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('clearly identifies a retained value as stale', () => {
    render(
      <VitalSignCard
        label="Heart rate"
        signalLabel="ECG signal"
        latestReadingLabel="4 minutes ago"
        reading={{ ...baseReading, isStale: true }}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Previous value — stale')
    expect(screen.getByText('4 minutes ago')).toBeInTheDocument()
  })
})
