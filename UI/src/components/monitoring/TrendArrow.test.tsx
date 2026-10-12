import { render, screen } from '@testing-library/react'

import { TrendArrow } from './TrendArrow'

describe('TrendArrow', () => {
  it('exposes direction, range status, accessible context, and a signed delta', () => {
    const { container } = render(
      <TrendArrow
        direction="up"
        status="above"
        delta={3}
        accessibleLabel="Heart rate increased by 3 bpm and is above the configured range."
      />,
    )

    expect(
      screen.getByRole('img', {
        name: 'Heart rate increased by 3 bpm and is above the configured range.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('+3 bpm')).toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('data-direction', 'up')
    expect(container.firstChild).toHaveAttribute('data-status', 'above')
  })

  it('uses a non-directional message for stable values', () => {
    render(
      <TrendArrow
        direction="stable"
        status="within"
        delta={0}
        accessibleLabel="Heart rate has no significant change and remains within range."
      />,
    )

    expect(screen.getByText('No significant change')).toBeInTheDocument()
  })

  it('does not imply a trend when the signal is unavailable', () => {
    render(
      <TrendArrow
        direction="up"
        status="unavailable"
        delta={4}
        accessibleLabel="Heart rate trend unavailable."
      />,
    )

    expect(screen.getByText('Trend unavailable')).toBeInTheDocument()
  })

  it('formats falling deltas with a true minus sign', () => {
    render(
      <TrendArrow
        direction="down"
        status="within"
        delta={-2}
        deltaUnit="breaths/min"
        accessibleLabel="Respiration rate decreased by 2 breaths per minute."
      />,
    )

    expect(screen.getByText('\u22122 breaths/min')).toBeInTheDocument()
  })
})
