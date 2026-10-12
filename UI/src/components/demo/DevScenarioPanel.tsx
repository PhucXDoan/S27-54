import { Bug, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import type { Foal, Scenario, ScenarioId } from '../../types/monitoring'

import './DevScenarioPanel.css'

interface DevScenarioPanelProps {
  foals: Foal[]
  scenarios: readonly Scenario[]
  scenarioByFoalId: Record<string, ScenarioId>
  routeFoalId?: string
  onSetScenario: (foalId: string, scenario: ScenarioId) => void
  onReset: () => void
}

export function DevScenarioPanel({
  foals,
  scenarios,
  scenarioByFoalId,
  routeFoalId,
  onSetScenario,
  onReset,
}: DevScenarioPanelProps) {
  const [selectedFoalId, setSelectedFoalId] = useState(routeFoalId ?? foals[0]?.id ?? '')

  const activeScenario = scenarioByFoalId[selectedFoalId] ?? 'normal'
  const scenarioDescription = scenarios.find((scenario) => scenario.id === activeScenario)?.description

  return (
    <details className="demo-panel">
      <summary>
        <span className="demo-panel__bug"><Bug aria-hidden="true" /></span>
        <span>
          <strong>Demo scenarios</strong>
          <small>Development tool</small>
        </span>
      </summary>
      <div className="demo-panel__content">
        <p>This control is separate from the clinical interface.</p>
        <label>
          Patient
          <select value={selectedFoalId} onChange={(event) => setSelectedFoalId(event.target.value)}>
            {foals.map((foal) => (
              <option key={foal.id} value={foal.id}>
                {foal.name} · {foal.patientId}
              </option>
            ))}
          </select>
        </label>
        <label>
          Simulated state
          <select
            value={activeScenario}
            onChange={(event) => onSetScenario(selectedFoalId, event.target.value as ScenarioId)}
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select>
        </label>
        <small className="demo-panel__description">{scenarioDescription}</small>
        <button type="button" onClick={onReset}>
          <RotateCcw aria-hidden="true" /> Reset all demo data
        </button>
      </div>
    </details>
  )
}
