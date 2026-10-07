import { useSyncExternalStore } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ClinicalDetails } from './components/clinical'
import { DevScenarioPanel } from './components/demo/DevScenarioPanel'
import { AppHeader } from './components/layout/AppHeader'
import {
  type MockFoalService,
  mockFoalService,
  selectFoalById,
} from './services/mockFoalService'
import type { ScenarioId } from './types/monitoring'
import { HistoryPage } from './pages/HistoryPage'
import { MonitorPage } from './pages/MonitorPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OverviewPage } from './pages/OverviewPage'

interface AppProps {
  service?: MockFoalService
}

const DEMO_TOOLS_ENABLED =
  import.meta.env.DEV ||
  (typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('demo') === '1')

interface PatientRouteProps {
  service: MockFoalService
  view: 'monitor' | 'history' | 'clinical'
}

function PatientRoute({ service, view }: PatientRouteProps) {
  const { foalId } = useParams()
  const navigate = useNavigate()
  const snapshot = useSyncExternalStore(
    service.subscribe,
    service.getSnapshot,
    service.getServerSnapshot,
  )
  const foal = selectFoalById(snapshot, foalId)

  if (!foal) return <NotFoundPage />

  if (view === 'history') return <HistoryPage foal={foal} />
  if (view === 'clinical') {
    return (
      <ClinicalDetails
        foal={foal}
        onBack={() => navigate(`/foals/${foal.id}`)}
        onOverview={() => navigate('/')}
      />
    )
  }

  return (
    <MonitorPage
      foal={foal}
      onAcknowledgeAlert={(alertId) => service.acknowledgeAlert(foal.id, alertId)}
    />
  )
}

function ApplicationRoutes({ service }: { service: MockFoalService }) {
  const snapshot = useSyncExternalStore(
    service.subscribe,
    service.getSnapshot,
    service.getServerSnapshot,
  )

  return (
    <Routes>
      <Route path="/" element={<OverviewPage foals={snapshot.foals} />} />
      <Route path="/foals/:foalId" element={<PatientRoute service={service} view="monitor" />} />
      <Route
        path="/foals/:foalId/history"
        element={<PatientRoute service={service} view="history" />}
      />
      <Route
        path="/foals/:foalId/clinical"
        element={<PatientRoute service={service} view="clinical" />}
      />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  )
}

function DemoControls({ service }: { service: MockFoalService }) {
  const location = useLocation()
  const snapshot = useSyncExternalStore(
    service.subscribe,
    service.getSnapshot,
    service.getServerSnapshot,
  )
  const routeMatch = location.pathname.match(/^\/foals\/([^/]+)/)
  const routeFoalId = routeMatch?.[1]
  if (!DEMO_TOOLS_ENABLED) return null

  return (
    <DevScenarioPanel
      key={routeFoalId ?? 'overview'}
      foals={snapshot.foals}
      scenarios={service.getScenarios()}
      scenarioByFoalId={snapshot.scenarioByFoalId}
      routeFoalId={routeFoalId}
      onSetScenario={(foalId, scenario) => service.setScenario(foalId, scenario as ScenarioId)}
      onReset={service.reset}
    />
  )
}

export function App({ service = mockFoalService }: AppProps) {
  return (
    <div className="app-shell">
      <AppHeader />
      <ApplicationRoutes service={service} />
      <DemoControls service={service} />
    </div>
  )
}
