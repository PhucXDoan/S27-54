import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { App } from './App'
import { createMockFoalService } from './services/mockFoalService'

function renderMonitor(foalId = 'luna') {
  const service = createMockFoalService({ startOnSubscribe: false, storage: null })
  const user = userEvent.setup()

  render(
    <MemoryRouter initialEntries={[`/foals/${foalId}`]}>
      <App service={service} />
    </MemoryRouter>,
  )

  return { service, user }
}

const configurationCard = () =>
  screen.getByRole('region', { name: 'Demonstration ranges' })

const numberField = (name: string) =>
  within(configurationCard()).getByRole('spinbutton', { name })

function changeNumber(name: string, value: number | string) {
  fireEvent.change(numberField(name), { target: { value: String(value) } })
}

describe('manual monitoring range configuration', () => {
  it('keeps the summary compact and synchronizes each slider handle with its number field', async () => {
    const { user } = renderMonitor()
    const card = within(configurationCard())

    expect(card.getByText('60–120 bpm')).toBeInTheDocument()
    expect(card.getByText('20–50 breaths/min')).toBeInTheDocument()
    expect(card.getByText(/not clinically validated/i)).toBeInTheDocument()
    expect(card.queryByRole('slider')).not.toBeInTheDocument()

    await user.click(card.getByRole('button', { name: 'Edit demonstration ranges' }))

    const handles = [
      ['Heart rate lower limit', 65],
      ['Heart rate upper limit', 125],
      ['Respiration lower limit', 25],
      ['Respiration upper limit', 55],
    ] as const

    expect(card.getAllByRole('slider')).toHaveLength(4)
    for (const [name, value] of handles) {
      const slider = card.getByRole('slider', { name: `${name} slider` })
      fireEvent.change(slider, { target: { value: String(value) } })
      expect(numberField(name)).toHaveValue(value)

      changeNumber(name, value + 1)
      expect(slider).toHaveValue(String(value + 1))
    }

    expect(card.getByText('Alert buffer', { exact: true }).closest('details')).not.toHaveAttribute('open')
    expect(numberField('Heart rate alert buffer')).not.toBeVisible()
    await user.click(card.getByText('Alert buffer', { exact: true }))
    expect(numberField('Heart rate alert buffer')).toHaveValue(0)
    expect(numberField('Respiration alert buffer')).toHaveValue(0)
    expect(card.getByText(/does not set a waiting time/i)).toBeInTheDocument()
  })

  it('explains invalid limits and buffers beside the fields and prevents activation', async () => {
    const { service, user } = renderMonitor()
    const original = structuredClone(service.getFoal('luna')!.monitoringSettings)
    await user.click(screen.getByRole('button', { name: 'Edit demonstration ranges' }))

    changeNumber('Heart rate lower limit', original.heartRate.max)
    expect(numberField('Heart rate lower limit')).toHaveAttribute('aria-invalid', 'true')
    expect(numberField('Heart rate lower limit')).toHaveAccessibleDescription(/lower.*smaller|lower.*less/i)
    await user.click(screen.getByRole('button', { name: 'Apply now' }))
    expect(service.getFoal('luna')!.monitoringSettings).toEqual(original)

    changeNumber('Heart rate lower limit', original.heartRate.min)
    changeNumber('Respiration upper limit', '')
    expect(numberField('Respiration upper limit')).toHaveAttribute('aria-invalid', 'true')
    await user.click(screen.getByRole('button', { name: 'Apply now' }))
    expect(service.getFoal('luna')!.monitoringSettings).toEqual(original)

    changeNumber('Respiration upper limit', original.respirationRate.max)
    await user.click(within(configurationCard()).getByText('Alert buffer', { exact: true }))
    changeNumber('Heart rate alert buffer', -1)
    expect(numberField('Heart rate alert buffer')).toHaveAttribute('aria-invalid', 'true')
    expect(numberField('Heart rate alert buffer')).toHaveAccessibleDescription(/zero|nonnegative|0|at least/i)
    await user.click(screen.getByRole('button', { name: 'Apply now' }))
    expect(service.getFoal('luna')!.monitoringSettings).toEqual(original)
    expect(service.getFoal('luna')!.activity.some((event) => event.type === 'monitoring-settings-applied')).toBe(false)
  })

  it('saves a pending draft, preserves it when edits are canceled, and activates it only on apply', async () => {
    const { service, user } = renderMonitor()
    const original = structuredClone(service.getFoal('luna')!.monitoringSettings)
    await user.click(screen.getByRole('button', { name: 'Edit demonstration ranges' }))
    changeNumber('Heart rate lower limit', 70)
    changeNumber('Heart rate upper limit', 110)
    await user.click(within(configurationCard()).getByText('Alert buffer', { exact: true }))
    changeNumber('Heart rate alert buffer', 10)
    await user.click(screen.getByRole('button', { name: 'Save for later' }))

    const savedDraft = structuredClone(service.getFoal('luna')!.monitoringSettingsDraft)
    expect(service.getFoal('luna')!.monitoringSettings).toEqual(original)
    expect(savedDraft?.heartRate).toEqual({ min: 70, max: 110, buffer: 10 })
    expect(within(configurationCard()).getByText('Draft saved — not active.')).toBeInTheDocument()
    expect(within(configurationCard()).getByText('60–120 bpm')).toBeInTheDocument()
    expect(within(configurationCard()).queryByRole('slider')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Resume draft' }))
    expect(numberField('Heart rate lower limit')).toHaveValue(70)
    expect(within(configurationCard()).getByText(/pending/i)).toBeInTheDocument()
    changeNumber('Heart rate lower limit', 75)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(service.getFoal('luna')!.monitoringSettingsDraft).toEqual(savedDraft)
    expect(service.getFoal('luna')!.monitoringSettings).toEqual(original)

    await user.click(screen.getByRole('button', { name: 'Resume draft' }))
    expect(numberField('Heart rate lower limit')).toHaveValue(70)
    await user.click(screen.getByRole('button', { name: 'Apply now' }))
    expect(service.getFoal('luna')!.monitoringSettings).toEqual(savedDraft)
    expect(service.getFoal('luna')!.monitoringSettingsDraft).toBeNull()
    expect(within(configurationCard()).getByText('70–110 bpm')).toBeInTheDocument()
    expect(within(configurationCard()).getByText(/applied.*luna|luna.*applied/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resume draft' })).not.toBeInTheDocument()
  })

  it('keeps active settings and drafts isolated when navigating between foals', async () => {
    const { service, user } = renderMonitor()
    const mapleOriginal = structuredClone(service.getFoal('maple')!.monitoringSettings)

    await user.click(screen.getByRole('button', { name: 'Edit demonstration ranges' }))
    changeNumber('Heart rate upper limit', 130)
    await user.click(screen.getByRole('button', { name: 'Apply now' }))
    await user.click(screen.getByRole('button', { name: 'Edit demonstration ranges' }))
    changeNumber('Respiration upper limit', 55)
    await user.click(screen.getByRole('button', { name: 'Save for later' }))

    await user.click(screen.getByRole('link', { name: 'FoalWatch patient board' }))
    await user.click(screen.getByRole('link', { name: /open monitor for maple/i }))
    expect(service.getFoal('maple')!.monitoringSettings).toEqual(mapleOriginal)
    expect(service.getFoal('maple')!.monitoringSettingsDraft).toBeNull()
    expect(within(configurationCard()).getByText('60–120 bpm')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resume draft' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'FoalWatch patient board' }))
    await user.click(screen.getByRole('link', { name: /open monitor for luna/i }))
    expect(within(configurationCard()).getByText('60–130 bpm')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Resume draft' }))
    expect(numberField('Respiration upper limit')).toHaveValue(55)
    expect(numberField('Heart rate upper limit')).toHaveValue(130)
  })

  it('updates status and arrow color from applied settings without changing measurements or trend direction', async () => {
    const { service, user } = renderMonitor()
    const before = structuredClone(service.getFoal('luna')!)
    const heartCard = within(screen.getByRole('article', { name: 'Heart rate' }))
    const arrow = heartCard.getByRole('img', { name: /heart rate/i })
    const arrowPath = arrow.querySelector('path')!.getAttribute('d')
    const direction = arrow.closest('[data-direction]')!.getAttribute('data-direction')
    expect(heartCard.getByText('Within configured range')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit demonstration ranges' }))
    changeNumber('Heart rate upper limit', 80)
    await user.click(within(configurationCard()).getByText('Alert buffer', { exact: true }))
    changeNumber('Heart rate alert buffer', 10)
    await user.click(screen.getByRole('button', { name: 'Apply now' }))

    expect(heartCard.getByText('Outside range, within alert buffer')).toBeInTheDocument()
    expect(arrow.closest('[data-status]')).toHaveAttribute('data-status', 'buffer')
    expect(service.getFoal('luna')!.alerts.filter((alert) => alert.category === 'physiological' && alert.status === 'active')).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: 'Edit demonstration ranges' }))
    changeNumber('Heart rate upper limit', 70)
    await user.click(screen.getByRole('button', { name: 'Apply now' }))

    const after = service.getFoal('luna')!
    expect(heartCard.getByText('Beyond alert limit')).toBeInTheDocument()
    expect(arrow.closest('[data-status]')).toHaveAttribute('data-status', 'above')
    expect(arrow.closest('[data-direction]')).toHaveAttribute('data-direction', direction)
    expect(arrow.querySelector('path')).toHaveAttribute('d', arrowPath)
    expect(after.measurement.heartRate).toMatchObject({
      value: before.measurement.heartRate.value,
      previousValue: before.measurement.heartRate.previousValue,
      delta: before.measurement.heartRate.delta,
      trend: before.measurement.heartRate.trend,
      lastValidAt: before.measurement.heartRate.lastValidAt,
    })
    expect(after.measurement.timestamp).toBe(before.measurement.timestamp)
    expect(after.clinicalSeries).toEqual(before.clinicalSeries)
    const applicationEvent = after.activity.find((event) => event.type === 'monitoring-settings-applied')!
    expect(applicationEvent).toMatchObject({
      foalId: 'luna',
      sessionId: after.sessionId,
      category: 'staff',
      monitoringSettingsChange: {
        oldSettings: { heartRate: { min: 60, max: 80, buffer: 10 } },
        newSettings: { heartRate: { min: 60, max: 70, buffer: 10 } },
      },
    })

    await user.click(screen.getByRole('button', { name: 'History' }))
    expect(screen.getByRole('heading', { name: 'Luna event history' })).toBeInTheDocument()
    expect(screen.getAllByText(applicationEvent.description).length).toBeGreaterThan(0)
  })

  it.each(['offline', 'electrodeDisconnected'] as const)(
    'preserves unavailable sensor presentation when settings are applied during %s',
    async (scenario) => {
      const { service, user } = renderMonitor()
      act(() => {
        service.setScenario('luna', scenario)
      })
      const before = structuredClone(service.getFoal('luna')!.measurement.heartRate)

      await user.click(screen.getByRole('button', { name: 'Edit demonstration ranges' }))
      changeNumber('Heart rate upper limit', 130)
      await user.click(screen.getByRole('button', { name: 'Apply now' }))

      const heart = within(screen.getByRole('article', { name: 'Heart rate' }))
      expect(heart.getByText(scenario === 'offline' ? 'Stale reading' : 'Signal unavailable')).toBeInTheDocument()
      expect(heart.queryByText('Within configured range')).not.toBeInTheDocument()
      expect(heart.queryByText('Beyond alert limit')).not.toBeInTheDocument()
      expect(service.getFoal('luna')!.measurement.heartRate).toMatchObject({
        value: before.value,
        isStale: before.isStale,
        signalQuality: before.signalQuality,
        status: 'unavailable',
      })
      expect(service.getFoal('luna')!.alerts.filter((alert) => alert.category === 'physiological' && alert.status === 'active')).toHaveLength(0)
    },
  )
})
