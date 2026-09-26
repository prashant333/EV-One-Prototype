/**
 * Charging Sessions & Energy Operations.
 * Built to match Design/intellicar_one_ev_platform-session_and_driver/charging_sessions_intellicar_one.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/layout/AppShell'
import { ActionButton } from '@/components/ActionButton'
import { EmptyState, Icon, Panel, PanelHeader, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import { getDriver } from '@/data/fleet'
import {
  CHARGING_SESSIONS_ALL,
  DEPOTS,
  DEPOT_POWER_SERIES,
  ENERGY_ASSETS,
  ENERGY_KPIS,
  PEAK_TARIFF_WINDOW,
  PORT_MIX,
  POWER_AXIS_NOTES,
  REMOTE_CHARGE_OPTIONS,
  ROTATION_CARD,
  SANCTIONED_MAX_KW,
  SESSION_INSPECTOR,
  SESSION_TOTALS,
  sessionVehicle,
  type ChargingSession,
  type EnergyKpi,
  type SessionState,
} from '@/data/charging'

const ROWS_PER_PAGE = 4

const TONE_TEXT = {
  ok: 'text-state-ok',
  warn: 'text-state-warn',
  crit: 'text-state-crit',
  neutral: 'text-on-surface-variant',
  primary: 'text-primary',
} as const

const TONE_BAR = {
  ok: 'bg-state-ok',
  warn: 'bg-state-warn',
  crit: 'bg-state-crit',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
} as const

const STATUS_META: Record<ChargingSession['status'], { label: string; tone: 'ok' | 'warn' | 'crit' | 'idle' | 'info' }> =
  {
    'fast-charge': { label: 'Fast Charge', tone: 'ok' },
    'top-off-balancing': { label: 'Top-off Balancing', tone: 'info' },
    'thermal-throttled': { label: 'Thermal Throttled', tone: 'warn' },
    'rapid-180': { label: 'Rapid 180kW', tone: 'ok' },
    completed: { label: 'Completed', tone: 'idle' },
    terminated: { label: 'Terminated', tone: 'crit' },
    queued: { label: 'Queued', tone: 'info' },
  }

// --- KPI card ----------------------------------------------------------------

function EnergyKpiCard({ kpi }: { kpi: EnergyKpi }) {
  return (
    <div className="panel flex flex-col p-space-md">
      <div className="mb-space-xs flex items-start justify-between gap-space-sm">
        <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">
          {kpi.label}
        </span>
        {kpi.badge ? (
          <StatusBadge tone="ok" pulse>
            {kpi.badge}
          </StatusBadge>
        ) : (
          <Icon name={kpi.icon} className={`text-[20px] ${TONE_TEXT[kpi.captionTone]}`} />
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-space-xs">
        <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">{kpi.value}</span>
        {kpi.unit && <span className="font-body-sm text-body-sm text-on-surface-variant">{kpi.unit}</span>}
      </div>

      {kpi.caption && (
        <p className={`font-body-sm text-body-sm mt-0.5 ${TONE_TEXT[kpi.captionTone]}`}>{kpi.caption}</p>
      )}

      {kpi.rows.length > 0 && (
        <dl className="font-body-sm text-body-sm mt-space-xs space-y-0.5">
          {kpi.rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-space-sm">
              <dt
                className={
                  row.tone === 'primary'
                    ? 'text-primary'
                    : row.tone === 'secondary'
                      ? 'text-secondary'
                      : 'text-on-surface-variant'
                }
              >
                {row.label}
              </dt>
              {row.value && <dd className="font-telemetry-sm text-telemetry-sm tnum text-on-surface">{row.value}</dd>}
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto pt-space-sm">
        <div className="h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
          <div className={`h-full rounded-pill ${TONE_BAR[kpi.progressTone]}`} style={{ width: `${kpi.progress}%` }} />
        </div>
      </div>
    </div>
  )
}

// --- Depot aggregate power ---------------------------------------------------

function DepotPowerPanel() {
  return (
    <Panel className="xl:col-span-2">
      <div className="mb-space-md flex flex-col gap-space-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">Depot Aggregate Power</h2>
            <StatusBadge tone="info" pulse>
              Smart-Load Throttling: Active
            </StatusBadge>
          </div>
          <p className="font-body-sm text-body-sm mt-0.5 max-w-xl text-on-surface-variant">
            Real-time demand vs. sanctioned {SANCTIONED_MAX_KW.toLocaleString()} kW limit with tariff-based automated
            load modulation.
          </p>
        </div>

        <div className="font-body-sm text-body-sm flex flex-wrap items-center gap-space-md">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            DC Fast Load
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-secondary" />
            AC Plugs
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-state-crit" />
            Sanctioned Max ({SANCTIONED_MAX_KW.toLocaleString()} kW)
          </span>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DEPOT_POWER_SERIES} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="dcLoadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0037b0" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0037b0" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="acLoadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4b41e1" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#4b41e1" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#e2e7ff" vertical={false} />

            {/* Peak DISCOM tariff window */}
            <ReferenceArea
              x1={PEAK_TARIFF_WINDOW.from}
              x2={PEAK_TARIFF_WINDOW.to}
              fill="#f59e0b"
              fillOpacity={0.12}
              label={{
                value: PEAK_TARIFF_WINDOW.label.toUpperCase(),
                position: 'insideTop',
                fontSize: 10,
                fill: '#92400e',
                fontFamily: 'Inter',
              }}
            />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 1300]}
              ticks={[300, 600, 900, 1200]}
              tickFormatter={(v: number) => `${v} kW`}
            />

            <ReferenceLine y={SANCTIONED_MAX_KW} stroke="#e11d48" strokeDasharray="6 4" strokeWidth={1.5} />

            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #c4c5d7', fontFamily: 'Inter', fontSize: 12 }}
              formatter={(v: number, name: string) => [`${v} kW`, name === 'dc' ? 'DC Fast Load' : 'AC Plugs']}
            />

            <Area type="monotone" dataKey="dc" stroke="#0037b0" strokeWidth={2} fill="url(#dcLoadGrad)" name="dc" />
            <Area type="monotone" dataKey="ac" stroke="#4b41e1" strokeWidth={2} fill="url(#acLoadGrad)" name="ac" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="font-telemetry-sm text-telemetry-sm mb-space-md flex flex-wrap gap-space-md text-outline">
        {POWER_AXIS_NOTES.map((n) => (
          <span key={n.time}>
            {n.time} ({n.note})
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
        {ENERGY_ASSETS.map((a) => (
          <div
            key={a.label}
            className="flex items-start gap-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm"
          >
            <Icon name={a.icon} className="mt-0.5 shrink-0 text-[18px] text-state-ok" />
            <div className="min-w-0">
              <p className="font-label-sm text-label-sm uppercase text-outline">{a.label}</p>
              <p className="font-telemetry-sm text-telemetry-sm font-semibold text-on-surface">{a.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function PortMixPanel() {
  const barTone = { primary: 'bg-primary', secondary: 'bg-secondary', idle: 'bg-state-idle' } as const

  return (
    <Panel>
      <PanelHeader title="Connector Architecture & Mix" action={<Icon name="dataset" className="text-[20px] text-primary" />} />

      <ul className="space-y-space-md">
        {PORT_MIX.map((p) => (
          <li key={p.label}>
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-space-sm">
              <span className="font-body-sm text-body-sm flex items-center gap-1.5 text-on-surface">
                <span className={`h-2 w-2 rounded-pill ${barTone[p.tone]}`} />
                {p.label}
              </span>
              <span className="font-telemetry-sm text-telemetry-sm tnum shrink-0 font-semibold text-on-surface">
                {p.pct}% <span className="text-on-surface-variant">({p.count})</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-container-high">
              <div className={`h-full rounded-pill ${barTone[p.tone]}`} style={{ width: `${p.pct}%` }} />
            </div>
          </li>
        ))}
      </ul>

      {/* Bay rotation card — drawn rather than a hotlinked photo, as elsewhere. */}
      <div className="relative mt-space-lg overflow-hidden rounded-xl border border-outline-variant/40 bg-inverse-surface">
        <svg viewBox="0 0 320 150" className="h-[150px] w-full" role="img" aria-label="Depot charging bay">
          <rect width="320" height="150" fill="#283044" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${18 + i * 62}, 44)`}>
              <rect x="0" y="0" width="44" height="26" rx="3" fill="#eef0ff" opacity="0.92" />
              <path d="M2 26 L8 40 L38 40 L44 26 Z" fill="#dae2fd" opacity="0.8" />
              <circle cx="12" cy="43" r="4" fill="#131b2e" />
              <circle cx="34" cy="43" r="4" fill="#131b2e" />
              <rect x="50" y="6" width="7" height="38" rx="2" fill="#b7c4ff" opacity="0.5" />
              <circle cx="53.5" cy="12" r="2" fill="#76eab6" />
            </g>
          ))}
          <line x1="0" y1="96" x2="320" y2="96" stroke="#434655" strokeWidth="2" />
        </svg>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-inverse-surface to-transparent p-space-sm">
          <p className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-inverse-primary">
            {ROTATION_CARD.title}
          </p>
          <p className="font-body-sm text-body-sm text-inverse-on-surface">{ROTATION_CARD.caption}</p>
        </div>
      </div>
    </Panel>
  )
}

// --- Session inspector sheet -------------------------------------------------

function SessionInspector({
  session,
  onClose,
  onOpenVehicle,
}: {
  session: ChargingSession
  onClose: () => void
  onOpenVehicle: (vehicleId: string) => void
}) {
  const vehicle = sessionVehicle(session)
  const driver = getDriver(vehicle?.driverId ?? null)
  const s = SESSION_INSPECTOR

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[420px] flex-col overflow-y-auto border-l border-outline-variant bg-surface-container-lowest shadow-level-4">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-space-sm border-b border-outline-variant/40 bg-surface-container-lowest p-space-lg">
          <div className="min-w-0">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Session Inspector{' '}
              <span className="font-telemetry-sm text-telemetry-sm text-primary">#{session.id}</span>
            </h2>
            <p className="font-body-sm text-body-sm truncate text-on-surface-variant">
              {vehicle?.model} · {vehicle?.registration}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close session inspector"
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex flex-col gap-space-md p-space-lg">
          <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-md">
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-label-sm text-label-sm uppercase text-outline">Current Battery SoC</span>
              <Icon name="bolt" className="text-[18px] text-state-ok" />
            </div>
            <p className="font-telemetry-lg text-telemetry-lg tnum font-bold text-primary">{session.socNow}.2 %</p>
            <p className="font-body-sm text-body-sm text-state-ok">{s.socRate}</p>
            <div className="mt-space-sm h-1.5 w-full overflow-hidden rounded-pill bg-surface-container-high">
              <div className="h-full rounded-pill bg-primary" style={{ width: `${session.socNow}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant/40 p-space-md">
            <div className="mb-space-sm flex items-center justify-between gap-space-sm">
              <span className="font-label-sm text-label-sm uppercase text-outline">Pack Thermal Management</span>
              <StatusBadge tone="ok">{s.thermal.state}</StatusBadge>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{s.thermal.detail}</p>
            <div className="font-telemetry-sm text-telemetry-sm mt-space-sm flex flex-wrap items-center gap-space-sm">
              <span className="text-on-surface-variant">Start Temp: {s.thermal.startTempC.toFixed(1)}°C</span>
              <Icon name="arrow_forward" className="text-[14px] text-outline" />
              <span className="font-semibold text-on-surface">Current: {s.thermal.currentTempC.toFixed(1)}°C</span>
              <span className="ml-auto text-outline">Max Threshold: {s.thermal.maxThresholdC}°C</span>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant/40 p-space-md">
            <div className="mb-space-sm flex items-center justify-between gap-space-sm">
              <span className="font-label-sm text-label-sm uppercase text-outline">BMS Cell Voltage Delta (ΔV)</span>
              <span className="font-telemetry-sm text-telemetry-sm font-semibold text-state-ok">{s.cellDelta.value}</span>
            </div>
            <dl className="font-telemetry-sm text-telemetry-sm space-y-1">
              {[s.cellDelta.maxCell, s.cellDelta.minCell].map((c) => (
                <div key={c.label} className="flex items-baseline justify-between gap-space-sm">
                  <dt className="text-on-surface-variant">{c.label}</dt>
                  <dd className="tnum font-semibold text-on-surface">{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-outline-variant/40 p-space-md">
            <p className="font-label-sm text-label-sm mb-space-sm uppercase text-outline">Station & Power Inverter</p>
            <dl className="font-body-sm text-body-sm space-y-1.5">
              {s.station.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-space-sm">
                  <dt className="text-on-surface-variant">{row.label}:</dt>
                  <dd className="font-telemetry-sm text-telemetry-sm shrink-0 text-right font-semibold text-on-surface">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-outline-variant/40 p-space-md">
            <p className="font-label-sm text-label-sm mb-space-sm uppercase text-outline">Linked Asset</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Driver on record: {driver ? driver.name : 'Unassigned'}
            </p>
            <ActionButton
              icon="monitor_heart"
              module="vehicle-telemetry"
              requires="view"
              size="compact"
              className="mt-space-sm w-full justify-center"
              onClick={() => vehicle && onOpenVehicle(vehicle.id)}
            >
              Open {vehicle?.registration} Health Record
            </ActionButton>
          </div>

          <div className="flex flex-col gap-space-sm">
            {s.actions.map((a) => (
              <ActionButton
                key={a.label}
                icon={a.icon}
                variant={a.variant}
                module="charging-sessions"
                className="w-full justify-center"
              >
                {a.label}
              </ActionButton>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}

// --- Authorize remote charge modal ------------------------------------------

function RemoteChargeModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-space-lg backdrop-blur-sm">
      <div className="panel w-full max-w-lg p-space-lg shadow-level-4">
        <div className="mb-space-md flex items-start justify-between gap-space-sm">
          <div className="flex items-start gap-space-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-fixed">
              <Icon name="electric_car" className="text-[22px] text-primary" />
            </span>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-semibold">Authorize Remote Session</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Send an authenticated cloud start trigger to the depot charger inverter. Ensure vehicle connector is
                physically locked.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-space-sm rounded-xl bg-state-ok-fill p-space-lg text-center">
            <Icon name="check_circle" className="text-[32px] text-state-ok" />
            <p className="font-headline-sm text-headline-sm font-semibold text-state-ok-text">Dispense initiated</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Cloud start trigger acknowledged by the dispenser. The session will appear in Active Sessions shortly.
            </p>
            <ActionButton onClick={onClose} className="mt-space-sm">
              Close
            </ActionButton>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-space-md">
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                  Select Depot & Dispenser
                </span>
                <select className="font-body-sm text-body-sm h-10 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {REMOTE_CHARGE_OPTIONS.dispensers.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                  Target Vehicle VIN / Reg Number
                </span>
                <input
                  placeholder="e.g. MH 12 AB 4321 or MAT628004M12948"
                  className="font-body-sm text-body-sm h-10 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Auto-Cutoff SoC</span>
                  <select className="font-body-sm text-body-sm h-10 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm">
                    {REMOTE_CHARGE_OPTIONS.cutoffSoc.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Current Limit</span>
                  <select className="font-body-sm text-body-sm h-10 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm">
                    {REMOTE_CHARGE_OPTIONS.currentLimit.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-space-lg flex justify-end gap-space-sm">
              <ActionButton onClick={onClose}>Cancel</ActionButton>
              <ActionButton
                variant="primary"
                icon="bolt"
                module="charging-sessions"
                onClick={() => setSent(true)}
              >
                Initiate Dispense
              </ActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// --- Page --------------------------------------------------------------------

export function ChargingSessionsPage() {
  const { scope } = useWorkspace()
  const navigate = useNavigate()

  const [depotId, setDepotId] = useState('all')
  const [tab, setTab] = useState<SessionState>('active')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [inspecting, setInspecting] = useState<ChargingSession | null>(null)
  const [authorizing, setAuthorizing] = useState(false)

  function update<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(0)
    }
  }

  const depotCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of DEPOTS) {
      counts[d.id] = CHARGING_SESSIONS_ALL.filter((s) => s.state === 'active' && s.depotId === d.id).length
    }
    return counts
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CHARGING_SESSIONS_ALL.filter((s) => {
      if (s.state !== tab) return false
      if (depotId !== 'all' && s.depotId !== depotId) return false
      if (q) {
        const v = sessionVehicle(s)
        if (!`${s.id} ${s.bay} ${s.dispenser} ${v?.registration ?? ''} ${v?.id ?? ''}`.toLowerCase().includes(q))
          return false
      }
      return true
    })
  }, [tab, depotId, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage = Math.min(page, pageCount - 1)
  const rows = filtered.slice(safePage * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE + ROWS_PER_PAGE)

  /** Only an in-progress session has a live rate; the rest report their mean. */
  const rateColumnLabel =
    tab === 'active' ? 'Live Rate' : tab === 'scheduled' ? 'Rate' : 'Avg Rate'

  const tabs: Array<{ id: SessionState; label: string; dot?: boolean }> = [
    { id: 'active', label: `Active Sessions (${SESSION_TOTALS.active})` },
    { id: 'completed', label: `Completed Today (${SESSION_TOTALS.completed})` },
    { id: 'faulted', label: `Faulted / Terminated (${SESSION_TOTALS.faulted})`, dot: true },
    { id: 'scheduled', label: `Scheduled Dispense (${SESSION_TOTALS.scheduled})` },
  ]

  return (
    <>
      <PageHeader
        title="Charging Sessions"
        breadcrumb="Charging Sessions & Energy Operations"
        actions={
          <>
            <ActionButton icon="tune" module="charging-sessions">
              Tariff & Peak Rules
            </ActionButton>
            <ActionButton icon="download" module="reports-analytics" requires="view">
              Export Session CSV
            </ActionButton>
            <ActionButton
              icon="bolt"
              variant="primary"
              module="charging-sessions"
              onClick={() => setAuthorizing(true)}
            >
              + Authorize Remote Charge
            </ActionButton>
          </>
        }
      />

      {/* Depot node selector */}
      <Panel className="mb-space-md flex flex-wrap items-center gap-space-sm !py-space-sm">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          Depot Node:
        </span>
        <button
          type="button"
          onClick={() => update(setDepotId)('all')}
          className={`font-body-sm text-body-sm whitespace-nowrap rounded-xl px-space-md py-1.5 transition-colors ${
            depotId === 'all'
              ? 'bg-primary font-semibold text-on-primary shadow-level-1'
              : 'border border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
          }`}
        >
          All Depots ({DEPOTS.length})
        </button>
        {DEPOTS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => update(setDepotId)(d.id)}
            className={`font-body-sm text-body-sm whitespace-nowrap rounded-xl px-space-md py-1.5 transition-colors ${
              depotId === d.id
                ? 'bg-primary font-semibold text-on-primary shadow-level-1'
                : 'border border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
            }`}
          >
            {d.name} ({depotCounts[d.id] ?? 0})
          </button>
        ))}

        <span className="font-telemetry-sm text-telemetry-sm ml-auto flex items-center gap-1.5 rounded-xl bg-surface-container-low px-space-md py-1.5 text-on-surface-variant">
          <Icon name="schedule" className="text-[16px]" />
          Time: Today · Last {scope.timeWindow} Real-Time
        </span>
      </Panel>

      <div className="mb-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-5">
        {ENERGY_KPIS.map((kpi) => (
          <EnergyKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="mb-space-md grid grid-cols-1 gap-space-md xl:grid-cols-3">
        <DepotPowerPanel />
        <PortMixPanel />
      </div>

      <Panel padded={false}>
        <div className="flex flex-col gap-space-sm p-space-lg pb-space-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-space-xs">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => update(setTab)(t.id)}
                className={`font-body-sm text-body-sm flex items-center gap-1.5 whitespace-nowrap rounded-xl px-space-md py-2 transition-colors ${
                  tab === t.id
                    ? 'bg-primary font-semibold text-on-primary shadow-level-1'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {t.dot && <span className="h-1.5 w-1.5 rounded-pill bg-state-crit" />}
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="relative min-w-[220px]">
              <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-[16px] text-outline" />
              <input
                value={query}
                onChange={(e) => update(setQuery)(e.target.value)}
                placeholder="Filter Vehicle ID, Bay, Gun..."
                className="font-body-sm text-body-sm h-9 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-8 pr-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <ActionButton icon="filter_alt" size="compact" className="!px-2">
              <span className="sr-only">Advanced filters</span>
            </ActionButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {[
                  { label: 'Session ID', align: 'text-left' },
                  { label: 'Vehicle & Fleet Asset', align: 'text-left' },
                  { label: 'Dispenser Node / Bay', align: 'text-left' },
                  { label: 'Duration', align: 'text-left' },
                  { label: 'SoC Progress', align: 'text-left' },
                  { label: 'Energy', align: 'text-right' },
                  // "Live Rate" is only truthful on the Active tab — a finished
                  // session has no instantaneous draw, so it reports the mean.
                  { label: rateColumnLabel, align: 'text-right' },
                  { label: 'Cost', align: 'text-right' },
                  { label: 'Status', align: 'text-left' },
                  { label: 'Inspect', align: 'text-center' },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm uppercase text-on-surface-variant ${h.align}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((s) => {
                const vehicle = sessionVehicle(s)
                const meta = STATUS_META[s.status]
                const faulty = s.status === 'thermal-throttled' || s.status === 'terminated'

                return (
                  <tr
                    key={s.id}
                    onClick={() => setInspecting(s)}
                    className={`cursor-pointer border-b border-surface-container-high transition-colors hover:bg-surface ${
                      faulty ? 'bg-state-crit-fill/30' : ''
                    }`}
                  >
                    <td className="px-space-md py-space-md align-top">
                      <span
                        className={`font-telemetry-sm text-telemetry-sm font-semibold ${
                          faulty ? 'text-state-crit' : 'text-primary'
                        }`}
                      >
                        #{s.id}
                      </span>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p className="font-body-md text-body-md font-semibold text-on-surface">
                        {vehicle?.registration}
                      </p>
                      <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                        {vehicle?.model} · {vehicle?.fleetType}
                      </p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p className="font-body-sm text-body-sm text-on-surface">{s.bay}</p>
                      <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">{s.dispenser}</p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p className="font-telemetry-sm text-telemetry-sm text-on-surface">{s.durationLabel}</p>
                      <p
                        className={`font-telemetry-sm text-telemetry-sm ${
                          faulty ? 'text-state-crit' : 'text-on-surface-variant'
                        }`}
                      >
                        {s.durationNote}
                      </p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <div className="font-telemetry-sm text-telemetry-sm tnum flex items-center gap-1.5">
                        <span className="text-on-surface-variant">{s.socStart}%</span>
                        <Icon name="arrow_forward" className="text-[12px] text-outline" />
                        <span
                          className={`font-semibold ${s.status === 'thermal-throttled' ? 'text-state-warn' : 'text-primary'}`}
                        >
                          {s.socNow}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-pill bg-surface-container-high">
                        <div
                          className={`h-full rounded-pill ${
                            s.status === 'thermal-throttled'
                              ? 'bg-state-warn'
                              : s.status === 'top-off-balancing'
                                ? 'bg-state-ok'
                                : 'bg-primary'
                          }`}
                          style={{ width: `${s.socNow}%` }}
                        />
                      </div>
                    </td>

                    <td className="font-telemetry-md text-telemetry-md tnum px-space-md py-space-md text-right align-top">
                      {s.energyKwh.toFixed(2)}
                      <span className="font-body-sm text-body-sm block text-on-surface-variant">kWh</span>
                    </td>

                    {/* A finished session has no live draw — show the mean rate,
                        which is what reconciles with the energy and cost columns. */}
                    <td className="px-space-md py-space-md text-right align-top">
                      {s.state === 'scheduled' ? (
                        <p className="font-telemetry-md text-telemetry-md tnum text-outline">—</p>
                      ) : (
                        <p
                          className={`font-telemetry-md text-telemetry-md tnum font-semibold ${
                            s.status === 'thermal-throttled' ? 'text-state-warn' : 'text-primary'
                          }`}
                        >
                          {s.state === 'active' ? s.liveRateKw.toFixed(1) : s.avgRateKw.toFixed(1)} kW
                          {s.state !== 'active' && (
                            <span className="font-body-sm text-body-sm ml-1 font-normal text-on-surface-variant">
                              avg
                            </span>
                          )}
                        </p>
                      )}
                      <p
                        className={`font-telemetry-sm text-telemetry-sm ${
                          s.status === 'thermal-throttled' ? 'text-state-crit' : 'text-on-surface-variant'
                        }`}
                      >
                        {s.rateNote}
                      </p>
                    </td>

                    <td className="px-space-md py-space-md text-right align-top">
                      <p className="font-telemetry-md text-telemetry-md tnum font-semibold text-on-surface">
                        ₹{s.costInr.toFixed(2)}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{s.tariffTier}</p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <StatusBadge tone={meta.tone} pulse={s.state === 'active'}>
                        {meta.label}
                      </StatusBadge>
                      {s.faultReason && (
                        <p className="font-body-sm text-body-sm mt-1 max-w-[220px] text-state-crit">{s.faultReason}</p>
                      )}
                    </td>

                    <td className="px-space-md py-space-md text-center align-top" onClick={(e) => e.stopPropagation()}>
                      <ActionButton
                        variant="ghost"
                        icon="visibility"
                        module="charging-sessions"
                        requires="view"
                        size="compact"
                        className="!px-2"
                        onClick={() => setInspecting(s)}
                      >
                        <span className="sr-only">Inspect session {s.id}</span>
                      </ActionButton>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {rows.length === 0 && (
            <EmptyState
              icon="ev_station"
              title="No sessions in this view"
              body="Clear the filter or select a different depot node or session state."
            />
          )}
        </div>

        <div className="font-body-sm text-body-sm flex flex-wrap items-center justify-between gap-space-sm p-space-lg text-on-surface-variant">
          <span>
            Showing <strong className="text-on-surface">{filtered.length === 0 ? 0 : safePage * ROWS_PER_PAGE + 1}</strong>{' '}
            to <strong className="text-on-surface">{safePage * ROWS_PER_PAGE + rows.length}</strong> of{' '}
            <strong className="text-on-surface">{filtered.length}</strong> sessions
            <span className="ml-space-md text-outline">Polling rate: 1,000ms</span>
          </span>

          <span className="flex items-center gap-space-sm">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              className="rounded-lg px-space-sm py-1 transition-colors enabled:hover:bg-surface-container disabled:text-outline"
            >
              Previous
            </button>
            <span className="font-telemetry-sm text-telemetry-sm">
              Page {safePage + 1} of {pageCount}
            </span>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
              className="rounded-lg px-space-sm py-1 transition-colors enabled:hover:bg-surface-container disabled:text-outline"
            >
              Next
            </button>
          </span>
        </div>
      </Panel>

      {inspecting && (
        <SessionInspector
          session={inspecting}
          onClose={() => setInspecting(null)}
          onOpenVehicle={(vehicleId) => navigate(`/vehicles-health/${vehicleId}`)}
        />
      )}
      {authorizing && <RemoteChargeModal onClose={() => setAuthorizing(false)} />}
    </>
  )
}
