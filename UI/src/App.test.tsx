import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { App } from './App'
import { createMockFoalService } from './services/mockFoalService'

function renderApp(initialPath = '/') {
  const service = createMockFoalService({ startOnSubscribe: false })
  const user = userEvent.setup()

  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App service={service} />
    </MemoryRouter>,
  )

  return { service, user }
}

describe('application navigation and monitoring interactions', () => {
  it('navigates from the overview to a patient monitor and clinical details', async () => {
    const { user } = renderApp()

    const mapleLink = screen.getByRole('link', { name: /open monitor for maple/i })
    await user.click(mapleLink)

    expect(screen.getByRole('heading', { name: 'Active alerts' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Maple' })).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /view clinical details and waveforms/i }),
    )

    expect(screen.getByRole('heading', { name: 'Live ECG waveform' })).toBeInTheDocument()
    expect(screen.getByText(/monitoring continues when this view is closed/i)).toBeInTheDocument()
  })

  it('keeps an acknowledged alert active and records it in recent activity', async () => {
    const { user } = renderApp('/foals/maple')
    const alert = screen.getByRole('alert')

    await user.click(within(alert).getByRole('button', { name: 'Acknowledge' }))

    expect(within(alert).getByRole('button', { name: 'Acknowledged' })).toBeDisabled()
    expect(within(alert).getByText(/condition remains active/i)).toBeInTheDocument()
    expect(screen.getAllByText(/alert acknowledged/i).length).toBeGreaterThan(0)
  })

  it('opens a full history route with working category filters', async () => {
    const { user } = renderApp('/foals/maple/history')

    expect(screen.getByRole('heading', { name: 'Maple event history' })).toBeInTheDocument()
    const staffFilter = screen.getByRole('button', { name: 'Staff actions' })
    await user.click(staffFilter)

    expect(staffFilter).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('Staff action').length).toBeGreaterThan(0)
  })

  it('shows preserved measurements as stale when the device is offline', () => {
    const { service } = renderApp('/foals/luna')
    act(() => {
      service.setScenario('luna', 'offline')
    })

    expect(screen.getByText('DEVICE OFFLINE')).toBeInTheDocument()
    expect(screen.getByText(/previous heart rate/i)).toHaveTextContent(/stale/i)
    expect(screen.getByText(/previous respiration rate/i)).toHaveTextContent(/stale/i)
  })

  it('marks clinical-detail measurements and posture as retained when offline', () => {
    const { service } = renderApp('/foals/luna/clinical')
    act(() => {
      service.setScenario('luna', 'offline')
    })

    expect(screen.getByText(/live monitoring is unavailable/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ECG waveform unavailable' })).toBeInTheDocument()
    expect(screen.getByText(/last known posture · stale/i)).toBeInTheDocument()
    expect(screen.getAllByText(/retained data|trend is stale/i).length).toBeGreaterThan(0)
  })

  it('does not mark movement stale for an independent ECG-only failure', () => {
    renderApp('/foals/orion')

    expect(screen.getByText('Motion sensor connected')).toBeInTheDocument()
    expect(screen.queryByText(/last known movement state/i)).not.toBeInTheDocument()
  })
})
