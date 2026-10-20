import { render, screen } from '@testing-library/react'

import { TrendArrow } from './TrendArrow'
import { createTrendAccessibleLabel } from './presentation'

describe('TrendArrow', () => {
  it('exposes direction, range status, accessible context, and a signed delta', () => {
    const { container } = render(
      <TrendArrow
        direction="up"
        status="above"
        delta={3}
        accessibleLabel="Heart rate increased by 3 bpm and is beyond the upper alert limit."
      />,
    )

    expect(
      screen.getByRole('img', {
        name: 'Heart rate increased by 3 bpm and is beyond the upper alert limit.',
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

  it.each([
    { direction: 'down', delta: -3, status: 'within', phrase: 'within the configured range' },
    { direction: 'up', delta: 3, status: 'buffer', phrase: 'within the alert buffer' },
    { direction: 'down', delta: -3, status: 'buffer', phrase: 'within the alert buffer' },
    { direction: 'up', delta: 3, status: 'above', phrase: 'beyond the upper alert limit' },
    { direction: 'down', delta: -3, status: 'below', phrase: 'beyond the lower alert limit' },
  ] as const)('keeps $direction direction independent of $status status', ({ direction, delta, status, phrase }) => {
    const { container } = render(
      <TrendArrow
        direction={direction}
        status={status}
        delta={delta}
        accessibleLabel={createTrendAccessibleLabel('Heart rate', direction, delta, 'bpm', status)}
      />,
    )

    expect(container.firstChild).toHaveClass(`monitor-trend--${status}`)
    expect(container.firstChild).toHaveAttribute('data-direction', direction)
    expect(screen.getByRole('img')).toHaveAccessibleName(new RegExp(phrase))
  })
})
