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
    const { container } = render(
      <VitalSignCard
        label="Heart rate"
        signalLabel="ECG signal"
        latestReadingLabel="4 minutes ago"
        reading={{ ...baseReading, isStale: true }}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Previous value — stale')
    expect(screen.getByText('4 minutes ago')).toBeInTheDocument()
    expect(screen.getByText('92')).toBeInTheDocument()
    expect(screen.getByText('Stale reading')).toBeInTheDocument()
    expect(screen.getByText('Stale reading').closest('.monitor-status-badge')).toHaveClass('monitor-status-badge--neutral')
    expect(container.querySelector('.monitor-trend')).toHaveAttribute('data-status', 'unavailable')
    expect(screen.getByRole('img')).toHaveAccessibleName('Heart rate trend is unavailable.')
    expect(screen.queryByText('Within configured range')).not.toBeInTheDocument()
  })

  it('keeps a retained offline value visible when its current status is unavailable', () => {
    render(
      <VitalSignCard
        label="Heart rate"
        signalLabel="ECG signal"
        reading={{ ...baseReading, isStale: true, status: 'unavailable', signalQuality: 'unavailable' }}
        trendAccessibleLabel="Heart rate is increasing within its range."
      />,
    )

    expect(screen.getByText('92')).toBeInTheDocument()
    expect(screen.getByText('Stale reading')).toBeInTheDocument()
    expect(screen.getByText('Trend unavailable')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName('Heart rate trend is unavailable.')
  })

  it.each([null, Number.NaN, Number.POSITIVE_INFINITY, undefined])('does not assign a physiological status to invalid value %s', (value) => {
    render(
      <VitalSignCard
        label="Heart rate"
        signalLabel="ECG signal"
        reading={{ ...baseReading, value: value as number | null }}
      />,
    )

    expect(screen.getByText('Signal unavailable')).toBeInTheDocument()
    expect(screen.getByText('Heart rate unavailable')).toBeInTheDocument()
    expect(screen.queryByText('Within configured range')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it.each(['poor', 'unavailable'] as const)('does not assign a physiological status to %s signal quality', (signalQuality) => {
    render(
      <VitalSignCard
        label="Heart rate"
        signalLabel="ECG signal"
        reading={{ ...baseReading, signalQuality }}
      />,
    )

    const badge = screen.getByText(signalQuality === 'poor' ? 'Poor signal' : 'Signal unavailable')
    expect(badge.closest('.monitor-status-badge')).toHaveClass('monitor-status-badge--neutral')
    expect(screen.queryByText('Within configured range')).not.toBeInTheDocument()
  })

  it.each([
    { status: 'within', tone: 'positive', label: 'Within configured range' },
    { status: 'buffer', tone: 'warning', label: 'Outside range, within alert buffer' },
    { status: 'above', tone: 'critical', label: 'Beyond alert limit' },
    { status: 'below', tone: 'critical', label: 'Beyond alert limit' },
  ] as const)('pairs $status status with written context and $tone tone', ({ status, tone, label }) => {
    const { container } = render(
      <VitalSignCard
        label="Heart rate"
        signalLabel="ECG signal"
        reading={{ ...baseReading, status }}
      />,
    )

    expect(screen.getByText(label).closest('.monitor-status-badge')).toHaveClass(`monitor-status-badge--${tone}`)
    expect(container.querySelector('.monitor-trend')).toHaveAttribute('data-status', status)
  })
})
