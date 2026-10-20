# FoalWatch UI prototype

A frontend-only monitoring prototype for a newborn foal senior-design project. It demonstrates how equine medical staff could review multiple patients, open an individual live monitor, acknowledge alerts, inspect event history, and view simulated clinical waveforms.

This project does **not** connect to sensors, a hospital network, MQTT, Wi-Fi hardware, a database, or a backend. All measurements, thresholds, alerts, and waveforms are simulated. Demonstration ranges are configurable placeholders and are not clinically validated.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

Other checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Routes and interactions

- `/` — prioritized multi-foal patient board.
- `/foals/:foalId` — individual monitor with connection status, alerts, vital trends, movement, device health, and recent activity.
- `/foals/:foalId/history` — complete filterable event history.
- `/foals/:foalId/clinical` — full-width simulated ECG, respiration, longer trends, and movement insights.
- Alert acknowledgement records the staff action while leaving the active condition visible.
- Missing measurements are shown as unavailable, never as zero. Offline values are preserved and explicitly marked stale.

## Demo scenarios

When running `npm run dev`, open the **Demo scenarios** control in the lower-right corner. Select a patient, then choose:

- Normal monitoring
- High or low heart rate
- High respiration
- Electrode disconnected
- Respiration sensor unavailable
- Device offline
- Low battery
- Unacknowledged alert
- Acknowledged alert

The control is intentionally separated from the clinical UI. In a production build it is hidden unless the URL includes `?demo=1`.

Mock state is held in memory. Scenario selections and alert acknowledgements therefore reset after a full page reload.

## Manual monitoring ranges

Open a foal's monitor and select **Edit** in the existing **Demonstration ranges** card. Adjust the lower and upper handles or their linked number fields. Expand **Alert buffer** to set a symmetric, nonnegative buffer for each measurement; the buffer is a value allowance, not a waiting time.

**Apply now** activates valid settings for that foal/session, clears its draft, re-evaluates the existing readings, and records the previous and new settings in activity history. **Save for later** stores a pending draft without changing active monitoring or scheduling activation. **Resume draft** reopens it; **Cancel** preserves the last explicitly saved draft.

Active settings and drafts are stored in this browser's local storage, keyed by foal and prototype session ID. If storage is unavailable, the card explains that they will last only for the open session. Settings are not sent to real hardware.

Statuses use both color and text: green inside the configured range, amber outside the range but within the inclusive buffer boundaries, and red beyond the alert limit. Only red readings are eligible for physiological simulated alerts. Unavailable, stale, or poor-signal measurements do not receive a normal physiological status.

## Architecture

- `src/pages/` — route-level overview, monitor, and history views.
- `src/components/monitoring/` — reusable vital, trend-arrow, connection, identity, movement, and alert components.
- `src/components/activity/` — recent activity and full history.
- `src/components/clinical/` — simulated waveforms, longer trends, and posture insights.
- `src/types/monitoring.ts` — typed domain model.
- `src/data/mockFoals.ts` — initial patients, events, waveform fixtures, and scenario catalog.
- `src/services/mockFoalService.ts` — subscription-based simulation, scenario changes, alert acknowledgement, and gradual updates.
- `src/config/demonstrationRanges.ts` — default demonstration limits and update timing.
- `src/config/monitoringSettings.ts` — centralized editor bounds, defaults, and field validation.
- `src/services/monitoringSettingsStorage.ts` — per-foal/session browser persistence for active settings and drafts.
- `src/utils/` — formatting and status/trend mapping.

## Future integration points

Replace `mockFoalService` with a real API-backed service that exposes the same snapshot/subscription boundary; presentation components do not depend on transport details. The compact in-card range editor currently updates prototype session settings through that service. Any future API can replace browser persistence and use the same typed settings and centralized validation.
